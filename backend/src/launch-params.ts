import * as yargs from 'yargs';

export default yargs.options({
    config: { alias: 'c', default: 'config.json' }
}).argv;