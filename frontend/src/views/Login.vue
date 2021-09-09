<template>
  <form>
    <div class="inputWrapper">
      <MyTextInput v-model="usernameOrEmail" label="Username or email" name="userid" v-validate="'login_or_email'"/>
      <span class="error">{{ errors.first('userid') }}</span>
    </div>
    <div class="inputWrapper">
      <MyTextInput v-model="password" password label="Password" name="password" v-validate="'required|length:8,100'"/>
      <span class="error">{{ errors.first('password') }}</span>
    </div>
    <MyButton @click="onSubmit">Login</MyButton>
  </form>
</template>

<style scoped>
.inputWrapper {
  display: flex;
}

.error {
  margin-left: 10px;
  padding-top: 21px;
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

  async onSubmit (): Promise<void> {
    try {
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('LOGIN');
      const response = await this.api.login(this.usernameOrEmail, this.password, token);
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  }

  private get loginButtonDisabled () {
    return this.$validator.errors.first('userid')?.length > 0 ||
    this.$validator.errors.first('password')?.length > 0;
  }
}
</script>
