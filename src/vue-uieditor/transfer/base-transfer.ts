import { UETransfer, UECanNotCopyProps, UEIsLockProps } from '../base/ue-base';
import { UERender } from '../base/ue-render';
import { UERenderItem } from '../base/ue-render-item';

const groupOrder = 2;
const group = '公用组件库/基础组件';

function _defaultTextJson() {
  return { children: [{ type: 'uieditor-text' }], props:{[UEIsLockProps]:true} } as UERenderItem;
}

export const BaseTransfer: UETransfer = UERender.DefineTransfer({
  'uieditor-div': {
    "editor": {
      text: 'Div 块级标签',
      order: 0,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-template-1',
      container: true
    }
  },
  'uieditor-span': {
    "editor": {
      text: 'Span 行内标签',
      order: 1,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-more',
      inline: true,
      container: true,
      json: _defaultTextJson()
    }
  },
  'uieditor-img': {
    "editor": {
      text: "Image 图片",
      order: 2,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-picture',
      inline: true,
      attrs: {
        src: {
          order: 0,
          value: './vue-uieditor/assets/images/demo.png',
          effect: true,
        },
        style: { value: 'min-width:30px;min-height:30px' }
      }
    }
  },
  'uieditor-iframe': {
    editor: {
      text: 'Iframe 内框架',
      order: 3,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-layer',
      empty: 'iframe',
      attrs: {
        src: {
          order: 1,
          row: true
        },
        'frameborder:0,height:100%,width:100%,scrolling:yes': {
          order: 2
        }
      }
    }
  },
  'uieditor-text': {
    "editor": {
      text: 'Text 文本',
      order: 4,
      groupOrder,
      group,
      inline: true,
      icon: 'layui-icon layui-icon-align-left',
      attrs: {
        text: {
          effect: true,
          value: "文本内容",
          order: 0
        },
        click: { event: true }
      }
    }
  },
  'uieditor-a': {
    "editor": {
      text: 'Link 超链接',
      order: 5,
      groupOrder,
      group,
      inline: true,
      container: true,
      icon: 'layui-icon layui-icon-link',
      json: _defaultTextJson(),
      attrs: {
        target: {
          type: 'select',
          datas: ['_blank', '_self', '_parent', '_top'],
          order: 1
        },
        href: {
          order: 2, row: true
        },
        click: { event: true }
      }
    }
  },
  'uieditor-html': {
    transfer(render, extend) {
      const { editing, getPropValue } = extend;
      if (editing) {
        let preview = getPropValue('preview', true);
        if (preview !== 'true') {
          render.props.class = `${render.props.class || ''} empty-component`;
          render.props.content = "HTML"
        }
      }
      return render;
    },
    "editor": {
      text: 'Html 超文本',
      order: 6,
      groupOrder,
      group,
      icon: 'layui-icon layui-icon-fonts-html',
      attrs: {
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
          editorOlny: true,
          datas: ['true', 'false'],
          value: 'false'
        },
        content: {
          effect: true,
          language: 'html',
          row: true,
          value: "<span>html</span>"
        }
      }
    }
  },
  'vue-uieditor-render': {
    "editor": {
      order: 6,
      groupOrder,
      group,
      text: 'uieditor-render',
      icon: 'layui-icon layui-icon-senior',
      empty: 'uieditor-render',
      attrs: {
        json: { order: 1, bind: true, row: true, enabledBind: false },
        tmpl: { order: 2, bind: false, row: true, language: 'html' },
        options: { order: 3, bind: true, row: true, enabledBind: false, value: '$this.$uieditorOptions' },
        query: { order: 4, bind: true, enabledBind: false, row: true, desc: "合并route query参数，如：{id:'111'}" },
        params: { order: 5, bind: true, enabledBind: false, row: true, desc: "传送params参数，可以使用this.params获取" }
      }
    }
  }
});
