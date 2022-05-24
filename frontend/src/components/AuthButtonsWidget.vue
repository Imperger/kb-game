<template>
<div class="d-flex">
    <v-btn :to="{ name: 'Login' }" class="ma-2" small>Sign in</v-btn>
    <v-btn :to="{ name: 'Register' }" class="ma-2" small>Sign up</v-btn>
</div>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class AuthButtonsWidget extends Vue {
}
</script>
