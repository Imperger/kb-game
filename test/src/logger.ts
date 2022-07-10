import colors from 'colors';
import { TestError, isTestError } from './test-error';

export class Logger {
    constructor(private where: string) { }

    log(msg: string) {
        console.log(this.format(msg, this.where, colors.green));
    }

    error(msg: string | TestError) {
        if (isTestError(msg)) {
            console.log(this.format(msg.message, msg.where, colors.red));
        } else {
            console.log(this.format(msg, this.where, colors.red));
        }
    }

    private format(msg: string, where: string, painter: (msg: string) => string) {
        return `${colors.yellow(`[${where}]`)} ${painter(msg)}`;
    }
}