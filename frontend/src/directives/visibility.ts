import { DirectiveOptions } from 'vue';

export const visibility: DirectiveOptions = {
  inserted (el, binding) {
    el.style.visibility = binding.value ? 'visible' : 'hidden';
  },
  update (el, binding) {
    el.style.visibility = binding.value ? 'visible' : 'hidden';
  }
};
