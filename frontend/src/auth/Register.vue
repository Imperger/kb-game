<template>
<div class="register-component">
  <keyboard-background :interactive="interactiveBackground" />
  <app-language-selector class="language-selector" />
  <registration-form
    v-model="registrationData"
    :status="signupResult"
    @secureInteract="secureInteract"
    @submit="doRegister"/>
</div>
</template>

<style scoped>
.register-component {
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
import ApiServiceMixin from '@/mixins/api-service-mixin';
import { isAxiosError } from '@/typeguards/axios-typeguard';
import KeyboardBackground from '@/components/KeyboardBackground.vue';
import AppLanguageSelector from '@/components/AppLanguageSelector.vue';
import RegistrationForm, { RegistrationData } from '@/components/RegistrationForm.vue';

@Component({
  components: {
    KeyboardBackground,
    AppLanguageSelector,
    RegistrationForm
  }
})
export default class Register extends Mixins(ApiServiceMixin) {
  private registrationData: RegistrationData = { username: '', email: '', password: '' };

  private signupResult: AuthError | null = null;

  private interactiveBackground = true;

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

  secureInteract (active: boolean): void {
    this.interactiveBackground = !active;
  }
}
</script>
