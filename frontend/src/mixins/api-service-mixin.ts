import { Component, Vue } from 'vue-property-decorator';
import ApiService from '../services/api-service';

const instance = new ApiService(`${location.origin}/api`);

@Component
export default class ApiServiceMixin extends Vue {
    public get api() { return instance }
}
