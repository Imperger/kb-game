<template>
  <div></div>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import ApiServiceMixin from '@/mixins/api-service-mixin';

@Component
export default class RegistrationConfirm extends Mixins(ApiServiceMixin) {
  @Prop()
  private readonly code!: string;

  mounted() { this.api.registrationConfirm(this.code); }
}
</script>