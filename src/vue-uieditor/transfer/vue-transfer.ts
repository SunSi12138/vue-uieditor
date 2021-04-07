import { UETransfer } from '../base/ue-base';
import { UECompiler } from '../base/ue-compiler';
import { UERender } from '../base/ue-render';
import _ from 'lodash';

const groupOrder = 3;
const group = '公用组件库/Vue 组件';

export const VueTransfer: UETransfer = UERender.DefineTransfer({
  'uieditor-vue-def': {
    type: 'div',
    transfer(render, extend) {
      let content = extend.getPropValue('content', true);
      if (content) {
        const babelContent = UECompiler.babelTransform(`function __bg_vue_def_ctx(){ return ${content}; }`);
        let contentDef = (new Function('__bg_vue_def_', `with(__bg_vue_def_) { return { mixins: [(function() { ${babelContent.code}; return __bg_vue_def_ctx(); })(), { data: function(){ __bg_vue_def_.$this = this; return {}; } }] } }`))({ $this: {}, ...extend.global });
        extend.extendMixin(contentDef)
      }
      // if (extend.editing) return render;
      return null;
    },
    "editor": {
      group,
      groupOrder,
      show: false,
      text: "vue-def",
      inline: true,
      empty: '$$vue-def',
      attrs: {
        content: {
          group: '组件',
          bind: true,
          editorBind: true,
          effect: true,
          isVueDef: true,
          value: ''
        },
        class: { effect: false }
      }
    }
  },
  'keep-alive': {
    transfer(render, extend) {
      if (extend.editing)
        render.type = 'div';
      return render;
    },
    "editor": {
      text: 'keep-alive',
      order: 0,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-template-1',
      base: false,
      container: true,
      containerBorder: true,
      attrs: {
        'include,exclude,max': {
          group: '组件',
          bind: true,
          value: ''
        }
      }
    }
  },
  'router-view': {
    "editor": {
      text: 'router-view',
      order: 1,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-templeate-1',
      empty: 'router-view'
    }
  },
  'router-link': {
    transfer(render, extend) {
      if (extend.editing) {
        render.type = 'span';
      }
      return render;
    },
    "editor": {
      text: 'router-link',
      order: 2,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-share',
      base: false,
      container: true,
      inline: true,
      containerBorder: true,
      attrs: {
        to: {
          group: '组件',
          enabledBind: true,
          value: '/path1'
        }
      }
    }
  },
  template: {
    transfer(render, extend) {
      const { editing, getPropText } = extend;
      if (editing) {
        render.type = 'div';
        const scope = _.trim(getPropText('slot-scope', '', true));
        if (scope) {
          _.assign(extend.data, {
            [scope]: {}
          });
        }
      }
      return render;
    },
    "editor": {
      order: 3,
      groupOrder,
      group,
      text: 'template',
      icon: 'layui-icon layui-icon-form',
      base: false,
      container: true,
      containerBorder: true,
      attrs: {
        slot: { value: 'tmpl1', order: 0, enabledBind: false },
        'slot-scope': { effect: true, order: 1, enabledBind: false, bind: false }
      }
    }
  },
  component: {
    "editor": {
      order: 4,
      groupOrder,
      group,
      text: 'component',
      icon: 'layui-icon layui-icon-app',
      empty: 'component',
      inline: true,
      attrs: {
        'is': { order: 0, enabledBind: true },
        'inline-template': { order: 1, type: 'boolean' }
      }
    }
  },
  transition: {
    transfer(render, extend) {
      const { editing, getPropText } = extend;
      if (editing) {
        render.type = 'div';
      }
      return render;
    },
    "editor": {
      order: 3,
      groupOrder,
      group,
      text: 'transition',
      icon: 'layui-icon layui-icon-form',
      base: false,
      container: true,
      containerBorder: true,
      attrs: {
        name: { order: 0 },
        'appear,css': { order: 1, type: 'boolean' },
        type: { order: 5, type: 'select', datas:['transition', 'animation'] },
        mode: { order: 6, type: 'select', datas:['out-in', 'in-out'] },
        'duration,enter-class,leave-class,appear-class,enter-to-class,leave-to-class,appear-to-class,enter-active-class,leave-active-class,appear-active-class': { order: 0 },
        'before-enter,before-leave,before-appear,enter,leave,appear,after-enter,after-leave,after-appear,enter-cancelled,leave-cancelled,appear-cancelled': { order: 30, event:true }
      }
    }
  }
});

