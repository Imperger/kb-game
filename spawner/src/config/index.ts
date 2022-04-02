import { ConfigLoader } from './config-loader';
import launchParams from '../launch-params';

export default new ConfigLoader().load(launchParams.config);
