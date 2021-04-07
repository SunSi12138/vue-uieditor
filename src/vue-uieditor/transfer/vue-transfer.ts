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
      icon: 'layui-icon layui-icon-app',
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
      const { editing,getPropText } = extend;
      if (editing) {
        render.type = 'div';
        const scope = _.trim(getPropText('slot-scope', '', true));
        if(scope){
          _.assign(extend.data, {
            [scope]:{}
          });
        }
      }
      return render;
    },
    "editor": {
      order: 0,
      groupOrder,
      group,
      text: 'template',
      icon: 'layui-icon layui-icon-form',
      base: false,
      container: true,
      containerBorder: true,
      attrs: {
        slot: { value: 'tmpl1' },
        'slot-scope': { effect: true }
      }
    }
  }
});
