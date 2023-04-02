import { ConfigLoader } from './config-loader';
import { ConfigPopulateOptionals } from './config-populate-optionals';

import launchParams from '@/launch-params';

export default ConfigPopulateOptionals(
  // TODO fix the type inference
  new ConfigLoader().load((launchParams as any).config)
);
