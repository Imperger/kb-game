<template>
  <form @submit.prevent="onSubmit">
    <input v-model="usernameOrEmail" type="text" class="block" />
    <input v-model="password" type="password" class="block" />
    <button>Login</button>
  </form>
</template>

<style scoped>
.block {
  display: block;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ApiServiceMixin from '@/mixins/api-service-mixin';

@Component
export default class Login extends Mixins(ApiServiceMixin) {
  private usernameOrEmail = '';
  private password = '';

  async onSubmit() {
    try {
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('register');
      const response = await this.api.login(this.usernameOrEmail, this.password, token);
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  }
}
</script>