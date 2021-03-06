import { Component, Vue } from 'vue-property-decorator';
import ApiService from '../services/api-service';

const instance = new ApiService(`https://${process.env.VUE_APP_HOST}/api`);

@Component
export default class ApiServiceMixin extends Vue {
  public get api (): ApiService { return instance; }
}
