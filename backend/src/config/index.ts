import { ConfigLoader } from './config-loader';
import launchParams from '@/launch-params';
import { ConfigPopulateOptionals } from './config-populate-optionals';

export default ConfigPopulateOptionals(
  // TODO fix the type inference
  new ConfigLoader().load((launchParams as any).config)
);
