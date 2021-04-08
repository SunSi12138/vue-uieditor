import { UEVueMixin } from "../base/vue-extends";

function _makeBaseComponent(type: string, hasChild?: boolean): UEVueMixin {
  return {
    render(h) {
      if (!hasChild)
        return h(type);
      else
        return h(type, {}, this.$slots.default);
    }
  } as UEVueMixin;
}

const uieditorText = {
  render(h) {
    return h('span', this.text);
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
  'uieditor-div': _makeBaseComponent('div', true),
  'uieditor-span': _makeBaseComponent('span', true),
  'uieditor-img': _makeBaseComponent('img'),
  'uieditor-iframe': _makeBaseComponent('iframe'),
  'uieditor-a': _makeBaseComponent('a', true),
  'uieditor-text': uieditorText,
  'uieditor-html': uieditorHtml
};