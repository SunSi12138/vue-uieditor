import { UETransfer } from '../base/ue-base';
import _ from 'lodash';
import { UERender } from '../base/ue-render';

const groupOrder = 2;
const group = '公用组件库/基础组件';

export const BaseTransfer: UETransfer = UERender.NewTransfer({
  'uieditor-div': {
    type: 'div',
    "editor": {
      text: 'Div 块级标签',
      order: 0,
      groupOrder,
      group,
      icon: 'ios-square-outline',
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
      icon: 'ios-square-outline',
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
      icon: 'ios-image',
      inline: true,
      attrs: {
        src: {
          group: '组件',
          groupOrder: 1,
          enabledBind: true,
          order: 0,
          value: './modules/bingo_ui_designer/assets/images/demo.png',
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
      icon: 'ios-shuffle',
      empty: 'iframe',
      attrs: {
        'src,frameborder:0,height:100%,width:100%,scrolling:yes': {
          group: '组件',
          groupOrder: 1,
          enabledBind: true,
          order: 0
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
      icon: 'ios-barcode-outline',
      attrs: {
        text: {
          effect: true, enabledBind: true,
          group: "组件",
          groupOrder: 1,
          value: "文本内容",
          order: 0
        },
        click: { group: "组件", event: true, order: 30 }
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
      icon: 'ios-link',
      attrs: {
        text: {
          effect: true, enabledBind: true,
          group: "组件",
          groupOrder: 1,
          value: "超链接",
          order: 0
        },
        click: { group: "组件", event: true }
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
        render.props.class = "empty-component";

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
      inline: true,
      icon: 'ios-paper-outline',
      // empty: 'Html',
      attrs: {
        content: {
          group: '组件',
          groupOrder: 0,
          effect: true,
          language: 'html',
          enabledBind: true,
          value: "<span>html</span>"
        },
        type: {
          group: '组件',
          groupOrder: 0,
          effect: true,
          type: 'select-only',
          datas: ['div', 'span'],
          value: "div"
        },
        preview: {
          group: '组件',
          groupOrder: 0,
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
