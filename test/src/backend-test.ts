import Crypto from 'crypto';

import { Api } from "./api-interface";
import { ApiTester } from "./api-tester";
import { NewUser, StatusCode } from "./api/backend-api";
import { delay } from './delay';
import { Logger } from "./logger";
import { Mailbox } from './mailbox';

async function registrationFlow(api: Api, logger: Logger): Promise<boolean> {
    const username = Crypto.randomBytes(7).toString('hex');
    const email = `${username}@dev.wsl`;
    const user: NewUser = { username, email, password: '1234567890' };

    const tester = new ApiTester(logger, 'Backend');
    const registerResourcePass = await tester.test(() => api.backend.register(user), {
        done: [
            {
                If: x => x.status === 201 && x.data?.code === StatusCode.Ok,
                Done: x => `PASS /auth/register returns { code: 0 }`
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
        confirmLetter = await mailbox.findByDestination(email);

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
                Done: () => 'PASS /auth/registration/confirm registration confirmed successfully'
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

export async function testBackend(api: Api,): Promise<boolean> {
    const logger = new Logger('Backend');

    let success = true;
    success = await registrationFlow(api, logger) && success;

    return success;
}