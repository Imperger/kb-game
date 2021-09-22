<template>
<div class="loginComponent">
  <AppLangSelector />
  <form>
    <MyTextInput v-model="usernameOrEmail" :label="$t('auth.usernameOrEmail')" name="userid" v-validate="'username_or_email'" data-vv-delay="600"/>
    <MyTextInput v-model="password" password :label="$t('auth.password')" name="password" v-validate="'required|length:8,100'" data-vv-delay="600"/>
    <div class="loginButtonWrapper">
      <MyButton @click="onSubmit" :disabled="loginButtonDisabled">{{ $t('auth.login') }}</MyButton>
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
import ApiServiceMixin from '@/mixins/api-service-mixin';

import MyTextInput from '@/components/MyTextInput.vue';
import MyButton from '@/components/MyButton.vue';
import { isAxiosError } from '@/typeguards/axios-typeguard';
import { LoginResponse } from '@/services/api-service/interfaces/login-response';
import { StatusCode } from '@/services/api-service/types/status-code';
import AppLangSelector from '@/components/AppLangSelector.vue';

@Component({
  components: {
    AppLangSelector,
    MyTextInput,
    MyButton
  }
})
export default class Login extends Mixins(ApiServiceMixin) {
  private usernameOrEmail = '';

  private password = '';

  private loginErrorStatusCode: StatusCode | null = null;

  async onSubmit (): Promise<void> {
    this.loginErrorStatusCode = null;

    try {
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('LOGIN');
      await this.api.login(this.usernameOrEmail, this.password, token);
    } catch (e) {
      if (isAxiosError<LoginResponse>(e)) {
        this.loginErrorStatusCode = e.response?.data.code as StatusCode;
      }
    }
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
