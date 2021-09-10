<template>
  <form class="signupForm">
    <MyValidatedTextInput
    v-model="username"
    :label="$t('auth.username')"
    name="username"
    :validate="'required|length:3,16'"
    @validation="validate"
    data-vv-delay="600"/>

    <MyValidatedTextInput v-model="email"
    :label="$t('auth.email')"
    name="email"
    :validate="'required|email'"
    @validation="validate"
    data-vv-delay="600"/>

    <MyValidatedTextInput
    v-model="password"
    password
    :label="$t('auth.password')"
    name="password"
    :validate="'required|length:8,100'"
    @validation="validate"
     data-vv-delay="600"/>

    <div class="signupButtonWrapper">
      <MyButton @click="onSubmit" :disabled="registerButtonDisabled">{{ $t('auth.signup') }}</MyButton>
      <span class="signupError">{{ signupError }}</span>
    </div>
  </form>
</template>

<style scoped>
.signupForm {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signupButtonWrapper {
  margin-top: 10px;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import MyValidatedTextInput from '@/components/MyValidatedTextInput.vue';
import MyButton from '@/components/MyButton.vue';
import ApiServiceMixin from '../mixins/api-service-mixin';

@Component({
  components: {
    MyValidatedTextInput,
    MyButton
  }
})
export default class Register extends Mixins(ApiServiceMixin) {
  private username = '';

  private email = '';

  private password = '';

  private signupError = '';

  private validInputCounter = 0;

  async onSubmit (): Promise<void> {
    try {
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('REGISTER');
      const response = await this.api.register(this.username, this.email, this.password, token);
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  }

  private get registerButtonDisabled () {
    return this.username.length === 0 ||
    this.email.length === 0 ||
    this.password.length === 0 ||
    this.validInputCounter < 0;
  }

  private validate (valid: boolean) {
    this.validInputCounter += valid ? 1 : -1;
  }
}
</script>
