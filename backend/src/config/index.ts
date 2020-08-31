import ConfigLoader from './config-loader';
import launchParams from '../launch-params'
import { ConfigPopulateOptionals } from './config-populate-optionals';

export default ConfigPopulateOptionals(ConfigLoader(launchParams.config));