<template>
<v-form @submit.prevent="">
  <validation-observer
    v-slot="{ invalid }">
    <validation-provider
      v-slot="{ errors }"
      name="Name"
      rules="required|username">
      <v-text-field
        v-model="registrationData.username"
        :label="$t('auth.username')"
        name="username"
        :error-messages="errors"
        @focus="emitSecureInteract(false)"/>
    </validation-provider>
    <validation-provider
      v-slot="{ errors }"
      name="Name"
      rules="required|email">
      <v-text-field v-model="registrationData.email"
        :label="$t('auth.email')"
        name="email"
        :error-messages="errors"
        @focus="emitSecureInteract(false)"/>
    </validation-provider>
    <validation-provider
      v-slot="{ errors }"
      name="Name"
      rules="required|password">
      <v-text-field
        v-model="registrationData.password"
        type="password"
        :label="$t('auth.password')"
        name="password"
        :error-messages="errors"
        @focus="emitSecureInteract(true)"
        @blur="emitSecureInteract(false)"/>
    </validation-provider>
      <div>
        <v-btn @click="emitSubmit" :disabled="invalid" type="submit">{{ $t('auth.signup') }}</v-btn>
        <span v-show="hasSignupResultMessage" class="signup-result" :class="signupMessageType">{{ signupResultMessage }}</span>
      </div>
  </validation-observer>
  </v-form>
</template>

<style scoped>
.signup-result {
  position: relative;
  left: 25px;
}

.signup-result-ok {
  color: #2c2c2c;
}

.signup-result-error {
  color: #f90909;
}
</style>

<script lang="ts">
import { Component, Emit, Model, Vue, Prop } from 'vue-property-decorator';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

import { StatusCode } from '@/services/api-service/auth/types';

export interface RegistrationData {
  username: string;
  email: string;
  password:string;
}

@Component({
  components: {
    ValidationProvider,
    ValidationObserver
  }
})
export default class RegistrationForm extends Vue {
  @Model('registrationData')
  registrationData!: RegistrationData;

  @Prop({ type: [Number], default: null })
  status: StatusCode | null = null;

  @Emit('registrationData')
  emitRegistrationData (fields: RegistrationData): void { }

  @Emit('secureInteract')
  emitSecureInteract (active: boolean): void {}

  @Emit('submit')
  emitSubmit (): void {}

  private validInputCounter = 0;

  validate (valid: boolean): void {
    this.validInputCounter += valid ? 1 : -1;
  }

  get registerButtonDisabled (): boolean {
    return this.registrationData.username.length === 0 ||
    this.registrationData.email.length === 0 ||
    this.registrationData.password.length === 0 ||
    this.validInputCounter < 0;
  }

  get signupResultMessage (): string {
    switch (this.status) {
      case StatusCode.Ok:
        return this.$t('auth.registrationSuccess') as string;
      case StatusCode.UsernameIsTaken:
        return this.$t('auth.usernameIsTaken') as string;
      case StatusCode.EmailIsTaken:
        return this.$t('auth.emailIsTaken') as string;
      default:
        return this.$t('auth.unknownError') as string;
    }
  }

  get hasSignupResultMessage (): boolean {
    return this.status !== null;
  }

  get signupMessageType ():string {
    return `signup-result-${this.status === StatusCode.Ok ? 'ok' : 'error'}`;
  }
}
</script>
