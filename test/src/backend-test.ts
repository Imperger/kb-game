import Crypto from 'crypto';

import { AxiosResponse } from 'axios';
import { sign } from 'jsonwebtoken';
import { first } from 'rxjs/operators';

import { BackendApi, DateCondition, ReplaysOverview } from './api/backend-api';
import { RejectedResponse } from './api/types';
import { Api } from './api-interface';
import { ApiTester, ApiTestResult } from './api-tester';
import { delay } from './delay';
import { GameClient } from './gameplay/game-client';
import { DateModifier, GoogleIdentity, IdToken } from './google-identity';
import { Logger } from './logger';
import { Mailbox } from './mailbox';


function genUser() {
  const id = Crypto.randomBytes(7).toString('hex');

  return {
    username: id,
    email: `${id}@dev.wsl`,
    password: '1234567890'
  };
}

function genGoogleIdTokenPayload(aud: string): IdToken {
  const noise = Crypto.randomBytes(7).toString('hex');

  return {
    iss: 'https://accounts.google.com',
    nbf: Math.round(Date.now() / 1000 - 3600),
    aud: aud,
    sub: `111111111111111111111_${noise}`,
    email: `johndoe_${noise}@gmail.com`,
    email_verified: true,
    azp: aud,
    name: `John Doe_${noise}`,
    picture: 'https://lh3.googleusercontent.com/a/12345',
    given_name: `John_${noise}`,
    family_name: `Doe_${noise}`,
    iat: Math.round(Date.now() / 1000),
    exp: Math.round(Date.now() / 1000 + 86400),
    jti: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  };
}

const user = { cred: genUser(), token: '' };

async function dtoValidation(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const emptyPayload = await tester
    .test(
      () =>
        api.backend.raw({
          method: 'post',
          url: '/auth/register',
          headers: { 'Content-Type': 'text/plain' }
        }),
      'Empty dto'
    )
    .status(400)
    .toPromise();

  const invalidPayload = await tester
    .test(
      () => api.backend.register({ abcdefg_42: '42' } as any),
      'Invalid dto'
    )
    .status(400)
    .toPromise();

  return emptyPayload.pass && invalidPayload.pass;
}

async function googleAuthFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const gi = new GoogleIdentity();

  await gi.init();

  const aud = process.env.GOOGLE_CLIENT_ID ?? '';

  if (!aud) {
    logger.error('Missing GOOGLE_CLIENT_ID env variable');
    return false;
  }

  const withoutIdToken = await tester
    .test(
      () =>
        api.backend.raw({
          method: 'post',
          url: '/auth/register/google',
          headers: { 'Content-Type': 'application/json' },
          data: { unexpectedIdToken: '12345' }
        }),
      'Missing id token'
    )
    .status(401)
    .toPromise();

  const token = genGoogleIdTokenPayload(aud);

  const loginValidTokenNonExistUser = await tester
    .test(
      () =>
        api.backend.loginGoogle(
          gi.signIdTokenAndModifyDate(token, DateModifier.Valid)
        ),
      'Login with valid google id token but unknown user'
    )
    .status(401)
    .toPromise();

  const signupExpired = await tester
    .test(
      () =>
        api.backend.registerGoogle(
          gi.signIdTokenAndModifyDate(token, DateModifier.Expired)
        ),
      'Signup with expired google id token'
    )
    .status(401)
    .toPromise();

  const signupNotValidBefore = await tester
    .test(
      () =>
        api.backend.registerGoogle(
          gi.signIdTokenAndModifyDate(token, DateModifier.NotValidBefore)
        ),
      'Signup with not valid before google id token'
    )
    .status(401)
    .toPromise();

  const signupUnsuitableAudience = await tester
    .test(
      () =>
        api.backend.registerGoogle(gi.signIdTokenAndSetInvalidAudiene(token)),
      'Signup with unsuitable audience in google id token'
    )
    .status(401)
    .toPromise();

  const signupValid = await tester
    .test(
      () =>
        api.backend.registerGoogle(
          gi.signIdTokenAndModifyDate(token, DateModifier.Valid)
        ),
      'Signup with valid google id token'
    )
    .status(201)
    .toPromise();

  const sameEmailToken = { ...token };
  sameEmailToken.sub += '_';

  const signupExistingEmail = await tester
    .test(
      () =>
        api.backend.registerGoogle(
          gi.signIdTokenAndModifyDate(sameEmailToken, DateModifier.Valid)
        ),
      'Signup with google id token that contain an already registered email'
    )
    .status(409)
    .toPromise();

  const sameSub = { ...token };
  sameSub.email += '_';

  const signupExistingSub = await tester
    .test(
      () =>
        api.backend.registerGoogle(
          gi.signIdTokenAndModifyDate(sameSub, DateModifier.Valid)
        ),
      'Signup with google id token that contain an already registered google id'
    )
    .status(409)
    .toPromise();

  const loginExpired = await tester
    .test(
      () =>
        api.backend.loginGoogle(
          gi.signIdTokenAndModifyDate(token, DateModifier.Expired)
        ),
      'Login with expired google id token'
    )
    .status(401)
    .toPromise();

  const loginNotValidBefore = await tester
    .test(
      () =>
        api.backend.loginGoogle(
          gi.signIdTokenAndModifyDate(token, DateModifier.NotValidBefore)
        ),
      'Login with not valid before google id token'
    )
    .status(401)
    .toPromise();

  const loginГnsuitableAudience = await tester
    .test(
      () => api.backend.loginGoogle(gi.signIdTokenAndSetInvalidAudiene(token)),
      'Login with unsuitable audience in google id token'
    )
    .status(401)
    .toPromise();

  const loginValid = await tester
    .test(
      () =>
        api.backend.loginGoogle(
          gi.signIdTokenAndModifyDate(token, DateModifier.Valid)
        ),
      'Login with valid google id token'
    )
    .status(200)
    .toPromise();

  return (
    withoutIdToken.pass &&
    loginValidTokenNonExistUser.pass &&
    signupExpired.pass &&
    signupNotValidBefore.pass &&
    signupUnsuitableAudience.pass &&
    signupValid.pass &&
    signupExistingEmail.pass &&
    signupExistingSub.pass &&
    loginExpired.pass &&
    loginNotValidBefore.pass &&
    loginГnsuitableAudience.pass &&
    loginValid.pass
  );
}

async function signinInvalidCreds(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);
  const login = await tester
    .test(
      () => api.backend.loginUsername(user.cred.username, user.cred.password),
      'Signin with invalid credentials'
    )
    .status(401)
    .toPromise();

  return login.pass;
}

async function getConfirmationToken(destination: string): Promise<string> {
  const mailbox = new Mailbox('http://mail.dev.wsl:1080');

  let confirmLetter = null;
  for (let retries = 20; confirmLetter === null && retries > 0; --retries) {
    confirmLetter = await mailbox.findByDestination(destination);

    await delay(2500);
  }

  if (confirmLetter === null) {
    throw new Error('FAIL /register should sent confirmation letter');
  }

  const [, token] =
    /https*:\/\/.+\/registration\/confirm\/([a-zA-Z0-9._-]+)/.exec(
      confirmLetter.html
    ) ?? [null, null];

  if (!token) {
    throw new Error(
      'FAIL /register confirmation letter should contain confirm url'
    );
  }

  return token;
}

async function registrationFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const registered = await tester
    .test(() => api.backend.register(user.cred), 'Register new user')
    .status(201)
    .toPromise();

  if (!registered.pass) {
    return false;
  }

  const signinUnconfirmed = await tester
    .test(
      () => api.backend.loginUsername(user.cred.username, user.cred.password),
      'Signin to unconfirmed account'
    )
    .status(401)
    .toPromise();

  // Make user confirmation time expired
  await api.mongo
    .collection('users')
    .updateOne(
      { email: user.cred.email },
      { $set: { createdAt: new Date(0) } }
    );

  const signinExpiredConfirmation = await tester
    .test(
      () => api.backend.loginUsername(user.cred.username, user.cred.password),
      'Signin to expired account'
    )
    .status(401)
    .toPromise();

  // Make confirmation time valid again
  await api.mongo
    .collection('users')
    .updateOne({ email: user.cred.email }, { $set: { createdAt: new Date() } });

  try {
    user.token = await getConfirmationToken(user.cred.email);
  } catch (e) {
    logger.error((e as Error).message);
  }

  const confirmRegistration = await tester
    .test(
      () => api.backend.confirmRegistration(user.token),
      'Confirm registration'
    )
    .status(200)
    .toPromise();

  return (
    signinUnconfirmed.pass &&
    signinExpiredConfirmation.pass &&
    confirmRegistration.pass
  );
}

async function signinFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const signinByUsername = await tester
    .test(
      () => api.backend.loginUsername(user.cred.username, user.cred.password),
      'Signin with valid credentials by username'
    )
    .status(200)
    .response(x => x.token?.length > 0)
    .toPromise();

  const signinByEmail = await tester
    .test(
      () => api.backend.loginEmail(user.cred.email, user.cred.password),
      'Signin with valid credentials by email'
    )
    .status(200)
    .response(x => x.token?.length > 0)
    .toPromise();

  return signinByUsername.pass && signinByEmail.pass;
}

async function registerWithSameCreds(
  api: Api,
  logger: Logger
): Promise<boolean> {
  const tester = new ApiTester(logger);

  const alreadyTakenUsername = await tester
    .test(
      () =>
        api.backend.register({
          username: user.cred.username,
          email: `uniq_${user.cred.email}`,
          password: user.cred.password
        }),
      'Signup with already taken username'
    )
    .status(409)
    .toPromise();

  const alreadyTakenEmail = await tester
    .test(
      () =>
        api.backend.register({
          username: `u_${user.cred.username}`,
          email: user.cred.email,
          password: user.cred.password
        }),
      'Signup with already taken email'
    )
    .status(409)
    .toPromise();

  return alreadyTakenUsername.pass && alreadyTakenEmail.pass;
}

async function confirmRegistrationUnsuccess(
  api: Api,
  logger: Logger
): Promise<boolean> {
  const tester = new ApiTester(logger);

  const token = sign({ id: '600000000000000000000000' }, '12345_', {
    expiresIn: '24h'
  });

  const unexistUserConfirm = await tester
    .test(
      () => api.backend.confirmRegistration(token),
      'Confirm registration for unexist user'
    )
    .status(409)
    .toPromise();

  const alreadyConfirmed = await tester
    .test(
      () => api.backend.confirmRegistration(user.token),
      'Confirm registration for already confirmed user'
    )
    .status(409)
    .toPromise();

  return unexistUserConfirm.pass && alreadyConfirmed.pass;
}

async function fetchUserInfo(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const userInfo = await tester
    .test(() => api.backend.me(), 'Fetch current user info')
    .status(200)
    .response(
      x => x.username === user.cred.username && x.email === user.cred.email
    )
    .toPromise();

  return userInfo.pass;
}

async function playerStatsFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const malformedNickname = await tester
    .test(
      () => api.backend.getPlayerStats('invalid_username'),
      'Fetch player stats using an malformed nickname'
    )
    .status(400)
    .toPromise();

  const unknownNickname = await tester
    .test(
      () => api.backend.getPlayerStats('username_999'),
      'Fetch player stats using an unknown nickname'
    )
    .status(404)
    .toPromise();

  const currentPlayer = await tester
    .test(
      () => api.backend.currentPlayerStats(),
      'Fetch the current player stats'
    )
    .status(200)
    .toPromise();

  const knownNickname = await tester
    .test(
      () =>
        api.backend.getPlayerStats(
          `${currentPlayer.data.nickname}_${currentPlayer.data.discriminator}`
        ),
      'Fetch player stats using an known nickname'
    )
    .status(200)
    .response(currentPlayer.data)
    .toPromise();

  return (
    malformedNickname.pass &&
    unknownNickname.pass &&
    currentPlayer.pass &&
    knownNickname.pass
  );
}

async function gameFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  await api.backend.addSpawner('https://spawner.dev.wsl:3001', '12345');

  const emptyGameList = await tester
    .test(() => api.backend.listGames(), 'Fetch game list')
    .status(200)
    .response(x => Array.isArray(x) && x.length === 0)
    .toPromise();

  const createCustomGame = await tester
    .test(() => api.backend.newCustomGame(), 'Create custom game')
    .status(201)
    .response(x => x.instanceUrl?.length > 0 && x.playerToken?.length > 0)
    .toPromise();

  const reRequestCustomGame = await tester
    .test(() => api.backend.newCustomGame(), 'Re-create custom game')
    .status(400)
    .toPromise();

  const conenctToCustomGame = await tester
    .test(
      () =>
        api.backend.connectToGame({
          instanceUrl: createCustomGame.data.instanceUrl
        }),
      'Connect to custom game'
    )
    .status(201)
    .response(x => x.playerToken?.length > 0)
    .toPromise();

  const connectToCustomGameWithInvalidInstanceUrl = await tester
    .test(
      () =>
        api.backend.connectToGame({
          instanceUrl: 'https://invalid_spawner.dev.wsl/12345'
        }),
      'Connect to custom game with invalid instance url'
    )
    .status(400)
    .toPromise();

  const gameList = await tester
    .test(() => api.backend.listGames(), 'Fetch game list')
    .status(200)
    .response(x => Array.isArray(x) && x.length >= 1)
    .toPromise();

  await api.backend.removeSpawner('https://spawner.dev.wsl:3001');

  return (
    emptyGameList.pass &&
    createCustomGame.pass &&
    reRequestCustomGame.pass &&
    conenctToCustomGame.pass &&
    connectToCustomGameWithInvalidInstanceUrl.pass &&
    gameList.pass
  );
}

async function scenarioFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const scenario = { id: '', title: 'Sample title', text: 'Scenario content' };

  const newScenarioWithoutPermission = await tester
    .test(
      () => api.backend.addScenario(scenario.title, scenario.text),
      'Add new scenario without the permission'
    )
    .status(403)
    .toPromise();

  await api.mongo
    .collection('users')
    .updateOne(
      { email: user.cred.email },
      { $set: { 'scopes.editScenario': true } }
    );

  const newScenario = await tester
    .test(
      () => api.backend.addScenario(scenario.title, scenario.text),
      'Add new scenario'
    )
    .status(201)
    .response(x => typeof x === 'string')
    .toPromise();

  scenario.id = newScenario.data;

  const updatedScenario = {
    title: 'Updated title',
    text: 'Updated scenario content'
  };

  const updateScenario = await tester
    .test(
      () => api.backend.updateScenario(scenario.id, updatedScenario),
      'Update scenario'
    )
    .status(200)
    .response(x => x === true)
    .toPromise();

  const scenarioContent = await tester
    .test(
      () => api.backend.getScenarioContent(scenario.id),
      'Fetch scenario content'
    )
    .status(200)
    .response(
      x =>
        x.title === updatedScenario.title && x.text === updatedScenario.text
    )
    .toPromise();

  const scenarioList = await tester
    .test(() => api.backend.listScenario(0, 25), 'List scenarios')
    .status(200)
    .response(
      x =>
        x.total >= 1 &&
        (x.total > 25 ||
          x.scenarios.some(
            x =>
              x.title === updatedScenario.title &&
              x.text === updatedScenario.text
          ))
    )
    .toPromise();

  const knownSpawner = {
    url: 'https://spawner.dev.wsl:3001',
    secret: '12345'
  };

  try {
    await api.backend.addSpawner(knownSpawner.url, knownSpawner.secret);
  } catch (e) {
    // Network error
  }

  const token = sign({ spawner: knownSpawner.url }, knownSpawner.secret);

  const allTitles = await tester
    .test(() => api.backend.getAllScenarioTitles(token), 'Fetch all scenarios')
    .status(200)
    .response(x => Array.isArray(x) && x.length >= 1)
    .toPromise();

  const scenarioText = await tester
    .test(
      () => api.backend.getScenarioText(scenario.id, token),
      'Fetch scenario text'
    )
    .status(200)
    .response(x => x.text === updatedScenario.text)
    .toPromise();

  const removeScenario = await tester
    .test(() => api.backend.removeScenario(scenario.id), 'Remove scenario')
    .status(204)
    .toPromise();

  const removeLastScenario = await tester
    .test(
      () =>
        api.backend.removeScenario(
          scenarioList.data.scenarios.find(x => x.id !== scenario.id)?.id ??
            ''
        ),
      'Remove last scenario'
    )
    .status(409)
    .toPromise();

  try {
    await api.backend.removeSpawner(knownSpawner.url);
  } catch (e) {
    // Network error
  }

  return (
    newScenarioWithoutPermission.pass &&
    newScenario.pass &&
    updateScenario.pass &&
    scenarioContent.pass &&
    scenarioList.pass &&
    allTitles.pass &&
    scenarioText.pass &&
    removeScenario.pass &&
    removeLastScenario.pass
  );
}

export enum SpawnerStatusCode {
  Ok = 0,
  UnknownError = 100,
  SpawnerAlreadyAdded,
  HostNotResponse,
  HostNotFound,
  WrongSecret,
  RequestInstanceFailed,
  ListGameFailed
}

interface BadTestcase {
  name: string;
  url: string;
  secret: string;
  expected: SpawnerStatusCode;
}

async function spawnerFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  await api.mongo
    .collection('users')
    .updateOne(
      { email: user.cred.email },
      { $set: { 'scopes.serverMaintainer': true } }
    );

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
    tester
      .test(
        () => api.backend.addSpawner(test.url, test.secret),
        `Add spawner '${test.name}'`
      )
      .status(400)
      .response(x => x.code === test.expected)
      .toPromise();

  const badSpawners = (
    await Promise.allSettled(badTestcases.map(x => addSpawnerTest(x)))
  ).every(x => (x as { value: ApiTestResult<RejectedResponse> }).value.pass);

  const validSpawner = await tester
    .test(
      () => api.backend.addSpawner('https://spawner.dev.wsl:3001', '12345'),
      'Add valid spawner'
    )
    .status(201)
    .toPromise();

  const alreadyAddedSpawner = await tester
    .test(
      () => api.backend.addSpawner('https://spawner.dev.wsl:3001', '12345'),
      'Add already added spawner'
    )
    .status(409)
    .response(x => x.code === 101)
    .toPromise();

  const listSpawners = await tester
    .test(() => api.backend.listSpawners(), 'List spawners')
    .status(200)
    .response(x => Array.isArray(x) && x.length >= 1)
    .toPromise();

  const removeSpawner = await tester
    .test(
      () => api.backend.removeSpawner('https://spawner.dev.wsl:3001'),
      'Remove spawner'
    )
    .status(204)
    .toPromise();

  const removeUnknownSpawner = await tester
    .test(
      () => api.backend.removeSpawner('https://spawner.dev.wsl:3001'),
      'Remove unknown spawner'
    )
    .status(404)
    .toPromise();

  return (
    badSpawners &&
    validSpawner.pass &&
    alreadyAddedSpawner.pass &&
    listSpawners.pass &&
    removeSpawner.pass &&
    removeUnknownSpawner.pass
  );
}

async function linkPlayerFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const knownSpawner = {
    url: 'https://spawner.dev.wsl:3001',
    secret: '12345'
  };

  const playerId = (
    await api.mongo
      .collection('users')
      .findOne({ username: user.cred.username })
  )?.player.toString();
  await api.backend.addSpawner(knownSpawner.url, knownSpawner.secret);
  const token = sign({ spawner: knownSpawner.url }, knownSpawner.secret);
  const instanceUrl = `${knownSpawner.url}/random_instance_id`;

  const linkedGame = await tester
    .test(
      () => api.backend.linkGamePlayer(playerId, instanceUrl, token),
      'Link game to player'
    )
    .status(200)
    .response(true)
    .toPromise();

  const linkAlreadyLinked = await tester
    .test(
      () => api.backend.linkGamePlayer(playerId, `${instanceUrl}0`, token),
      'Link to already linked'
    )
    .status(200)
    .response(false)
    .toPromise();

  const unlinkGame = await tester
    .test(
      () => api.backend.unlinkGamePlayer(playerId, token),
      'Unlink game from player'
    )
    .status(200)
    .response(true)
    .toPromise();

  await api.backend.linkGamePlayer(playerId, instanceUrl, token);

  const unlinkAll = await tester
    .test(
      () => api.backend.unlinkGamePlayers(instanceUrl, token),
      'Unlink game from all'
    )
    .status(200)
    .response(true)
    .toPromise();

  await api.backend.removeSpawner(knownSpawner.url);

  return (
    linkedGame.pass &&
    linkAlreadyLinked.pass &&
    unlinkGame.pass &&
    unlinkAll.pass
  );
}

async function quickGameFlow(api: Api, logger: Logger): Promise<boolean> {
  const spawner = { url: 'https://spawner.dev.wsl:3001', secret: '12345' };

  const participantCreds1 = genUser();
  const participant1 = new BackendApi('https://backend.dev.wsl/api');
  await participant1.register(participantCreds1);
  await participant1.confirmRegistration(
    await getConfirmationToken(participantCreds1.email)
  );
  await participant1.loginUsername(
    participantCreds1.username,
    participantCreds1.password
  );

  const participantCreds2 = genUser();
  const participant2 = new BackendApi('https://backend.dev.wsl/api');
  await participant2.register(participantCreds2);
  await participant2.confirmRegistration(
    await getConfirmationToken(participantCreds2.email)
  );
  await participant2.loginUsername(
    participantCreds2.username,
    participantCreds2.password
  );

  await api.backend.addSpawner(spawner.url, spawner.secret);

  const tester = new ApiTester(logger);

  const oneScenario = await tester
    .test(
      () => api.backend.listScenario(0, 2),
      'Only an one scenario is available'
    )
    .status(200)
    .response(x => x.total === 1)
    .toPromise();

  if (!oneScenario.pass) {
    await api.backend.removeSpawner(spawner.url);
    return false;
  }

  const scenarioContent = await tester
    .test(
      () => api.backend.getScenarioContent(oneScenario.data.scenarios[0].id),
      'Get scenario content'
    )
    .status(200)
    .toPromise();

  const p1Queue = tester
    .test(
      () => participant1.enterQuickQueue(),
      'Enter the quick game queue for player#1'
    )
    .status(200)
    .response(x => x !== null)
    .toPromise();

  const p2Queue = tester
    .test(
      () => participant2.enterQuickQueue(),
      'Enter the quick game queue for player#2'
    )
    .status(200)
    .response(x => x === null)
    .toPromise();

  await delay(1000);

  const p2LeaveQueue = tester
    .test(
      () => participant2.leaveQuickQueue(),
      'Leave the quick queue for player#2'
    )
    .status(200)
    .response(true)
    .toPromise();

  await delay(1000);

  const p2QueueAgain = tester
    .test(
      () => participant2.enterQuickQueue(),
      'Enter again the quick game queue for player#2'
    )
    .status(200)
    .response(x => x !== null)
    .toPromise();

  let pass = false;
  try {
    pass = (
      await Promise.all([p1Queue, p2Queue, p2LeaveQueue, p2QueueAgain])
    ).every(x => x.pass);
  } catch (e) {
    // Test failed
  }

  const replaysCountBeforeGame = (
    (await participant1.findReplays(
      DateCondition.Greather,
      new Date(0),
      25
    )) as AxiosResponse<ReplaysOverview>
  ).data.total;

  const gc1 = new GameClient();
  const gc2 = new GameClient();

  const p1ConnInfo = (await p1Queue).data;
  const p2ConnInfo = (await p2QueueAgain).data;

  if (!(p1ConnInfo && p2ConnInfo)) {
    return false;
  }

  await gc1.connect(p1ConnInfo?.instanceUrl, p1ConnInfo?.playerToken);
  await gc2.connect(p2ConnInfo?.instanceUrl, p2ConnInfo?.playerToken);

  await Promise.all([awaitGameStart(gc1), awaitGameStart(gc2)]);

  for (const char of scenarioContent.data.text) {
    await gc1.sendKey(char);
    await gc2.sendKey(char);
  }

  let retries = 10;

  let replays: ReplaysOverview;
  while (retries--) {
    try {
      replays = (
        (await participant1.findReplays(
          DateCondition.Greather,
          new Date(0),
          25
        )) as AxiosResponse<ReplaysOverview>
      ).data;

      if (replays.total > replaysCountBeforeGame) {
        break;
      }
    } catch (e) {
      // Some network error
    }

    await delay(2000);
  }

  const singleReplay = await tester
    .test(
      () => api.backend.findReplay(replays.replays[0].id),
      'Find exist replay'
    )
    .status(200)
    .response(x => x.id === replays.replays[0].id)
    .toPromise();

  await api.backend.removeSpawner(spawner.url);

  return pass && retries > 0 && singleReplay.pass;
}

async function awaitGameStart(gameClient: GameClient) {
  if (gameClient.inQuickgGameLobby) {
    await gameClient.quickGameLobby.awaitInitialization();

    return new Promise<void>(ok => {
      if (gameClient.inQuickgGameLobby) {
        gameClient.quickGameLobby.$gameWillStart
          .pipe(first())
          .subscribe({ next: () => ok() });
      } else if (gameClient.inGame) {
        ok();
      }

      ok();
    });
  }
}

async function replayFlow(api: Api, logger: Logger): Promise<boolean> {
  const tester = new ApiTester(logger);

  const playerReplays = await tester
    .test(
      () => api.backend.findReplays(DateCondition.Greather, new Date(0), 10),
      'List current player replays'
    )
    .status(200)
    .toPromise();

  const singleUnknownReplay = await tester
    .test(
      () => api.backend.findReplay('507f191e810c190000000000'),
      'Find replay with unknown id'
    )
    .status(404)
    .toPromise();

  const singleReplayInvalidId = await tester
    .test(
      () => api.backend.findReplay('abcd=42*L'),
      'Find replay with invalid id'
    )
    .status(400)
    .toPromise();

  return (
    playerReplays.pass && singleUnknownReplay.pass && singleReplayInvalidId.pass
  );
}

export async function testBackend(api: Api): Promise<boolean> {
  const logger = new Logger('Backend');

  let success = true;
  success = (await dtoValidation(api, logger)) && success;
  success = (await googleAuthFlow(api, logger)) && success;
  success = (await signinInvalidCreds(api, logger)) && success;
  success = (await registrationFlow(api, logger)) && success;
  success = (await signinFlow(api, logger)) && success;
  success = (await registerWithSameCreds(api, logger)) && success;
  success = (await confirmRegistrationUnsuccess(api, logger)) && success;

  success = (await fetchUserInfo(api, logger)) && success;

  success = (await playerStatsFlow(api, logger)) && success;

  success = (await spawnerFlow(api, logger)) && success;

  success = (await linkPlayerFlow(api, logger)) && success;

  success = (await gameFlow(api, logger)) && success;

  success = (await scenarioFlow(api, logger)) && success;

  success = (await quickGameFlow(api, logger)) && success;

  success = (await replayFlow(api, logger)) && success;

  return success;
}
