import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';

export enum NotifyType { Message, Warning, Error }

export interface NotificationConfig {
  message: string;
  type: NotifyType;
}

@Module({ name: 'notify' })
export default class Notify extends VuexModule {
  public isShow = false;

  public message = '';

  public colorIdx = 0;

  @Mutation
  public show (notification: NotificationConfig): void {
    this.isShow = true;
    this.message = notification.message;
    this.colorIdx = notification.type;
  }

  @Mutation
  public setIsShow (value: boolean): void {
    this.isShow = value;
  }

  get color (): string {
    return [
      'light-blue lighten-1',
      'orange darken-3',
      'red accent-2'][this.colorIdx];
  }
}
