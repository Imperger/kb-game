<template>
  <div>{{ result }}</div>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import ApiServiceMixin from '@/mixins/api-service-mixin';
import { isAxiosError } from '@/typeguards/axios-typeguard';
import { isRejectedResponse } from '@/services/api-service/rejected-response';

@Component
export default class RegistrationConfirm extends Mixins(ApiServiceMixin) {
  @Prop()
  private readonly code!: string;

  private result = '';

  async mounted (): Promise<void> {
    const response = await this.api.auth.confirmRegistration(this.code);
    if (isRejectedResponse(response)) {
      this.result = response?.message ?? 'Unknown error';
    } else {
      this.result = 'Registration successfully completed';
    }
  }
}
</script>
