import colors from 'colors';

import { SpawnerApi } from './api/spawner-api';
import { isAxiosError } from './axios-error-guard';
import { testBackend } from './backend-test';
import { delay } from './delay';
import { Logger } from './logger';
import { testSpawner } from './spawner-test';
import { TestError } from './test-error';

type seconds = number;

async function awaitSpawner(api: SpawnerApi, timeout: seconds): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeout * 1000) {
        try {
            await await api.info();
            return;
        } catch (e: any) {
            if (isAxiosError(e) && e.response?.status === 401)
                return;

            await delay(10000);
        }
    }

    throw new TestError('Timeout of awaiting spawner', 'Spawner');
}

void async function Main() {
    colors.enable();

    const logger = new Logger('Main');
    const spawnerApi = new SpawnerApi('https://spawner.dev.wsl:3001', '12345');

    try {
        logger.log('Awaiting for spawner initialization');
        await awaitSpawner(spawnerApi, 600);
        logger.log('Spawner is ready. Lets go');

        await testBackend({ spawner: spawnerApi });
        await testSpawner({ spawner: spawnerApi });
    } catch (e: any) {
        logger.error(e);
        process.exit(1);
    }
}();