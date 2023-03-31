<template>
<div class="register-component">
  <keyboard-background :interactive="interactiveBackground" />
  <app-language-selector class="language-selector" />
  <registration-form
    v-model="registrationData"
    :status="signupResult"
    @secureInteract="secureInteract"
    @submit="doRegister"/>
  <div class="registration-alternatives-separator">OR</div>
  <google-auth-button text="signup-with" @credentials="registerGoogle" />
</div>
</template>

<style scoped>
.register-component {
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
import ApiServiceMixin from '@/mixins/api-service-mixin';
import KeyboardBackground from '@/components/KeyboardBackground.vue';
import AppLanguageSelector from '@/components/AppLanguageSelector.vue';
import RegistrationForm, { RegistrationData } from '@/components/RegistrationForm.vue';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton.vue';

@Component({
  components: {
    GoogleAuthButton,
    KeyboardBackground,
    AppLanguageSelector,
    RegistrationForm
  }
})
export default class Register extends Mixins(ApiServiceMixin) {
  public registrationData: RegistrationData = { username: '', email: '', password: '' };

  public signupResult: AuthError | null = null;

  public interactiveBackground = true;

  async doRegister (): Promise<void> {
    if (!(this.registrationData.username.length &&
          this.registrationData.email &&
          this.registrationData.password)) {
      return;
    }

    await this.$recaptchaLoaded();
    const token = await this.$recaptcha('REGISTER');

    this.signupResult = (await this.api.auth.register(
      this.registrationData.username,
      this.registrationData.email,
      this.registrationData.password,
      token)).code ?? 0;
  }

  public async registerGoogle (credentials: string): Promise<void> {
    await this.$recaptchaLoaded();

    const token = await this.$recaptcha('REGISTER_GOOGLE');

    await this.api.auth.registerGoogle(credentials, token);
  }

  secureInteract (active: boolean): void {
    this.interactiveBackground = !active;
  }
}
</script>
