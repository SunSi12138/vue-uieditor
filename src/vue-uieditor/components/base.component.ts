import { UEVueMixin } from "../base/vue-extends";

function _makeBaseComponent(type: string): UEVueMixin {
  return {
    render(h) {
      return h(type, {}, this.$slots.default);
    }
  } as UEVueMixin;
}

const uieditorText = {
  render(h) {
    return h('span', this.text, this.$slots.default);
  },
  props: ['text']
} as UEVueMixin;


const uieditorHtml = {
  render(h) {
    return h(this.type || 'div', {
      domProps: {
        innerHTML: this.content
      }
    }, this.$slots.default);
  },
  props: ['type', 'content']
} as UEVueMixin;

export const UEBaseComponents = {
  'uieditor-div': _makeBaseComponent('div'),
  'uieditor-span': _makeBaseComponent('span'),
  'uieditor-img': _makeBaseComponent('img'),
  'uieditor-iframe': _makeBaseComponent('iframe'),
  'uieditor-a': _makeBaseComponent('a'),
  'uieditor-text': uieditorText,
  'uieditor-html': uieditorHtml
};