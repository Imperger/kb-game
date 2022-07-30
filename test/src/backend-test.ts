import Crypto from 'crypto';
import { sign } from 'jsonwebtoken';

import { Api } from "./api-interface";
import { ApiTester, ApiTestResult } from "./api-tester";
import { RejectedResponse } from './api/types';
import { delay } from './delay';
import { Logger } from "./logger";
import { Mailbox } from './mailbox';

const user = { cred: { username: '', email: '', password: '' }, token: '' };

function genUser() {
    user.cred.username = Crypto.randomBytes(7).toString('hex');
    user.cred.email = `${user.cred.username}@dev.wsl`;
    user.cred.password = '1234567890';
}

async function signinInvalidCreds(api: Api, logger: Logger): Promise<boolean> {
    genUser();

    const tester = new ApiTester(logger);
    const login = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        'Signin with invalid credentials')
        .status(401)
        .toPromise();

    return login.pass;
}

async function registrationFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    const registered = await tester.test(
        () => api.backend.register(user.cred),
        'Register new user')
        .status(201)
        .toPromise();

    if (!registered.pass) {
        return false;
    }

    const signinUnconfirmed = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        'Signin to unconfirmed account'
    )
        .status(401)
        .toPromise();

    // Make user confirmation time expired
    await api.mongo.collection('users').updateOne({ email: user.cred.email }, { $set: { createdAt: new Date(0) } });

    const signinExpiredConfirmation = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        'Signin to expired account'
    )
        .status(401)
        .toPromise();

    // Make confirmation time valid again
    await api.mongo.collection('users').updateOne({ email: user.cred.email }, { $set: { createdAt: new Date() } });


    const mailbox = new Mailbox('http://mail.dev.wsl:1080');

    let confirmLetter = null;
    for (let retries = 20; confirmLetter === null && retries > 0; --retries) {
        confirmLetter = await mailbox.findByDestination(user.cred.email);

        await delay(2500);
    }

    if (confirmLetter === null) {
        logger.error('FAIL /register should sent confirmation letter');
        return false;
    }

    const [, token] = /https*:\/\/.+\/registration\/confirm\/([a-zA-Z0-9\._-]+)/.exec(confirmLetter.html) ?? [null, null];

    if (!token) {
        logger.error('FAIL /register confirmation letter should contain confirm url');
        return false;
    }

    user.token = token;

    const confirmRegistration = await tester.test(
        () => api.backend.confirmRegistration(token),
        'Confirm registration'
    )
        .status(200)
        .toPromise();

    return signinUnconfirmed.pass &&
        signinExpiredConfirmation.pass &&
        confirmRegistration.pass;
}

async function signinFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    const signinByUsername = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        'Signin with valid credentials by username')
        .status(200)
        .response(x => x.token?.length > 0)
        .toPromise();

    const signinByEmail = await tester.test(
        () => api.backend.loginEmail(user.cred.email, user.cred.password),
        'Signin with valid credentials by email')
        .status(200)
        .response(x => x.token?.length > 0)
        .toPromise();

    return signinByUsername.pass && signinByEmail.pass;
}

async function registerWithSameCreds(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    const alreadyTakenUsername = await tester.test(() => api.backend.register(
        {
            username: user.cred.username,
            email: `uniq_${user.cred.email}`,
            password: user.cred.password
        }),
        'Signup with already taken username')
        .status(409)
        .toPromise();

    const alreadyTakenEmail = await tester.test(() => api.backend.register(
        {
            username: `u_${user.cred.username}`,
            email: user.cred.email,
            password: user.cred.password
        }),
        'Signup with already taken email')
        .status(409)
        .toPromise();

    return alreadyTakenUsername.pass && alreadyTakenEmail.pass;
}

async function confirmRegistrationUnsuccess(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    const token = sign({ id: '600000000000000000000000' }, '12345_', { expiresIn: '24h' });

    const unexistUserConfirm = await tester.test(
        () => api.backend.confirmRegistration(token),
        'Confirm registration for unexist user')
        .status(409)
        .toPromise();

    const alreadyConfirmed = await tester.test(
        () => api.backend.confirmRegistration(user.token),
        'Confirm registration for already confirmed user')
        .status(409)
        .toPromise();

    return unexistUserConfirm.pass && alreadyConfirmed.pass;
}

async function fetchUserInfo(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    const userInfo = await tester.test(
        () => api.backend.me(),
        'Fetch current user info')
        .status(200)
        .response(x => x.username === user.cred.username && x.email === user.cred.email)
        .toPromise();

    return userInfo.pass;
}

async function gameFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    await api.backend.addSpawner('https://spawner.dev.wsl:3001', '12345');

    const emptyGameList = await tester.test(
        () => api.backend.listGames(),
        'Fetch game list')
        .status(200)
        .response(x => Array.isArray(x) && x.length === 0)
        .toPromise();

    const createCustomGame = await tester.test(
        () => api.backend.newCustomGame(),
        'Create custom game'
    )
        .status(201)
        .response(x => x.instanceUrl?.length > 0 && x.playerToken?.length > 0)
        .toPromise();

    const reRequestCustomGame = await tester.test(
        () => api.backend.newCustomGame(),
        'Re-create custom game'
    )
        .status(400)
        .toPromise();

    const conenctToCustomGame = await tester.test(
        () => api.backend.connectToGame({ instanceUrl: createCustomGame.data.instanceUrl }),
        'Connect to custom game'
    )
        .status(201)
        .response(x => x.playerToken?.length > 0)
        .toPromise();

    const connectToCustomGameWithInvalidInstanceUrl = await tester.test(
        () => api.backend.connectToGame({ instanceUrl: 'https://invalid_spawner.dev.wsl/12345' }),
        'Connect to custom game with invalid instance url'
    )
        .status(400)
        .toPromise();

    const gameList = await tester.test(
        () => api.backend.listGames(),
        'Fetch game list')
        .status(200)
        .response(x => Array.isArray(x) && x.length >= 1)
        .toPromise();

    await api.backend.removeSpawner('https://spawner.dev.wsl:3001');

    return emptyGameList.pass &&
        createCustomGame.pass &&
        reRequestCustomGame.pass &&
        conenctToCustomGame.pass &&
        connectToCustomGameWithInvalidInstanceUrl.pass &&
        gameList.pass;
}

async function scenarioFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    await api.mongo.collection('users')
        .updateOne({ email: user.cred.email }, { $set: { 'scopes.editScenario': true } });

    const scenario = { id: '', title: 'Sample title', text: 'Scenario content' };

    const newScenario = await tester.test(
        () => api.backend.addScenario(scenario.title, scenario.text),
        'Add new scenario')
        .status(201)
        .response(x => typeof x === 'string')
        .toPromise();

    scenario.id = newScenario.data;

    const updatedScenario = { title: 'Updated title', text: 'Updated scenario content' };

    const updateScenario = await tester.test(
        () => api.backend.updateScenario(scenario.id, updatedScenario),
        'Update scenario')
        .status(200)
        .response(x => x === true)
        .toPromise();

    const scenarioContent = await tester.test(
        () => api.backend.getScenarioContent(scenario.id),
        'Fetch scenario content')
        .status(200)
        .response(x => x.title === updatedScenario.title && x.text === updatedScenario.text)
        .toPromise();

    const scenarioList = await tester.test(
        () => api.backend.listScenario(0, 25),
        'List scenarios')
        .status(200)
        .response(x => x.total >= 1 &&
            (
                x.total > 25 ||
                x.scenarios.some(x => x.title === updatedScenario.title && x.text === updatedScenario.text)
            ))
        .toPromise();

    const knownSpawner = {
        url: 'https://spawner.dev.wsl:3001',
        secret: '12345'
    };

    try {
        const a = await api.backend.addSpawner(knownSpawner.url, knownSpawner.secret)
    } catch (e) {
    }

    const token = sign({ spawner: knownSpawner.url }, knownSpawner.secret);

    const allTitles = await tester.test(
        () => api.backend.getAllScenarioTitles(token),
        'Fetch all scenarios')
        .status(200)
        .response(x => Array.isArray(x) && x.length >= 1)
        .toPromise();

    const scenarioText = await tester.test(
        () => api.backend.getScenarioText(scenario.id, token),
        'Fetch scenario text')
        .status(200)
        .response(x => x.text === updatedScenario.text)
        .toPromise();

    const removeScenario = await tester.test(
        () => api.backend.removeScenario(scenario.id),
        'Remove scenario')
        .status(200)
        .response(x => x === true)
        .toPromise();

    try {
        await api.backend.removeSpawner(knownSpawner.url)
    } catch (e) {

    }

    return newScenario.pass &&
        updateScenario.pass &&
        scenarioContent.pass &&
        scenarioList.pass &&
        allTitles.pass &&
        scenarioText.pass &&
        removeScenario.pass;
}

export enum SpawnerStatusCode {
    Ok = 0,
    UnknownError = 100,
    SpawnerAlreadyAdded,
    HostNotResponse,
    HostNotFound,
    WrongSecret,
    RequestInstanceFailed,
    ListGameFailed,
};

interface BadTestcase {
    name: string,
    url: string,
    secret: string,
    expected: SpawnerStatusCode
}

async function spawnerFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    await api.mongo.collection('users')
        .updateOne({ email: user.cred.email }, { $set: { 'scopes.serverMaintainer': true } });


    const badTestcases: BadTestcase[] = [
        {
            name: 'unreachable',
            url: 'https://unreachable.lan',
            secret: '',
            expected: SpawnerStatusCode.HostNotFound
        },
        {
            name: 'reject connection',
            url: 'https://spawner.dev.wsl:5000',
            secret: '',
            expected: SpawnerStatusCode.HostNotResponse
        },
        {
            name: 'wrong secret',
            url: 'https://spawner.dev.wsl:3001',
            secret: '11111',
            expected: SpawnerStatusCode.WrongSecret
        }
    ];

    const addSpawnerTest = (test: BadTestcase) =>
        tester.test(
            () => api.backend.addSpawner(test.url, test.secret),
            `Add spawner '${test.name}'`)
            .status(400)
            .response(x => x.code === test.expected)
            .toPromise();


    const badSpawners = (await Promise.allSettled(badTestcases.map(x => addSpawnerTest(x))))
        .every(x => (x as { value: ApiTestResult<RejectedResponse> }).value.pass);

    const validSpawner = await tester.test(
        () => api.backend.addSpawner('https://spawner.dev.wsl:3001', '12345'),
        'Add valid spawner')
        .status(201)
        .toPromise();

    const alreadyAddedSpawner = await tester.test(
        () => api.backend.addSpawner('https://spawner.dev.wsl:3001', '12345'),
        'Add already added spawner')
        .status(409)
        .response(x => x.code === 101)
        .toPromise();

    const listSpawners = await tester.test(
        () => api.backend.listSpawners(),
        'List spawners')
        .status(200)
        .response(x => Array.isArray(x) && x.length >= 1)
        .toPromise();

    const removeSpawner = await tester.test(
        () => api.backend.removeSpawner('https://spawner.dev.wsl:3001'),
        'Remove spawner')
        .status(200)
        .toPromise();

    return badSpawners &&
        validSpawner.pass &&
        alreadyAddedSpawner.pass &&
        listSpawners.pass &&
        removeSpawner.pass;
}

async function linkPlayerFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    const knownSpawner = {
        url: 'https://spawner.dev.wsl:3001',
        secret: '12345'
    };

    const playerId = (await api.mongo.collection('users').findOne({ username: user.cred.username }))?.player.toString();
    await api.backend.addSpawner(knownSpawner.url, knownSpawner.secret);
    const token = sign({ spawner: knownSpawner.url }, knownSpawner.secret);
    const instanceUrl = `${knownSpawner.url}/random_instance_id`;

    const linkedGame = await tester.test(
        () => api.backend.linkGamePlayer(playerId, instanceUrl, token),
        'Link game to player')
        .status(200)
        .response(true)
        .toPromise();

    const linkAlreadyLinked = await tester.test(
        () => api.backend.linkGamePlayer(playerId, `${instanceUrl}0`, token),
        'Link to already linked')
        .status(200)
        .response(false)
        .toPromise();

    const unlinkGame = await tester.test(
        () => api.backend.unlinkGamePlayer(playerId, token),
        'Unlink game from player')
        .status(200)
        .response(true)
        .toPromise();

    await api.backend.linkGamePlayer(playerId, instanceUrl, token);

    const unlinkAll = await tester.test(
        () => api.backend.unlinkGamePlayers(instanceUrl, token),
        'Unlink game from all')
        .status(200)
        .response(true)
        .toPromise();

    await api.backend.removeSpawner(knownSpawner.url);

    return linkedGame.pass &&
        linkAlreadyLinked.pass &&
        unlinkGame.pass &&
        unlinkAll.pass;

}

export async function testBackend(api: Api,): Promise<boolean> {
    const logger = new Logger('Backend');

    let success = true;
    success = await signinInvalidCreds(api, logger) && success;
    success = await registrationFlow(api, logger) && success;
    success = await signinFlow(api, logger) && success;
    success = await registerWithSameCreds(api, logger) && success
    success = await confirmRegistrationUnsuccess(api, logger) && success;

    success = await fetchUserInfo(api, logger) && success;

    success = await spawnerFlow(api, logger) && success;

    success = await linkPlayerFlow(api, logger) && success;

    success = await gameFlow(api, logger) && success;

    success = await scenarioFlow(api, logger) && success;

    return success;
}