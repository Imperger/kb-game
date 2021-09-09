<template>
  <div>
    <form @submit.prevent="onSubmit">
      <input v-model="username" type="text" class="block" />
      <input v-model="email" type="email" class="block" />
      <input v-model="password" type="password" class="block" />
      <button>Register</button>
    </form>
  </div>
</template>

<style scoped>
.block {
  display: block;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import ApiServiceMixin from '../mixins/api-service-mixin';

@Component({})
export default class Register extends Mixins(ApiServiceMixin) {
  private username = '';
  private email = '';
  private password = '';
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
}
</script>
