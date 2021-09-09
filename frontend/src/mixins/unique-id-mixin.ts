import { Component, Vue } from 'vue-property-decorator';

let nextId = 0;

@Component
export default class UniqueIdMixin extends Vue {
  public generateId (): number { return nextId++; }
}
