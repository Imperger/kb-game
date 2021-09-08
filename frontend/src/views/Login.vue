<template>
  <form @submit.prevent="onSubmit">
    <TextInput v-model="usernameOrEmail" label="Username or email" class="block" />
    <TextInput v-model="password" password label="Password" class="block" />
    <button>Login</button>
  </form>
</template>

<style scoped>
.block {
  display: block;
  margin: 2px 0;
}
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