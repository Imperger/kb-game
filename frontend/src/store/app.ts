import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

import { CurrentUser } from '@/services/api-service/user/types';

@Module({ name: 'app' })
export default class App extends VuexModule {
  /**
     * The application is considered initialized
     * after an automatic authorization attempt, regardless of its result.
     */
  private initialized = false;
  private $initialized = new Subject<void>();

  private authToken = '';
  private me: CurrentUser | null = null;

  @Mutation
  public setToken (token: string): void {
    this.authToken = token;
  }

  @Mutation
  public resetToken (): void {
    this.authToken = '';
  }

  @Mutation
  public setUser (user: CurrentUser | null): void {
    this.me = user;
  }

  @Mutation
  public Initialize (): void {
    this.initialized = true;
    this.$initialized.next();
  }

  @Mutation
  public Uninitialize (): void {
    this.initialized = false;
  }

  @Action
  public async waitInitializationFor (timeout: number): Promise<void> {
    return this.initialized
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
        let timeoutTimer = -1;
        if (timeout >= 0) {
          timeoutTimer = setTimeout(() => reject(new Error('Timeut')), timeout);
        }

        this.$initialized
          .pipe(first())
          .subscribe(x => ((clearTimeout(timeoutTimer), resolve())));
      });
  }

  public get hasToken (): boolean {
    return this.authToken.length > 0;
  }

  public get accessToken (): string {
    return this.authToken;
  }

  public get user (): CurrentUser | null {
    return this.me;
  }

  public get loggedIn (): boolean {
    return this.me !== null;
  }
}
