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
        if((await api.spawner.info()).status === 200) {
            logger.log('PASSED /info with valid credentions');
            return;
        }
    } catch(e) {
        if (isAxiosError(e)) {
            throw new TestError(`FAILED /info should returns 200 when authorized. Given: ${e.response?.status}`, 'Spawner');
        }
    }

    throw new TestError(`FAILED /info should returns 200 when authorized`, 'Spawner');
}

export async function testSpawner(api: Api): Promise<void> {
    const logger = new Logger('Spawner');

    await infoWithInvalidCredentials(api, logger);
    await infoWithValidCredentials(api, logger);

    logger.log('All tests passed');
}
