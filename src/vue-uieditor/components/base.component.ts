import { UEVueMixin } from "../base/vue-extends";

function _makeBaseComponent(type: string, hasChild?: boolean): UEVueMixin {
  return {
    render(h) {
      const $this = this;
      if (!hasChild)
        return h(type, {
          on: {
            click(e) {
              $this.$emit('click', e);
            }
          }
        });
      else
        return h(type, {
          on: {
            click(e) {
              $this.$emit('click', e);
            }
          }
        }, this.$slots.default);
    }
  } as UEVueMixin;
}

const uieditorText = {
  render(h) {
    const $this = this;
    return h('span', {
      on: {
        click(e) {
          $this.$emit('click', e);
        }
      }
    }, this.text);
  },
  props: ['text']
} as UEVueMixin;


const uieditorHtml = {
  render(h) {
    const $this = this;
    return h($this.type || 'div', {
      domProps: {
        innerHTML: $this.content
      },
      on: {
        click(e) {
          $this.$emit('click', e);
        }
      }
    }, this.$slots.default);
  },
  props: ['type', 'content']
} as UEVueMixin;

export const UEBaseComponents = {
  'uieditor-div': _makeBaseComponent('div', true),
  'uieditor-span': _makeBaseComponent('span', true),
  'uieditor-img': _makeBaseComponent('img'),
  'uieditor-iframe': _makeBaseComponent('iframe'),
  'uieditor-a': _makeBaseComponent('a', true),
  'uieditor-text': uieditorText,
  'uieditor-html': uieditorHtml
};