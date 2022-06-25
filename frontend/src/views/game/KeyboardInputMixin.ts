import { fromEvent, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class KeyboardInputMixin extends Vue {
  private unpressed!: Set<string>;
  private $keydown!: Subscription;
  private $keyup!: Subscription;

  created (): void {
    this.unpressed = new Set<string>();

    const skipList = ['Shift', 'Control', 'Alt', 'Tab', 'CapsLock', 'Escape', 'Meta',
      'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];

    this.$keydown = fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(x => !skipList.includes(x.key)),
        filter(x => !this.unpressed.has(x.code)),
        tap(x => this.unpressed.add(x.code)),
        map(x => x.key))
      .subscribe(x => this.keypress(x));

    this.$keyup = fromEvent<KeyboardEvent>(document, 'keyup')
      .pipe(map(x => x.code))
      .subscribe(x => this.keyup(x));
  }

  destroyed (): void {
    this.$keydown.unsubscribe();
    this.$keyup.unsubscribe();
  }

  keypress (key: string): void {
    throw new Error('Define me or not extends from');
  }

  private keyup (code: string): void {
    this.unpressed.delete(code);
  }
}
