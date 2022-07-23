<template>
<div class="login-component">
  <keyboard-background :interactive="interactiveBackground" />
  <app-language-selector class="language-selector" />
  <login-form
    v-model="credentials"
    :error="loginErrorStatusCode"
    @secureInteract="secureInteract"
    @submit="doLogin"/>
</div>
</template>

<style scoped>
.login-component {
  margin: auto;
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
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import LoginForm, { Credentials } from '@/components/LoginForm.vue';
import KeyboardBackground from '@/components/KeyboardBackground.vue';
import AppLanguageSelector from '@/components/AppLanguageSelector.vue';

@Component({
  components: {
    KeyboardBackground,
    AppLanguageSelector,
    LoginForm
  }
})
export default class Login extends Mixins(ApiServiceMixin, StoreMixin) {
  private credentials: Credentials = { identifier: '', password: '' };

  private interactiveBackground = true;

  private loginErrorStatusCode: AuthError | null = null;

  async doLogin (): Promise<void> {
    if (!(this.credentials.identifier.length &&
          this.credentials.password)) {
      return;
    }

    this.loginErrorStatusCode = null;

    await this.$recaptchaLoaded();
    const token = await this.$recaptcha('LOGIN');
    const loggedIn = await this.api.auth.login(this.credentials.identifier, this.credentials.password, token);

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

  secureInteract (active: boolean): void {
    this.interactiveBackground = !active;
  }
}
</script>
