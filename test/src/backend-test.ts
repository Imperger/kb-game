import Crypto from 'crypto';
import { sign } from 'jsonwebtoken';

import { Api } from "./api-interface";
import { ApiTester } from "./api-tester";
import { RejectedResponse, StatusCode } from "./api/backend-api";
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

    const tester = new ApiTester(logger, 'Backend');

    const loginUsernamePass = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        {
            done: [
                {
                    If: x => true,
                    Throw: x => `FAILED /auth/login/username should return 401. Given '${x.status}'`
                },

            ],
            error: [
                {
                    If: x => x.response?.status === 401,
                    Done: x => 'PASSED /auth/login/username returns 401'
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/username should return 401. Given: '${x.response?.status}'`
                }
            ]
        });

    return loginUsernamePass;
}

async function registrationFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Backend');
    const registerResourcePass = await tester.test(() => api.backend.register(user.cred), {
        done: [
            {
                If: x => x.status === 201 && x.data?.code === StatusCode.Ok,
                Done: x => 'PASSED /auth/register returns { code: 0 }'
            },
            {
                If: () => true,
                Throw: x => `FAILED /auth/register should return { code: 0 }. Given '${x.data}'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /auth/register should return 201. Given '${x.response?.status}'`
            }
        ]
    });

    if (!registerResourcePass) {
        return false;
    }

    const loginUsernameUnconfirmedPass = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        {
            done: [
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/username should return 401. Given '${x.status}'`
                }
            ],
            error: [
                {
                    If: x => x.response?.status === 401,
                    Done: x => 'PASSED /auth/login/username returns 401'
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/username should return 401. Given: '${x.response?.data}'`
                }
            ]
        });

    // Make user confirmation time expire
    await api.mongo.collection('users').updateOne({ email: user.cred.email }, { $set: { createdAt: new Date(0) } });

    const loginUsernamePass = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        {
            done: [
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/username should return 401. Given: '${x.status}'`
                }
            ],
            error: [
                {
                    If: x => x.response?.status === 401,
                    Done: () => 'PASSED /auth/login/username returns 401 for user that has expired confirmation'
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/username should return 401. Given: ${x.response?.status}`
                }
            ]
        });

    // Make confirmation time valid again
    await api.mongo.collection('users').updateOne({ email: user.cred.email }, { $set: { createdAt: new Date() } });


    const mailbox = new Mailbox('http://mail.dev.wsl:1080');

    let confirmLetter = null;
    for (let retries = 20; confirmLetter === null && retries > 0; --retries) {
        confirmLetter = await mailbox.findByDestination(user.cred.email);

        await delay(5000);
    }

    if (confirmLetter === null) {
        logger.error('FAILED /register should sent confirmation letter');
        return false;
    }

    const [, token] = /https*:\/\/.+\/registration\/confirm\/([a-zA-Z0-9\._-]+)/.exec(confirmLetter.html) ?? [null, null];

    if (!token) {
        logger.error('FAILED /register confirmation letter should contain confirm url');
        return false;
    }

    user.token = token;

    const confirmResourcePass = tester.test(() => api.backend.confirmRegistration(token), {
        done: [
            {
                If: x => x.status === 200 && x.data?.code === StatusCode.Ok,
                Done: () => 'PASSED /auth/registration/confirm registration confirmed successfully'
            },
            {
                If: () => true,
                Throw: x => `FAILED /auth/registration/confirm should return 200. Given '${x.status}'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /auth/registration/confirm should return 200. Given '${x.response?.status}'`
            }
        ]
    });

    return registerResourcePass && loginUsernameUnconfirmedPass && confirmResourcePass;
}

async function signinFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Backend');

    const loginUsernamePass = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        {
            done: [
                {
                    If: x => x.status === 200 && x.data?.code === StatusCode.Ok && x.data?.token?.length > 0,
                    Done: () => 'PASSED /auth/login/username returns user token'
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/username should return user token. Given: '${x.data}'`
                }
            ],
            error: [
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/username should return 200. Given: ${x.response?.status}`
                }
            ]
        });

    const loginEmailPass = await tester.test(
        () => api.backend.loginEmail(user.cred.email, user.cred.password),
        {
            done: [
                {
                    If: x => x.status === 200 && x.data?.code === StatusCode.Ok && x.data?.token?.length > 0,
                    Done: () => 'PASSED /auth/login/email returns user token'
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/email should return user token. Given: '${x.data}'`
                }
            ],
            error: [
                {
                    If: () => true,
                    Throw: x => `FAILED /auth/login/email should return 200. Given: ${x.response?.status}`
                }
            ]
        });

    return loginUsernamePass && loginEmailPass;
}

async function registerWithSameCreds(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Backend');

    const registerSameUsernamePass = await tester.test(() => api.backend.register(
        {
            username: user.cred.username,
            email: `uniq_${user.cred.email}`,
            password: user.cred.password
        }), {
        done: [
            {
                If: () => true,
                Throw: x => `FAILED /auth/register should return 409. Given '${x.status}'`
            }
        ],
        error: [
            {
                If: x => x.response?.status === 409,
                Done: x => 'PASSED /auth/register returns 409'
            },
            {
                If: () => true,
                Throw: x => `FAILED /auth/register should return 409. Given '${x.response?.status}'`
            }
        ]
    });

    const registerSameEmailPass = await tester.test(() => api.backend.register(
        {
            username: `u_${user.cred.username}`,
            email: user.cred.email,
            password: user.cred.password
        }), {
        done: [
            {
                If: () => true,
                Throw: x => `FAILED /auth/register should return 409. Given '${x.status}'`
            }
        ],
        error: [
            {
                If: x => x.response?.status === 409,
                Done: x => 'PASSED /auth/register returns 409'
            },
            {
                If: () => true,
                Throw: x => `FAILED /auth/register should return 409. Given '${x.response?.status}'`
            }
        ]
    });

    return registerSameUsernamePass && registerSameEmailPass;
}

async function confirmRegistrationUnsuccess(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Backend');

    const token = sign({ id: '600000000000000000000000' }, '12345_', { expiresIn: '24h' });
    const unknownUserIdPass = await tester.test(() => api.backend.confirmRegistration(token), {
        done: [
            {
                If: () => true,
                Throw: x => `FAILED /auth/registration/confirm should return 409. Given '${x.status}'`
            }
        ],
        error: [
            {
                If: x => x.response?.status === 409,
                Done: () => 'PASSED /auth/registration/confirm returns 409'
            },
            {
                If: () => true,
                Throw: x => `FAILED /auth/registration/confirm should return 409. Given '${x.response?.status}'`
            }
        ]
    });

    const alreadyConfirmedPass = await tester.test(() => api.backend.confirmRegistration(user.token), {
        done: [
            {
                If: () => true,
                Throw: x => `FAILED /auth/registration/confirm should return 409. Given '${x.status}'`
            }
        ],
        error: [
            {
                If: x => x.response?.status === 409,
                Done: () => 'PASSED /auth/registration/confirm returns 409'
            },
            {
                If: () => true,
                Throw: x => `FAILED /auth/registration/confirm should return 409. Given '${x.response?.status}'`
            }
        ]
    });

    return unknownUserIdPass && alreadyConfirmedPass;
}

async function fetchUserInfo(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Backend');

    const fetchUserInfoPass = await tester.test(
        () => api.backend.me(),
        {
            done: [
                {
                    If: x => x.status === 200 && x.data?.username === user.cred.username && x.data?.email === user.cred.email,
                    Done: () => 'PASSED /user/me returns user info'
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /user/me should return user info. Given: '${x.data}'`
                }
            ],
            error: [
                {
                    If: () => true,
                    Throw: x => `FAILED /user/me should return 200. Given: ${x.response?.status}`
                }
            ]
        });

    return fetchUserInfoPass;
}

async function listGames(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Backend');

    const gameListPass = await tester.test(
        () => api.backend.listGames(),
        {
            done: [
                {
                    If: x => x.status === 200 && Array.isArray(x.data),
                    Done: () => 'PASSED /game/list returns game list'
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /game/list should return game list. Given: '${x.data}'`
                }
            ],
            error: [
                {
                    If: () => true,
                    Throw: x => `FAILED /game/list should return 200. Given: ${x.response?.status}`
                }
            ]
        });

    return gameListPass;
}

async function scenarioFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Backend');

    await api.mongo.collection('users')
        .updateOne({ email: user.cred.email }, { $set: { 'scopes.editScenario': true } });

    const scenario = { id: '', title: 'Sample title', text: 'Scenario content' };

    const addScenarioPass = await tester.test(async () => {
        const ret = api.backend.addScenario(scenario.title, scenario.text);
        scenario.id = (await ret).data
        return ret;
    }, {
        done: [
            {
                If: x => x.status === 201 && typeof x.data === 'string',
                Done: () => 'PASSED /scenario/add returns id'
            },
            {
                If: () => true,
                Throw: x => `FAILED /scenario/add should return scenario id. Given '${x.data}'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /scenario/add should return 201. Given '${x.response?.status}'`
            }
        ]
    });

    const updatedScenario = { title: 'Updated title', text: 'Updated scenario content' };

    const updateScenarioPass = await tester.test(() => api.backend.updateScenario(scenario.id, updatedScenario), {
        done: [
            {
                If: x => x.status === 200 && x.data === true,
                Done: () => 'PASSED /scenario/update returns \'true\''
            },
            {
                If: () => true,
                Throw: x => `FAILED /scenario/update should return 'true'. Given '${x.data}'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /scenario/update should return 200. Given '${x.response?.status}'`
            }
        ]
    });

    const contentScenarioPass = await tester.test(() => api.backend.getScenarioContent(scenario.id), {
        done: [
            {
                If: x => x.status === 200 &&
                    x.data.title === updatedScenario.title &&
                    x.data.text === updatedScenario.text,
                Done: () => 'PASSED /scenario/content returns scenario content'
            },
            {
                If: () => true,
                Throw: x => `FAILED /scenario/content should return scenario content. Given '${x.data}'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /scenario/content should return 200. Given '${x.response?.status}'`
            }
        ]
    });

    const listScenariosPass = await tester.test(() => api.backend.listScenario(0, 25), {
        done: [
            {
                If: x => x.status === 200 &&
                    x.data.total >= 1 &&
                    (x.data.total > 25 || x.data.scenarios.some(x => x.title === updatedScenario.title && x.text === updatedScenario.text)),
                Done: () => 'PASSED /scenario/list returns scenario list'
            },
            {
                If: () => true,
                Throw: x => `FAILED /scenario/list should return scenario list. Given '${x.data}'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /scenario/list should return 200. Given '${x.response?.status}'`
            }
        ]
    });

    const removeScenarioPass = await tester.test(() => api.backend.removeScenario(scenario.id), {
        done: [
            {
                If: x => x.status === 200 && x.data === true,
                Done: () => 'PASSED /scenario/remove returns \'true\''
            },
            {
                If: () => true,
                Throw: x => `FAILED /scenario/remove should return 'true'. Given '${x.data}'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /scenario/remove should return 200. Given '${x.response?.status}'`
            }
        ]
    });

    return updateScenarioPass &&
        updateScenarioPass &&
        contentScenarioPass &&
        listScenariosPass &&
        removeScenarioPass;
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
    const tester = new ApiTester(logger, 'Backend');

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
        tester.test(() => api.backend.addSpawner(test.url, test.secret),
            {
                done: [
                    {
                        If: () => true,
                        Throw: x => `FAILED /spawner/add '${test.name}' should return 400. Given '${x.status}'`
                    }
                ],
                error: [
                    {
                        If: x => x.response?.status === 400 &&
                            (x.response.data as RejectedResponse).code === test.expected,
                        Done: () => `PASSED /spawner/add '${test.name}' returns 400`
                    },
                    {
                        If: () => true,
                        Throw: x => `FAILED /spawner/add '${test.name}' should return 400. Given '${x.response?.status}'`
                    }
                ]
            });


    const badPass = (await Promise.allSettled(badTestcases.map(x => addSpawnerTest(x))))
        .every(x => (x as { value: boolean }).value);

    const validSecretPass = await tester.test(() => api.backend.addSpawner('https://spawner.dev.wsl:3001', '12345'),
        {
            done: [
                {
                    If: x => x.status === 201,
                    Done: () => 'PASSED /spawner/add \'valid secret\' returns 201'                
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /spawner/add 'valid secret' should return 201. Given '${x.status}'`
                }
            ],
            error: [
                {
                    If: () => true,
                    Throw: x => `FAILED /spawner/add 'valid secret' should return 201. Given '${x.response?.status}'`
                }
            ]
        });

        const listPass = await tester.test(() => api.backend.listSpawners(),
        {
            done: [
                {
                    If: x => x.status === 200 && Array.isArray(x.data) && x.data.length >= 1,
                    Done: () => 'PASSED /spawner/list_all returns 200'                
                },
                {
                    If: () => true,
                    Throw: x => `FAILED /spawner/list_all should return 200. Given '${x.status}'`
                }
            ],
            error: [
                {
                    If: () => true,
                    Throw: x => `FAILED /spawner/list_all should return 200. Given '${x.response?.status}'`
                }
            ]
        });

    const removePass = await tester.test(() => api.backend.removeSpawner('https://spawner.dev.wsl:3001'),
    {
        done: [
            {
                If: x => x.status === 200,
                Done: () => 'PASSED /spawner/remove returns 200'                
            },
            {
                If: () => true,
                Throw: x => `FAILED /spawner/remove should return 200. Given '${x.status}'`
            }
        ],
        error: [
            {
                If: () => true,
                Throw: x => `FAILED /spawner/remove should return 200. Given '${x.response?.status}'`
            }
        ]
    });

    return badPass && validSecretPass && listPass && removePass;
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

    success = await listGames(api, logger) && success;

    success = await scenarioFlow(api, logger) && success;

    success = await spawnerFlow(api, logger) && success;

    return success;
}