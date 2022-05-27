<template>
<v-container>
    <v-row>
        <v-col>
            <spawner-manager />
        </v-col>
    </v-row>
</v-container>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import SpawnerManager from '@/components/spawner/SpawnerManager.vue';

@Component({
  components: {
    SpawnerManager
  }
})
export default class MainMenuServer extends Vue {
}
</script>
