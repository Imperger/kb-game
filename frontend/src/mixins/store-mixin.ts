import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';

import store, { App, Settings } from '@/store';

const app = getModule(App, store);
const settings = getModule(Settings, store);

@Component
export default class StoreMixin extends Vue {
  public get App (): App { return app; }
  public get Settings (): Settings { return settings; }
}
