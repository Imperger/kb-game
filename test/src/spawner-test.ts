import { Api } from './api-interface';
import { ApiTester } from './api-tester';
import { Logger } from './logger';

async function infoWithInvalidCredentials(api: Api, logger: Logger): Promise<boolean> {
    api.spawner.useAuthorization(false);

    const tester = new ApiTester(logger, 'Spawner');
    const ret = await tester.test(() => api.spawner.info(), {
        done: [
            {
                If: () => true,
                Throw: x => `FAILED /info should return 401 when unauthorized. Given: ${x?.status}`
            }
        ],
        error: [
            {
                If: x => x.response?.status === 401,
                Done: () => 'PASSED /info with invalid credentions'
            },
            {
                If: () => true,
                Throw: x => `FAILED /info should return 401 when unauthorized. Given: ${x?.response?.status}`
            }
        ]
    });

    api.spawner.useAuthorization(true);

    return ret;
}

async function infoWithValidCredentials(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Spawner');
    const ret = await tester.test(() => api.spawner.info(), {
        done: [
            {
                If: x => x.status === 200,
                Done: x => 'PASSED /info with valid credentions'
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /info should return 200 when authorized. Given: ${x.response?.status}`
            }
        ]
    });

    return ret;
}

async function gameListWithInvalidCredentials(api: Api, logger: Logger): Promise<boolean> {
    api.spawner.useAuthorization(false);

    const tester = new ApiTester(logger, 'Spawner');
    const ret = await tester.test(() => api.spawner.gameList(), {
        done: [
            {
                If: () => true,
                Throw: x => `FAILED /game/list should return 401 when unauthorized. Given: ${x?.status}`
            }
        ],
        error: [
            {
                If: x => x.response?.status === 401,
                Done: () => 'PASSED /game/list with invalid credentions'
            },
            {
                If: () => true,
                Throw: x => `FAILED /game/list should return 401 when unauthorized. Given: ${x?.response?.status}`
            }
        ]
    });

    api.spawner.useAuthorization(true);

    return ret;
}

async function gameListWithValidCredentials(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Spawner');
    const ret = await tester.test(() => api.spawner.gameList(), {
        done: [
            {
                If: x => x.status === 200,
                Done: x => 'PASSED /game/list with valid credentions'
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /game/list should return 200 when authorized. Given: ${x.response?.status}`
            }
        ]
    });

    return ret;
}

async function gameListReturnType(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Spawner');
    const ret = await tester.test(() => api.spawner.gameList(), {
        done: [
            {
                If: x => x.status === 200 && Array.isArray(x.data),
                Done: x => 'PASSED /game/list returns array'
            },
            {
                If: x => true,
                Throw: x => `FAILED /game/list should return array. Given: ${typeof x?.data}`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /game/list should return array. Given: ${typeof x.response?.data}`
            }
        ]
    });

    return ret;
}

async function createCustomGameUnauthorized(api: Api, logger: Logger): Promise<boolean> {
    api.spawner.useAuthorization(false);

    const tester = new ApiTester(logger, 'Spawner');
    const ret = await tester.test(() => api.spawner.requestCustomInstance({ ownerId: '', backendApi: '' }), {
        done: [
            {
                If: () => true,
                Throw: x => `FAILED /game/new_custom should return 401 when unauthorized. Given: ${x?.status}`
            }
        ],
        error: [
            {
                If: x => x.response?.status === 401,
                Done: () => 'PASSED /game/new_custom with invalid credentions'
            },
            {
                If: () => true,
                Throw: x => `FAILED /game/new_custom should return 401 when unauthorized. Given: ${x?.response?.status}`
            }
        ]
    });

    api.spawner.useAuthorization(true);

    return ret;
}

async function createCustomGameReturnType(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Spawner');
    const opts = { ownerId: '1234567890', backendApi: 'https://backend.dev.wsl' };
    const ret = await tester.test(() => api.spawner.requestCustomInstance(opts), {
        done: [
            {
                If: x => x.status === 201 && typeof x.data === 'object' && typeof x.data.instanceUrl === 'string',
                Done: x => 'PASSED /game/new_custom returns InstanceDescriptor'
            },
            {
                If: () => true,
                Throw: x => `PASSED /game/new_custom should return InstanceDescriptor'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /game/new_custom should return InstanceDescriptor. Given: ${x.response?.status}`
            }
        ]
    });

    return ret;
}

export async function testSpawner(api: Api): Promise<boolean> {
    const logger = new Logger('Spawner');

    let success = true;
    success = await infoWithInvalidCredentials(api, logger) && success;
    success = await infoWithValidCredentials(api, logger) && success;

    success = await gameListWithInvalidCredentials(api, logger) && success;
    success = await gameListWithValidCredentials(api, logger) && success;
    success = await gameListReturnType(api, logger) && success;

    success = await createCustomGameUnauthorized(api, logger) && success;
    success = await createCustomGameReturnType(api, logger) && success;

    return success;
}
