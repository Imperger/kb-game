<template>
<v-form @submit.prevent="">
  <v-container>
    <validation-observer
      v-slot="{ invalid }">
      <validation-provider
        v-slot="{ errors }"
        name="Name"
        rules="required|username_or_email">
        <v-text-field
          v-model="credentials.identifier"
          :label="$t('auth.usernameOrEmail')"
          name="userid"
          :error-messages="errors"
          @focus="emitSecureInteract(false)"/>
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        name="Name"
        rules="required|length:8,100">
        <v-text-field
          v-model="credentials.password"
          type="password"
          :label="$t('auth.password')"
          name="password"
          :error-messages="errors"
          @focus="emitSecureInteract(true)"
          @blur="emitSecureInteract(false)"/>
      </validation-provider>
      <div class="loginButtonWrapper">
        <v-btn @click="emitSubmit" :disabled="invalid" type="submit">{{ $t('auth.login') }}</v-btn>
        <span v-show="hasLoginErrorMessage" class="error-msg">{{ loginError }}</span>
      </div>
    </validation-observer>
  </v-container>
</v-form>
</template>

<style scoped>
.error-msg {
  position: absolute;
  margin-left: 25px;
  padding-top: 13px;
  max-height: 39px;
  color: #f90909;
}
</style>

<script lang="ts">
import { Component, Vue, Prop, Model, Emit } from 'vue-property-decorator';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

import { StatusCode } from '@/services/api-service/auth/types';

export interface Credentials {
  identifier: string;
  password: string;
}

@Component({
  components: {
    ValidationProvider,
    ValidationObserver
  }
})
export default class LoginForm extends Vue {
  @Model('credentials')
  credentials!: Credentials;

  @Prop({ type: [Number], default: null })
  error: StatusCode | null = null;

  @Emit('credentials')
  emitCredentials (credentials: Credentials): void { }

  @Emit('submit')
  emitSubmit (): void {}

  @Emit('secureInteract')
  emitSecureInteract (active: boolean): void {}

  get loginError (): string {
    switch (this.error) {
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

  get hasLoginErrorMessage (): boolean {
    return this.error !== null;
  }
}
</script>
