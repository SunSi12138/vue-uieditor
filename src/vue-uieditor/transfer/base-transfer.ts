import { UETransfer } from '../base/ue-base';
import _ from 'lodash';
import { UERender } from '../base/ue-render';
import { UECompiler } from '../base/ue-compiler';

const groupOrder = 2;
const group = '公用组件库/基础组件';

export const BaseTransfer: UETransfer = UERender.DefineTransfer({
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
      group: "公用组件库/Vue",
      groupOrder: 100,
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
  'uieditor-div': {
    type: 'div',
    "editor": {
      text: 'Div 块级标签',
      order: 0,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-template-1',
      base: false,
      container: true,
      className: 'drawing-item p-sm'
    }
  },
  'uieditor-span': {
    type: 'span',
    "editor": {
      text: 'Span 行内标签',
      order: 0,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-more',
      base: false,
      inline: true,
      container: true,
      className: 'drawing-item p-sm'
    }
  },
  'uieditor-img': {
    type: 'img',
    "editor": {
      text: "Image 图片",
      order: 0,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-picture',
      inline: true,
      attrs: {
        src: {
          enabledBind: true,
          order: 0,
          value: './vue-uieditor/assets/images/demo.png',
          effect: true,
        },
        style: { value: 'min-width:30px;min-height:30px' }
      }
    }
  },
  'uieditor-iframe': {
    type: 'iframe',
    editor: {
      text: 'Iframe 内框架',
      order: 0,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-layer',
      empty: 'iframe',
      attrs: {
        src: {
          enabledBind: true,
          order: 1,
          row: true
        },
        'frameborder:0,height:100%,width:100%,scrolling:yes': {
          enabledBind: true,
          order: 2
        }
      }
    }
  },
  'uieditor-text': {
    transfer(render, extend) {
      const { getPropText } = extend;
      render.type = 'span';
      const text = getPropText('text', 'Text', true);
      render.children = [text];
      return render;
    },
    "editor": {
      text: 'Text 文本',
      order: 0,
      groupOrder,
      group,
      inline: true,
      icon: 'layui-icon layui-icon-align-left',
      attrs: {
        text: {
          effect: true, enabledBind: true,
          value: "文本内容",
          order: 0
        },
        click: { event: true, order: 30 }
      }
    }
  },
  'uieditor-a': {
    transfer(render, extend) {
      const { getPropText } = extend;
      render.type = 'a';
      const text = getPropText('text', '链接', true);
      render.children = [text];
      return render;
    },
    "editor": {
      text: 'Link 超链接',
      order: 0,
      groupOrder,
      group,
      inline: true,
      icon: 'layui-icon layui-icon-link',
      attrs: {
        text: {
          effect: true, enabledBind: true,
          value: "超链接",
          order: 0
        },
        click: { event: true }
      }
    }
  },
  'uieditor-html': {
    transfer(render, extend) {
      const { editing, getProp, getPropValue } = extend;
      let html = getProp('content', true);
      let type = getPropValue('type', true);
      let preview = getPropValue('preview', true);
      render.type = type || 'div';
      if (!editing || preview === 'true') {
        if (html.bind) {
          render.props = _.assign({}, render.props, {
            'v-html': html.value
          });
        } else
          render.children = [html.value];
      } else {
        render.props.class = `${render.props.class || ''} empty-component`;

        render.children = ['Html'];
      }
      if (editing && render.type == 'div')
        render.props.style = 'display:block;';
      return render;
    },
    "editor": {
      text: 'Html 超文本',
      order: 0,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-fonts-html',
      // empty: 'Html',
      attrs: {
        content: {
          effect: true,
          language: 'html',
          enabledBind: true,
          row: true,
          value: "<span>html</span>"
        },
        type: {
          effect: true,
          type: 'select-only',
          datas: ['div', 'span'],
          value: "div"
        },
        preview: {
          text: '预览',
          effect: true,
          bind: false,
          type: 'select-only',
          datas: ['true', 'false'],
          value: 'false'
        }
      }
    }
  }
});
