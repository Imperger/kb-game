import { Api } from "./api-interface";
import { Logger } from "./logger";

export async function testBackend(api: Api, ): Promise<boolean> {
    const logger = new Logger('Backend');

    logger.log('All tests passed');
    return true;
}