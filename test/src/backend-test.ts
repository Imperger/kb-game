import Crypto from 'crypto';

import { Api } from "./api-interface";
import { ApiTester } from "./api-tester";
import { StatusCode } from "./api/backend-api";
import { delay } from './delay';
import { Logger } from "./logger";
import { Mailbox } from './mailbox';

const user = { cred: { username: '', email: '', password: '' } };

async function registrationFlow(api: Api, logger: Logger): Promise<boolean> {
    user.cred.username = Crypto.randomBytes(7).toString('hex');
    user.cred.email = `${user.cred.username}@dev.wsl`;
    user.cred.password = '1234567890';

    const tester = new ApiTester(logger, 'Backend');
    const registerResourcePass = await tester.test(() => api.backend.register(user.cred), {
        done: [
            {
                If: x => x.status === 201 && x.data?.code === StatusCode.Ok,
                Done: x => `PASSED /auth/register returns { code: 0 }`
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

    return registerResourcePass && confirmResourcePass;
}

async function signinFlow(api: Api, logger: Logger): Promise<boolean> {
    const tester = new ApiTester(logger, 'Backend');

    const loginUsernamePass = await tester.test(
        () => api.backend.loginUsername(user.cred.username, user.cred.password),
        {
            done: [
                {
                    If: x => x.status === 200 && x.data?.code === StatusCode.Ok && x.data?.token?.length > 0,
                    Done: () => 'PASS /auth/login/username returns user token'
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
                        Done: () => 'PASS /auth/login/email returns user token'
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

export async function testBackend(api: Api,): Promise<boolean> {
    const logger = new Logger('Backend');

    let success = true;
    success = await registrationFlow(api, logger) && success;
    success = await signinFlow(api, logger) && success;

    return success;
}