import { UEService } from '../base/ue-service';
import { UEVue, UEVueComponent, UEVueInject, UEVueLife, UEVueProp, UEVueWatch, UETransFn, UEVueValue } from '../base/vue-extends';
import { LayuiRender } from '../layui/layui-render';
import { UEHelper } from '../base/ue-helper';
import _ from 'lodash';


@UEVueComponent({})
export default class UieditorMonacoEditor extends UEVue {

  @UEVueProp({
    type: String,
    default: '100%'
  })
  width: string;

  @UEVueProp({
    type: String,
    default: '100%'
  })
  height: string;

  @UEVueProp({
    type: Boolean,
    default: false
  })
  formatAuto: boolean;


  @UEVueProp({ type: String, default: 'javascript' })
  language: string;

  @UEVueProp({ type: String, default: '' })
  extraLib: string;

  get style() {
    let width = this.width;
    width = /^[0-9]+$/.test(width) ? `${width}px` : width;
    let height = this.height;
    height = /^[0-9]+$/.test(height) ? `${height}px` : height;
    return {
      width,
      height
    };
  }

  //option 内容请参考官网：https://microsoft.github.io/monaco-editor/
  @UEVueProp(Object)
  option: any;

  editor: any;

  // @UEVueWatch('option', { deep: true })
  // updateOptions() {
  //   if (!this.option) return;
  //   if (UEHelper.isEqualNotFn(this.option, this._optionBak)) return;
  //   this._optionBak = _.cloneDeep(this.option);

  //   if (!this.editor) {
  //     this._wIFrame();
  //   } else {
  //     this.editor.updateOptions(this.option);
  //   }
  // }

  id = '';

  @UEVueValue()
  content: string = '';
  content_bak: string = '';

  @UEVueWatch('content')
  @UETransFn((fn) => _.debounce(fn, 200))
  _wContent(val) {
    if (val == this.content_bak) return;
    this.content_bak = val;
    if (this.editor) {
      this.editor.getModel().setValue(val);
    }
  }

  private _isFormatInit: boolean;
  async formatCode() {
    if (this.editor) {
      await this.editor.getAction('editor.action.formatDocument').run();
      if (!this._isFormatInit) {
        this._isFormatInit = true;
        for (let i = 0; i < 15; i++) {
          await UEHelper.pause(30);
          await this.formatCode();
        }
      }
    }
  }

  iframe: any;

  @UEVueLife('created')
  private _created1() {
    this.id = `uieditor-monaco-editor_${UEHelper.makeAutoId()}`;
  }

  @UEVueLife('mounted')
  private _mounted1() {
    this.iframe = document.getElementById(this.id);
    this._wIFrame();
  }

  get optionEx() {
    const option = _.assign({
      language: this.language || 'javascript',
      selectOnLineNumbers: true,
      readOnly: false,
      scrollbar: {
        useShadows: false,
        vertical: 'visible',
        horizontal: 'visible',
        horizontalSliderSize: 5,
        verticalSliderSize: 5,
        horizontalScrollbarSize: 15,
        verticalScrollbarSize: 15,
      },
      modelSetting: {
        indentSize: 2,
        insertSpaces: true,
        tabSize: 2,
        trimAutoWhitespace: true
      },
      minimap: {
        enabled: true,
        showSlider: 'always',
        maxColumn: 60
      },
      extraLib: this.extraLib || ''
    }, _.cloneDeep(this.option));

    return option;

  }

  isFocus = false;
  private _isInited = false;
  private _wIFrame() {
    let iframe = this.iframe;
    if (this._isInited || !iframe) return;
    this._isInited = true;
    let _this = this;
    iframe.onBeforeInit = function (monaco, option) {
      iframe.onBeforeInit = null;
      _.assign(option, _this.optionEx);
      option.value = _this.content;
      _this.$emit('on-before-init', { monaco, option });
    };
    iframe.onInited = function (editor) {
      _this.editor = editor;
      iframe.onInited = null;
      _this.$emit('on-inited', { editor });
    };
    iframe.onChanged = function (editor, content, e) {
      _this.content = _this.content_bak = content;
      _this.$emit('on-changed', { editor, content, e });
    };
    iframe.onBlured = function (editor, content) {
      _this.content = _this.content_bak = content;
      _this.isFocus = false;
      _this.$emit('on-blured', { editor, content });
    };
    iframe.onFocused = function (editor, content) {
      _this.isFocus = true;
      _this.$emit('on-focused', { editor, content });
    };
    iframe.onReady = function (editor, content) {
      _this.formatAuto && _this.formatCode();
      _this.$emit('on-ready', { editor, content });
    };
    // iframe.onResized = function (editor) {
    //   _this.$emit('onResized', { editor });
    // 	console.warn('onResized monaco: ', editor);
    // };
    iframe.onDestory = function (monaco, editor) {
      iframe.onDestory = iframe.onChanged = iframe.onReady =
        iframe.onBlured = iframe.onResized = null;
      _this.$emit('on-destory', { monaco, editor });
    };

    let id = this.id;
    iframe['src'] = `./vue-uieditor/assets/editor/editor.html?id=${id}`;
  }

  @UEVueLife('beforeDestroy')
  private _destroy1() {
    this.iframe = this.editor = null;
  }

}
