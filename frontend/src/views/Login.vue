<template>
  <form @submit.prevent="onSubmit">
    <TextInput v-model="usernameOrEmail" label="Username or email"/>
    <TextInput v-model="password" password label="Password" />
    <button>Login</button>
  </form>
</template>

<style scoped>

</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ApiServiceMixin from '@/mixins/api-service-mixin';

import TextInput from '../components/TextInput.vue';

@Component({ components: { TextInput }})
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