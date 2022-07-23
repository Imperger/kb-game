const { runCLI } = require('@jest/core');

process.env.NODE_ENV = 'test';
const sep = process.argv.indexOf('--');

let k = '';
const config = process.argv
  .slice(2, sep)
  .reduce((config, x) => (x.startsWith('--') ? k = x.slice(2): config[k] = x, config), {});

process.argv = [...process.argv.slice(0, 2), ...process.argv.slice(sep + 1)];

runCLI(config, [process.cwd()]);
