import { Api } from './api-interface';
import { isAxiosError } from './axios-error-guard';
import { Logger } from './logger';
import { TestError } from './test-error';

async function infoWithInvalidCredentials(api: Api, logger: Logger): Promise<void> {
    const secret = api.spawner.secret;
    api.spawner.secret = secret + '0';
    let status: number = 0;
    try {
        status = (await api.spawner.info()).status;
    } catch (e) {
        if (isAxiosError(e)) {
            if (e.response?.status === 401) {
                logger.log('PASSED /info with invalid credentions');
                return;
            }

            status = e.response?.status ?? -1;
        }

    } finally {
        api.spawner.secret = secret;
    }

    throw new TestError(`FAILED /info should returns 401 when unauthorized. Given: ${status}`, 'Spawner');
}

async function infoWithValidCredentials(api: Api, logger: Logger): Promise<void> {
    try {
        if ((await api.spawner.info()).status === 200) {
            logger.log('PASSED /info with valid credentions');
            return;
        }
    } catch (e) {
        if (isAxiosError(e)) {
            throw new TestError(`FAILED /info should returns 200 when authorized. Given: ${e.response?.status}`, 'Spawner');
        }
    }

    throw new TestError(`FAILED /info should returns 200 when authorized`, 'Spawner');
}

async function gameListWithInvalidCredentials(api: Api, logger: Logger): Promise<void> {
    const secret = api.spawner.secret;
    api.spawner.secret = secret + '0';
    let status: number = 0;
    try {
        status = (await api.spawner.gameList()).status;
    } catch (e) {
        if (isAxiosError(e)) {
            if (e.response?.status === 401) {
                logger.log('PASSED /game/list with invalid credentions');
                return;
            }

            status = e.response?.status ?? -1;
        }

    } finally {
        api.spawner.secret = secret;
    }

    throw new TestError(`FAILED /game/list should returns 401 when unauthorized. Given: ${status}`, 'Spawner');
}

async function gameListWithValidCredentials(api: Api, logger: Logger): Promise<void> {
    try {
        if ((await api.spawner.gameList()).status === 200) {
            logger.log('PASSED /game/list with valid credentions');
            return;
        }
    } catch (e) {
        if (isAxiosError(e)) {
            throw new TestError(`FAILED /game/list should returns 200 when authorized. Given: ${e.response?.status}`, 'Spawner');
        }
    }

    throw new TestError(`FAILED /game/list should returns 200 when authorized`, 'Spawner');
}

async function gameListReturnType(api: Api, logger: Logger): Promise<void> {
    try {
        const data = (await api.spawner.gameList()).data;
        if (Array.isArray(data)) {
            logger.log('PASSED /game/list returns array');
            return;
        } else {
            throw new TestError(`FAILED /game/list should returns array. Given: ${typeof data}`, 'Spawner');
        }
    } catch (e) {
        if (isAxiosError(e)) {
            throw new TestError(`FAILED /game/list should returns array. Given: ${typeof e.response?.data}`, 'Spawner');
        }
        throw e;
    }
}

export async function testSpawner(api: Api): Promise<void> {
    const logger = new Logger('Spawner');

    await infoWithInvalidCredentials(api, logger);
    await infoWithValidCredentials(api, logger);

    await gameListWithInvalidCredentials(api, logger);
    await gameListWithValidCredentials(api, logger);
    await gameListReturnType(api, logger);

    logger.log('All tests passed');
}
