import { UEOption } from './base/ue-base';
import { UECompiler } from './base/ue-compiler';
import { UEService } from './base/ue-service';
import { UEVue, UEVueComponent, UEVueLife, UEVueProp, UEVueProvide, UEVueWatch } from './base/vue-extends';
import { Layuidestroy, LayuiInit, DragStart } from './layui-test';
import './transfer';
import { UERender } from './base/ue-render';
import uieditorCpTree from './components/uieditor-cp-tree.component.vue';


@UEVueComponent({
  components: {
    'uieditor-cp-tree': uieditorCpTree
  }
})
export default class VueUieditor extends UEVue {

  @UEVueProp()
  private options!: UEOption;

  get optionEx() {
    const options = this.options;
    return UERender.GlobalTransferToOptions(options);
  }

  @UEVueProp()
  private json!: UEOption;

  @UEVueWatch('optionEx')
  private _wOptions(options) {
    if (this.service) {
      const json = this.service.getJson();
      (this.service as any).options = options;
      this.service.setJson(json);
    }
  }

  @UEVueWatch('json')
  private _wJson(json) {
    console.warn('json', json)
    if (this.service) {
      this.service.setJson(json);
    }
  }

  private _service: UEService;
  get service(): UEService {
    if (!this.$isBeingDestroyed && !this._service) {
      console.log('this.optionEx', this.optionEx);
      this._service = new UEService(this, this.optionEx);
    }
    return this._service;
  }
  @UEVueProvide('service')
  private _pService() {
    return this.service;
  }
  @UEVueProvide('uieditor')
  private _pUiEditor() {
    return this;
  }

  current = null;
  get isInited() {
    return !!this.current?.json;
  }

  @UEVueLife('mounted')
  private async _mounted1() {
    const options = this.optionEx || {};
    await UECompiler.init({ bable: options.babel !== false });
    const service = this.service;
    this.current = service.current;
    await service.setJson(this.json);
    await this.$nextTick();
    LayuiInit(this.$el);
    DragStart(this.$el, {
      dragstart(e) {
        return true;
      },
      dragover(e) {
        return true;
      },
      drop: (e) => {
        const { $, isTreeNode, fromEl, toEl, pos } = e;
        if (isTreeNode) {
          const cpId = $(fromEl).data('id');
          const renderId = toEl.id;
          this.service.addComponent(cpId, renderId, pos.type2);
        }
        return true;
      },
      control: (ev) => {

        // const fromEl = ev.fromEl;
        // const renderId = _getIdByContent(fromEl);
        // let render = this.getRenderItem(renderId);
        // let editor = _getRenderEditor(render);
        // if (!editor) return;
        // const operation = editor.operation;
        // const pRender = this.getParentRenderItem(render);
        // const parentId = _getRenderId(pRender);
        // // let pContainerBox = false;
        // const pEditor = _getRenderEditor(pRender);
        // if (!pEditor) return;
        // const pOperation = pEditor.operation;
        // if (editor.containerBox) editor = pEditor;
        // let containerBox = editor.containerBox;
        // // if (containerBox) pContainerBox = true;
        // const title = containerBox ? '' : editor.textFormat(editor, _getRenderAttrs(render));
        // let collapse = false;
        // let collapseFn;
        // let attrs = _getRenderAttrs(render);
        // if (!editor.base || editor.collapse) {
        //   collapse = _getCollapse(attrs) == 'true';
        //   collapseFn = (e) => {
        //     this.collapse(renderId)
        //     // BgLogger.debug('collapse', e);
        //   };
        // }

        // BgLogger.debug('fromEl', fromEl)
        const control = {
          title: {
            // text: title,
            // show: !containerBox,
            // isCollapse: collapse,
            // collapse: collapseFn
            text: 'aaa',
            show: true,
            isCollapse: true,
            collapse(e) {
              // this.collapse(renderId)
              // BgLogger.debug('collapse', e);
            }
          },
          toolbars: [{
            text: '删除',
            icon: 'layui-icon layui-icon-close',
            show: true,
            click: (item, e) => {
              console.warn('删除', item, e);
              // this.deleteWidget(parentId, renderId);
            }
          }, {
            text: '复制',
            icon: 'layui-icon layui-icon-file-b',
            show: true,
            click: (item, e) => {
              console.warn('复制', item, e);
              // this.copyCurToNext(parentId, renderId, true);
            }
          }]
        };
        return control;
      }
    });

  }

  @UEVueLife('destroyed')
  private _destroyed1() {
    this._service?._destroy();
    this._service = null;
    Layuidestroy(this.$el);
  }

}
