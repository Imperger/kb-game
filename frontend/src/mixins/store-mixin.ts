import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';

import store, { Settings } from '@/store';

const settings = getModule(Settings, store);

@Component
export default class StoreMixin extends Vue {
  public get Settings (): Settings { return settings; }
}
