<template>
  <form>
    <MyTextInput v-model="usernameOrEmail" label="Username or email"/>
    <MyTextInput v-model="password" password label="Password" />
    <MyButton @click="onSubmit">Login</MyButton>
  </form>
</template>

<style scoped>

</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ApiServiceMixin from '@/mixins/api-service-mixin';

import MyTextInput from '@/components/MyTextInput.vue';
import MyButton from '@/components/MyButton.vue'

@Component({ components: { 
  MyTextInput,
  MyButton
}})
export default class Login extends Mixins(ApiServiceMixin) {
  private usernameOrEmail = '';
  private password = '';

  async onSubmit() {
    try {
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('LOGIN');
      const response = await this.api.login(this.usernameOrEmail, this.password, token);
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  }
}
</script>