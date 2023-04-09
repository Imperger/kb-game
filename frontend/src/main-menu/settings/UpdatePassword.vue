<template>
  <v-card>
    <v-stepper v-model="step">
      <v-stepper-header>
        <v-stepper-step :complete="passwordCheked" step="0">Check password</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="1">Update password</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="0">
          <v-form @submit.prevent="">
            <validation-observer v-slot="{ invalid }">
              <v-row justify="center">
                <v-col cols="5" class="text-h5">Password</v-col>
                <v-col cols="5" class="text-h5">
                  <validation-provider name="password" rules="required|length:8,100" immediate v-slot="{ errors }">
                    <v-text-field v-model="checkedPassword" name="password" type="password" :error-messages="errors" />
                  </validation-provider>
                </v-col>
              </v-row>
              <v-card-actions>
                <v-btn :disabled="invalid" @click="checkPassword" class="update-btn">Check</v-btn>
                <span v-visibility="isCheckPasswordFailed" class="error-msg">Wrong password</span>
              </v-card-actions>
            </validation-observer>
          </v-form>
        </v-stepper-content>
      </v-stepper-items>
      <v-stepper-items>
        <v-stepper-content step="1">
          <v-form @submit.prevent="">
            <validation-observer v-slot="{ invalid }">
              <v-row justify="center">
                <v-col cols="5" class="text-h5">Password</v-col>
                <v-col cols="5" class="text-h5">
                  <validation-provider name="password" rules="required|length:8,100" v-slot="{ errors }">
                    <v-text-field v-model="password" name="password" type="password" :error-messages="errors" />
                  </validation-provider>
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="5" class="text-h5">Confirm password</v-col>
                <v-col cols="5" class="text-h5">
                  <validation-provider name="confirm password" rules="required|length:8,100" v-slot="{ errors }">
                    <v-text-field v-model="confirmPassword" name="confirmPassword" type="password"
                      :error-messages="errors" />
                  </validation-provider>
                </v-col>
              </v-row>
              <v-card-actions>
                <div>
                  <v-btn :disabled="trackValidation(invalid) || updateBtnDisabled" @click="updatePassword" class="update-btn">Update</v-btn>
                  <span v-visibility="passwordsDontMatch || updatedPasswordSame" class="error-msg">{{ updatePasswordError }}</span>
                </div>
              </v-card-actions>
            </validation-observer>
          </v-form>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-card>
</template>

<style scoped>
.update-btn {
  display: block;
}

.error-msg {
  color: #f90909;
  margin-left: 10px;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

import { ApiServiceMixin, StoreMixin } from '@/mixins';
import { NotifyType } from '@/store/notify';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { CurrentUser } from '@/services/api-service/user/types';
import { visibility } from '@/directives/visibility';

enum UpdatePasswordSteps { Check, Update }

@Component({
  directives: {
    visibility
  },
  components: {
    ValidationProvider,
    ValidationObserver
  }
})
export default class UpdatePassword extends Mixins(ApiServiceMixin, StoreMixin) {
  public checkedPassword = '';

  public isCheckPasswordFailed = false;

  public password = '';

  public confirmPassword = '';

  public validationError = true;

  public step = UpdatePasswordSteps.Check;

  async created (): Promise<void> {
    const me = await this.api.user.currentUserInfo();

    if (isRejectedResponse(me)) {
      this.Notify.show({ message: 'Failed to fetch profile info', type: NotifyType.Warning });
    } else {
      this.App.setUser(me);
    }

    if (!this.App.user?.hasPassword) {
      this.step = UpdatePasswordSteps.Update;
    }
  }

  public async checkPassword (): Promise<void> {
    await this.$recaptchaLoaded();
    const token = await this.$recaptcha('CHECK_PASSWORD');

    const password = await this.api.auth.validatePassword(this.checkedPassword, token);

    if (!isRejectedResponse(password) && password.valid) {
      this.step = UpdatePasswordSteps.Update;
      this.isCheckPasswordFailed = false;
    } else {
      this.isCheckPasswordFailed = true;
    }
  }

  async updatePassword (): Promise<void> {
    await this.$recaptchaLoaded();
    const token = await this.$recaptcha('UPDATE_PASSWORD');

    const updated = await this.api.auth.updatePassword(
      {
        ...(this.checkedPassword.length > 0 && { password: this.checkedPassword }),
        updatedPassword: this.password
      },
      token);

    if (isRejectedResponse(updated)) {
      this.step = UpdatePasswordSteps.Check;
    } else {
      this.App.signOut();
      this.api.auth.signOut();
      this.$router.push({ name: 'Login' });
    }
  }

  public get user (): CurrentUser {
    return this.App.user as CurrentUser;
  }

  public trackValidation (invalid: boolean): boolean {
    this.validationError = !!invalid;
    return invalid;
  }

  public get emptyPasswords (): boolean {
    return this.password.length === 0 ||
      this.confirmPassword.length === 0;
  }

  public get passwordsDontMatch (): boolean {
    return this.password !== this.confirmPassword &&
      !this.validationError;
  }

  public get updatedPasswordSame (): boolean {
    return this.checkedPassword.length > 0 && this.checkedPassword === this.password &&
    this.checkedPassword === this.confirmPassword;
  }

  public get updateBtnDisabled (): boolean {
    return this.emptyPasswords ||
      this.passwordsDontMatch ||
      this.updatedPasswordSame;
  }

  public get passwordCheked (): boolean {
    return this.step > UpdatePasswordSteps.Check;
  }

  public get updatePasswordError (): string {
    if (this.passwordsDontMatch) {
      return 'Passwords should match';
    } else if (this.updatedPasswordSame) {
      return 'Updated the password is same with the current';
    }

    return '';
  }
}
</script>
