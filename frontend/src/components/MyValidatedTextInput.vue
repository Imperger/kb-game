<template>
<div class="myValidatedTextInput">
    <MyTextInput v-bind="$attrs" v-on="$listeners" v-validate="validate"/>
    <span class="message">{{ message }}</span>
</div>
</template>

<style scoped>
.myValidatedTextInput {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.message {
    color: #f90909;
    margin-top: -12px;
}
</style>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

import MyTextInput from '@/components/MyTextInput.vue';

@Component({
  components: {
    MyTextInput
  }
})
export default class MyValidatedTextInput extends Vue {
    @Prop({ required: true, type: [String, Function] })
    private validate!: string;

    @Emit('validation')
    private validation (result: boolean) {}

    private valid = true;

    private get message () {
      const ret = this.$validator.errors.first(this.$attrs.name);

      if (this.valid !== (ret === undefined)) {
        this.valid = !this.valid;
        this.validation(this.valid);
      }

      return ret;
    }
}

</script>
