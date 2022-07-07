import { ConfigLoader } from './config-loader';
import launchParams from '@/launch-params';
import { ConfigPopulateOptionals } from './config-populate-optionals';

export default ConfigPopulateOptionals(
  new ConfigLoader()
    .load(process.env.NODE_ENV === 'test' ? './test/settings.json' :launchParams.config));