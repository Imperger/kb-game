import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';

import store, { App, Settings } from '@/store';
import Notify from '@/store/notify';

const app = getModule(App, store);
const settings = getModule(Settings, store);
const notify = getModule(Notify, store);

@Component
export default class StoreMixin extends Vue {
  public get App (): App { return app; }
  public get Settings (): Settings { return settings; }
  public get Notify (): Notify { return notify; }
}
