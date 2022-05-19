<template>
<div class="loginComponent">
  <KeyboardBackground :interactive="interactiveBackground" />
  <AppLangSelector />
  <form @keyup.enter="onSubmit">
    <MyTextInput v-model="usernameOrEmail" :label="$t('auth.usernameOrEmail')" name="userid" v-validate="'username_or_email'" data-vv-delay="600" @focus="interactive"/>
    <MyTextInput
      v-model="password"
      password
      :label="$t('auth.password')"
      name="password"
      v-validate="'required|length:8,100'"
      data-vv-delay="600"
      @focus="nonInteractive"
      @blur="interactive"/>
    <div class="loginButtonWrapper">
      <MyButton @click="doLogin" :disabled="loginButtonDisabled">{{ $t('auth.login') }}</MyButton>
      <span v-show="hasLoginErrorMessage" class="loginError">{{ loginError }}</span>
    </div>
  </form>
</div>
</template>

<style scoped>

.langSelector {
  position: absolute;
  right: 25px;
  top: 25px;
}

.loginComponent {
  margin: auto;
}

.loginButtonWrapper {
  display: flex;
}

.loginError {
  position: absolute;
  margin-left: 132px;
  padding-top: 13px;
  max-height: 39px;
  color: #f90909;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { ApiServiceMixin, StoreMixin } from '@/mixins';

import MyTextInput from '@/components/MyTextInput.vue';
import MyButton from '@/components/MyButton.vue';
import { isAxiosError } from '@/typeguards/axios-typeguard';
import { LoginResponse, StatusCode } from '@/services/api-service/auth/types';
import AppLangSelector from '@/components/AppLangSelector.vue';
import KeyboardBackground from '@/components/KeyboardBackground.vue';

@Component({
  components: {
    AppLangSelector,
    MyTextInput,
    MyButton,
    KeyboardBackground
  }
})
export default class Login extends Mixins(ApiServiceMixin, StoreMixin) {
  private usernameOrEmail = '';

  private password = '';

  private loginErrorStatusCode: StatusCode | null = null;

  private interactiveBackground = true;

  private async doLogin () {
    this.loginErrorStatusCode = null;

    try {
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('LOGIN');
      const resp = await this.api.auth.login(this.usernameOrEmail, this.password, token);
      if (resp?.token) {
        this.App.setToken(resp.token);
        this.api.auth.accessToken = resp.token;
      }
    } catch (e) {
      if (isAxiosError<LoginResponse>(e)) {
        this.loginErrorStatusCode = e.response?.data.code as StatusCode;
      }
    }
  }

  private interactive () {
    this.interactiveBackground = true;
  }

  private nonInteractive () {
    this.interactiveBackground = false;
  }

  private get loginError () {
    switch (this.loginErrorStatusCode) {
      case StatusCode.InvalidCredentials:
        return this.$t('auth.invalidCredentials') as string;
      case StatusCode.PendingConfirmRegistration:
        return this.$t('auth.pendingConfirmation') as string;
      case StatusCode.PendingConfirmRegistrationExpired:
        return this.$t('auth.confirmationExpired') as string;
      default:
        return this.$t('auth.unknownError') as string;
    }
  }

  private get hasLoginErrorMessage () {
    return this.loginErrorStatusCode !== null;
  }

  private get loginButtonDisabled () {
    return this.usernameOrEmail.length === 0 ||
    this.password.length === 0 ||
    this.$validator.errors.first('userid')?.length > 0 ||
    this.$validator.errors.first('password')?.length > 0;
  }
}
</script>
