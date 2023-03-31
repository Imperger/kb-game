<template>
  <div ref="button"></div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Emit, Mixins, Prop, Ref, Watch } from 'vue-property-decorator';
import { ApiServiceMixin, StoreMixin } from '@/mixins';
import { injectScript } from '@/util/inject-script';

type IdToken = string;

@Component
export default class GoogleAuthButton extends Mixins(StoreMixin, ApiServiceMixin) {
  @Prop()
  public readonly text!: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';

  @Emit('credentials')
  emitCredentials (credentials: IdToken): void { }

  @Ref('button')
  public readonly button!: HTMLElement;

  @Watch('Settings.locale')
  resetStateIfNoninteractive (locale: string, prevLocale: string): void {
    window.google.accounts.id.renderButton(this.button, {
      type: 'standard',
      text: this.text,
      locale
    });
  }

  public async mounted (): Promise<void> {
    if (!window.google) {
      try {
        await injectScript('https://accounts.google.com/gsi/client');
      } catch (e) {
        // Failed to load gsi
      }
    }

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.VUE_APP_GOOGLE_AUTH_CLIENT_ID,
        callback: x => this.emitCredentials(x.credential)
      });

      window.google.accounts.id.renderButton(this.button, {
        type: 'standard',
        text: this.text,
        locale: this.Settings.locale ?? ''
      });
    }
  }
}
</script>
