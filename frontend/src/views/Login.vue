<template>
  <form class="loginComponent">
    <MyTextInput v-model="usernameOrEmail" :label="$t('auth.usernameOrEmail')" name="userid" v-validate="'login_or_email'" data-vv-delay="600"/>
    <MyTextInput v-model="password" password :label="$t('auth.password')" name="password" v-validate="'required|length:8,100'" data-vv-delay="600"/>
    <div class="loginButtonWrapper">
      <MyButton @click="onSubmit" :disabled="loginButtonDisabled">{{ $t('auth.login') }}</MyButton>
      <span class="loginError">{{ loginError }}</span>
    </div>
  </form>
</template>

<style scoped>
.loginComponent {
  margin: auto;
}

.loginButtonWrapper {
  display: flex;
}

.loginError {
  margin-left: 10px;
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

@Component({
  components: {
    MyTextInput,
    MyButton
  }
})
export default class Login extends Mixins(ApiServiceMixin) {
  private usernameOrEmail = '';

  private password = '';

  private loginError = '';

  async onSubmit (): Promise<void> {
    try {
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('LOGIN');
      await this.api.login(this.usernameOrEmail, this.password, token);
      this.loginError = '';
    } catch (e) {
      this.loginError = 'Login failed';
    }
  }

  private get loginButtonDisabled () {
    return this.usernameOrEmail.length === 0 ||
    this.password.length === 0 ||
    this.$validator.errors.first('userid')?.length > 0 ||
    this.$validator.errors.first('password')?.length > 0;
  }
}
</script>
