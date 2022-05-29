<template>
<v-container>
    <v-row>
        <v-col md="auto" class="pa-1">
            <v-btn class="btn-tile" plain>Quik game</v-btn>
        </v-col>
        <v-col md="auto" class="pa-1">
            <v-btn @click="newCustomGame" class="btn-tile" plain>Custom game</v-btn>
        </v-col>
    </v-row>
</v-container>
</template>

<style scoped>
.btn-tile {
    width: 250px;
    min-height: 140px;
    color: white;
    background-color: #039be5;
}
</style>

<script lang="ts">
import { ApiServiceMixin } from '@/mixins';
import { Component, Mixins, Vue } from 'vue-property-decorator';

@Component
export default class MainMenuPlay extends Mixins(ApiServiceMixin) {
  async newCustomGame (): Promise<void> {
    this.api.game.newCustom();
  }
}
</script>
