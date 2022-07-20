import { Api } from './api-interface';
import { ApiTester } from './api-tester';
import { Logger } from './logger';

async function info(api: Api, logger: Logger): Promise<boolean> {
    api.spawner.useAuthorization(false);

    const tester = new ApiTester(logger);

    const spawnerInfoWithoutCreds = await tester.test(
        () => api.spawner.info(),
        'Fetch spawner info with without credentials')
        .status(401)
        .toPromise();

    api.spawner.useAuthorization(true);

    const spawnerInfoWithCreds = await tester.test(
        () => api.spawner.info(),
        'Fetch spawner info with credentials')
        .status(200)
        .toPromise();

    return spawnerInfoWithoutCreds.pass && spawnerInfoWithCreds.pass;
}

async function gameList(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    api.spawner.useAuthorization(false);

    const gameListWithoutCreds = await tester.test(
        () => api.spawner.gameList(),
        'List games without credentials')
        .status(401)
        .toPromise();

    api.spawner.useAuthorization(true);

    const gameListWithCreds = await tester.test(
        () => api.spawner.gameList(),
        'List games with credentials')
        .status(200)
        .response(x => Array.isArray(x))
        .toPromise();

    return gameListWithoutCreds.pass && gameListWithCreds.pass;
}

async function createCustomGame(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger);

    api.spawner.useAuthorization(false);

    const newGameWithoutCreds = await tester.test(
        () => api.spawner.requestCustomInstance({ ownerId: '', backendApi: '' }),
        'Request custom instance without credentials')
        .status(401)
        .toPromise();

    api.spawner.useAuthorization(true);

    const newGameWithCreds = await tester.test(
        () => api.spawner.requestCustomInstance({ ownerId: '1234567890', backendApi: 'https://backend.dev.wsl' }),
        'Request game instance with credentials')
        .status(201)
        .response(x => typeof x === 'object' && typeof x.instanceUrl === 'string')
        .toPromise();

    return newGameWithoutCreds.pass && newGameWithCreds.pass;
}

export async function testSpawner(api: Api): Promise<boolean> {
    const logger = new Logger('Spawner');

    let success = true;
    success = await info(api, logger) && success;
    success = await gameList(api, logger) && success;
    success = await createCustomGame(api, logger) && success;

    return success;
}
