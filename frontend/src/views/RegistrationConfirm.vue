<template>
  <div>{{ result }}</div>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import ApiServiceMixin from '@/mixins/api-service-mixin';
import { isAxiosError } from '@/typeguards/axios-typeguard';
import { RegistrationConfirmResponse } from '@/services/api-service/auth/types';
import { isRejectedResponse } from '@/services/api-service/rejected-response';

@Component
export default class RegistrationConfirm extends Mixins(ApiServiceMixin) {
  @Prop()
  private readonly code!: string;

  private result = '';

  async mounted (): Promise<void> {
    try {
      const response = await this.api.auth.confirmRegistration(this.code);
      if (response.code === 0) {
        this.result = 'Registration successfully completed';
      } else if (isRejectedResponse(response)) {
        this.result = response?.message ?? 'Unknown error';
      }
    } catch (e: unknown) {
      if (isAxiosError<RegistrationConfirmResponse>(e)) {
        this.result = e.response?.data.message ?? 'Unknown error';
      }
    }
  }
}
</script>
