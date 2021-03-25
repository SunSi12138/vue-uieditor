import { UERenderItem } from './ue-render-item';
import { UETransferExtend, UETransfer } from './ue-base';
import _ from 'lodash';


export class UERender {

  /**
   * 将元数据转为vue 元数据
   * @param renders 
   * @param extend 
   */
  static JsonToVueRender(renders: UERenderItem[], extend: UETransferExtend, parentRender?: UERenderItem): UERenderItem[] {

    const transfer: UETransfer = extend.option.transfer;

    let rList = [];
    let option = extend.option;
    _.forEach(renders, function (render) {
      (extend as any).render = null;

      if (render.type == 'preview-opt') {
        return;
      }

      let isStr = _.isString(render);
      let parent: any = function () { return parentRender; };
      isStr || (render.parent = parent);

      (extend as any).render = render;
      extend.editor = render['editor'];
      if (extend.editing) {
        if (extend.editor && extend.editor.show === false) return;
        //编辑时，让非必要绑定失效
        if (isStr && !/\$_item_/.test(render as any)) {
          render = (render as any).replace(/\{\{|\}\}/g, function (find) {
            return find == '{{' ? `{{unescape("${escape('{{')}")}}` : `{{unescape("${escape('}}')}")}}`;
          });
        }
        if (!extend.editor) {
          //编辑时，让没有配置属性绑定失效
          _.forEach(render?.props, function (value, key) {
            const subS = /\$_item_/.test(value) ? -1 : (/^[:@]/.test(key) ? 1 : (/^v-/.test(key) ? 2 : -1));
            if (subS > 0) {
              render.props[key.substr(subS)] = value;
              delete render.props[key];
            }
          });
        }
      }

      if (render.type == 'script') {
        render.type = 'ue-vue-def';
        render.props = { ':content': render.children[0] };
        render.children = [];
      } else if (render.type == 'style') {
        render.type = 'ue-style';
      }

      const resetRender = function () {
        isStr = _.isString(render);
        if (isStr)
          render.parent = parent;
        else if (!render || render.isRender === false)
          return false;
        (extend as any).render = render;
      };

      render = option.transferBefore(render, extend);
      if (resetRender() === false) return;

      // let type = render.type;
      let trans = transfer[render.type];
      if (trans) {
        if (trans.props)
          render.props = _.assign({}, trans.props, render.props);
        if (trans.type) render.type = trans.type;
        if (trans.transfer) {
          render = trans.transfer(render, extend);
          if (resetRender() === false) return;
        }
      }

      render = option.transferAfter(render, extend);
      if (resetRender() === false) return;

      if (_.size(render.children) > 0) {
        let children = render.children;
        render.children = [];
        children = UERender.JsonToVueRender(children as any[], extend, render);
        render.children = render.children.concat(children);
      }

    });
    (extend as any).render = null;
    return rList;
  }

  static getVueBindName(name: string): string {
    return name ? name.replace(_bindAttr, '') : '';
  };

  static getVueBindNameEx(name: string) {
    let isBind = _bindAttrEx.test(name);
    if (isBind) name = RegExp.$1;
    let isEvent = _eventAttrEx.test(name);
    if (isEvent) name = RegExp.$1;
    return {
      isBind, isEvent,
      name: name
    };
  };

  static makeExportDefault(content: string) {
    return 'export default ' + content;
  }

  static removeExportDefault(content: string) {
    return content && content.replace(/^[\s\r\n]*export default\s*/, '');
  }

}

const _bindAttr = /^\s*[\:\@]/;
const _bindAttrEx = /^\s*\:(.*)/;
const _eventAttrEx = /^\s*\@(.*)/;
