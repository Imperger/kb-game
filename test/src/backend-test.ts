import Crypto from 'crypto';
import { sign } from 'jsonwebtoken';

import { Api } from "./api-interface";
import { ApiTester } from "./api-tester";
import { StatusCode } from "./api/backend-api";
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

export async function testBackend(api: Api,): Promise<boolean> {
    const logger = new Logger('Backend');

    let success = true;
    success = await signinInvalidCreds(api, logger) && success;
    success = await registrationFlow(api, logger) && success;
    success = await signinFlow(api, logger) && success;
    success = await registerWithSameCreds(api, logger) && success
    success = await confirmRegistrationUnsuccess(api, logger) && success;
    success = await fetchUserInfo(api, logger) && success;

    return success;
}