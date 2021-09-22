<template>
<div class="registerComponent">
  <KeyboardBackground :interactive="interactiveBackground" />
  <AppLangSelector />
  <form @keyup.enter="onSubmit" class="signupForm">
    <MyValidatedTextInput
    v-model="username"
    :label="$t('auth.username')"
    name="username"
    @focus="interactive"
    :validate="'required|username'"
    @validation="validate"
    data-vv-delay="600"/>

    <MyValidatedTextInput v-model="email"
    :label="$t('auth.email')"
    name="email"
    @focus="interactive"
    :validate="'required|email'"
    @validation="validate"
    data-vv-delay="600"/>

    <MyValidatedTextInput
    v-model="password"
    password
    :label="$t('auth.password')"
    name="password"
    @focus="nonInteractive"
    @blur="interactive"
    :validate="'required|password'"
    @validation="validate"
    data-vv-delay="600"/>

    <div class="signupButtonWrapper">
      <MyButton @click="onSubmit" :disabled="registerButtonDisabled">{{ $t('auth.signup') }}</MyButton>
      <span v-show="hasSignupResultMessage" class="signupMessage" :class="signupMessageType">{{ signupResultMessage }}</span>
    </div>
  </form>
</div>
</template>

<style scoped>
.registerComponent {
  margin: auto;
}

.langSelector {
  position: absolute;
  right: 25px;
  top: 25px;
}

.signupForm {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signupButtonWrapper {
  margin-top: 10px;
}

.signupMessage {
  position: relative
}

.signupMessageOk {
  color: #2c2c2c;
}

.signupMessageError {
  color: #f90909;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import MyValidatedTextInput from '@/components/MyValidatedTextInput.vue';
import MyButton from '@/components/MyButton.vue';
import ApiServiceMixin from '../mixins/api-service-mixin';
import { StatusCode } from '@/services/api-service/types/status-code';
import { isAxiosError } from '@/typeguards/axios-typeguard';
import { RegisterResponse } from '@/services/api-service/interfaces/register-response';
import KeyboardBackground from '@/components/KeyboardBackground.vue';
import AppLangSelector from '@/components/AppLangSelector.vue';

@Component({
  components: {
    KeyboardBackground,
    MyButton,
    MyValidatedTextInput,
    AppLangSelector
  }
})
export default class Register extends Mixins(ApiServiceMixin) {
  private username = '';

  private email = '';

  private password = '';

  private signupResult: StatusCode | null = null;

  private validInputCounter = 0;

  private interactiveBackground = true;

  async onSubmit (): Promise<void> {
    if (this.registerButtonDisabled) {
      return;
    }

    try {
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('REGISTER');
      const response = await this.api.register(this.username, this.email, this.password, token);
      this.signupResult = StatusCode.Ok;
    } catch (e) {
      if (isAxiosError<RegisterResponse>(e)) {
        this.signupResult = e.response?.data.code as StatusCode;
      }
    }
  }

  private get signupMessageType () {
    return `signupMessage${this.signupResult === StatusCode.Ok ? 'Ok' : 'Error'}`;
  }

  private get registerButtonDisabled () {
    return this.username.length === 0 ||
    this.email.length === 0 ||
    this.password.length === 0 ||
    this.validInputCounter < 0;
  }

  private get hasSignupResultMessage () {
    return this.signupResult !== null;
  }

  private get signupResultMessage () {
    switch (this.signupResult) {
      case StatusCode.Ok:
        return this.$t('auth.registrationSuccess') as string;
      case StatusCode.UsernameIsTaken:
        return this.$t('auth.usernameIsTaken') as string;
      case StatusCode.EmailIsTaken:
        return this.$t('auth.emailIsTaken') as string;
      default:
        return this.$t('auth.unknownError') as string;
    }
  }

  private validate (valid: boolean) {
    this.validInputCounter += valid ? 1 : -1;
  }

  private interactive () {
    this.interactiveBackground = true;
  }

  private nonInteractive () {
    this.interactiveBackground = false;
  }
}
</script>
