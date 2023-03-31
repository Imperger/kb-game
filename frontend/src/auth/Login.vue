<template>
<div class="login-component">
  <keyboard-background :interactive="interactiveBackground" />
  <app-language-selector class="language-selector" />
  <login-form
    v-model="credentials"
    :error="loginErrorStatusCode"
    @secureInteract="secureInteract"
    @submit="doLogin"/>
  <div class="registration-alternatives-separator">OR</div>
  <google-auth-button text="signin_with" @credentials="loginGoogle" />
</div>
</template>

<style scoped>
.login-component {
  margin: auto;
}

.registration-alternatives-separator {
  position: relative;
  margin: 10px 0;
}

.language-selector {
  position: absolute;
  right: 25px;
  top: 25px;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { AuthError } from '@/services/api-service/auth/auth-error';
import { ApiServiceMixin, StoreMixin } from '@/mixins';
import { isRejectedResponse, RejectedResponse } from '@/services/api-service/rejected-response';
import LoginForm, { Credentials } from '@/components/LoginForm.vue';
import KeyboardBackground from '@/components/KeyboardBackground.vue';
import AppLanguageSelector from '@/components/AppLanguageSelector.vue';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton.vue';
import { LoginResponse } from '@/services/api-service/auth/auth-api';

@Component({
  components: {
    GoogleAuthButton,
    KeyboardBackground,
    AppLanguageSelector,
    LoginForm
  }
})
export default class Login extends Mixins(ApiServiceMixin, StoreMixin) {
  public credentials: Credentials = { identifier: '', password: '' };

  public interactiveBackground = true;

  public loginErrorStatusCode: AuthError | null = null;

  async doLogin (): Promise<void> {
    if (!(this.credentials.identifier.length &&
          this.credentials.password)) {
      return;
    }

    this.loginErrorStatusCode = null;

    await this.$recaptchaLoaded();
    const token = await this.$recaptcha('LOGIN');
    const loggedIn = await this.api.auth.login(this.credentials.identifier, this.credentials.password, token);

    await this.openAppIfSuccess(loggedIn);
  }

  async loginGoogle (idToken: string): Promise<void> {
    await this.$recaptchaLoaded();
    const recaptchaToken = await this.$recaptcha('LOGIN');

    const loggedIn = await this.api.auth.loginGoogle(idToken, recaptchaToken);

    await this.openAppIfSuccess(loggedIn);
  }

  secureInteract (active: boolean): void {
    this.interactiveBackground = !active;
  }

  private async openAppIfSuccess (loggedIn: LoginResponse | RejectedResponse) {
    if (isRejectedResponse(loggedIn)) {
      this.loginErrorStatusCode = loggedIn.code;
    } else {
      const me = await this.api.user.currentUserInfo();

      if (isRejectedResponse(me)) {
        return;
      }

      this.App.setUser(me);
      this.App.setToken(this.api.auth.accessToken);
      this.$router.push({ name: 'MainMenu' });
    }
  }
}
</script>
