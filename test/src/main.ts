import colors from 'colors';
import { MongoClient } from 'mongodb';

import { SpawnerApi } from './api/spawner-api';
import { isAxiosError } from './guards/axios-error-guard';
import { testBackend } from './backend-test';
import { delay } from './delay';
import { Logger } from './logger';
import { testSpawner } from './spawner-test';
import { TestError } from './test-error';
import { BackendApi } from './api/backend-api';

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
    const backendAPi = new BackendApi('https://backend.dev.wsl/api');
    const mongo = new MongoClient('mongodb://db:27017');

    let success = true;
    try {
        await mongo.connect();

        logger.log('Awaiting for spawner initialization');
        await awaitSpawner(spawnerApi, 600);
        logger.log('Spawner is ready. Lets go');

        success = await testBackend({ backend: backendAPi, spawner: spawnerApi, mongo: mongo.db('test') }) && success;
        //success = await testSpawner({ backend: backendAPi, spawner: spawnerApi, mongo }) && success;
    } catch (e: any) {
        logger.error(e);
        process.exit(1);
    } finally {
        await mongo.close();
        if (!success)
            process.exit(1);
    }
}();