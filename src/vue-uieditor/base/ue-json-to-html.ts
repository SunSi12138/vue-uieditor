import _ from 'lodash';
import { UEClearPrivateProps } from './ue-base';

export interface UEJsonToHtmlConfig {
  raw?: boolean; // 显示转义字符
  wrap?: boolean; // 是否换行显示
  indent?: number; // 缩进，最大支持到8
  clearPrivate?: boolean; //删除ue 特殊私有属性
  tagKey?: string; // 获取 tag 的字段
  childrenKey?: string; // 获取 children 的字段
}

const defaultConfig: UEJsonToHtmlConfig = {
  raw: false,
  wrap: true,
  indent: 2
};

const allowedTags: Array<string> = [
  // todo
];

/**
* object --> value="value" name="name"
*
* @param attrsObject
* @param extraAttrsObject
*/
function resolveAttrs(attrsObject: any) {
  if (_.size(attrsObject) == 0) return '';

  let attrStrings = _.map(_.keys(attrsObject), function (attrKey) {
    let attrValue = attrsObject[attrKey];

    // deal: <com disabled></com>
    if (attrValue === true) {
      return attrKey;
    }

    // deal: '', undefined, null, NaN, false，则不显示该attr
    if (!attrValue && attrValue !== 0) {
      return '';
    }

    // deal: <tag on-click="onClick("xx")"></tag>
    if (typeof attrValue === 'string' && ~attrValue.indexOf('"')) {
      attrValue = UEJsonToHtml.escape(attrValue);
    }

    return `${attrKey}="${attrValue}"`;
  }).filter(i => !!i);

  return ' ' + attrStrings.join(' ');
}

function UEJsonToHtml(schema: any | Array<any> | string | number, config?: UEJsonToHtmlConfig, depth: number = 0): string {

  if (Array.isArray(schema)) {
    return schema.map(childSchema => UEJsonToHtml(childSchema, config, depth)).join('');
  }

  let {
    raw,
    wrap,
    indent,
    clearPrivate,
    tagKey,
    childrenKey
  } = _.assign({}, defaultConfig, config);

  let indentToken = wrap ? ' '.repeat(depth * Math.min(indent as number, 8)) : '';
  let wrapToken = wrap ? '\n' : ''

  if (!schema && schema !== 0) {
    return '';
  }

  if (typeof schema === 'string' || typeof schema === 'number') {
    return indentToken + schema + wrapToken;
  }

  let {
    type: tag,
    children: children,
    props: rest
  } = schema;
  // let tag = schema[];

  if (clearPrivate) {
    UEClearPrivateProps(rest);
  }
  // if (htmlOnly && !~allowedTags.indexOf(tag)) {
  //     console.error('当前标签不符合标准html');
  //     return '';
  // }
  // let leftTag = `${indentToken}<${tag}${attrs} data-depth="${depth}">`;
  const hasChild = _.size(children) > 0;
  let leftTag = `${indentToken}<${tag}${resolveAttrs(rest)}${hasChild ? '' : ' /'}>`;
  let rightTag = hasChild ? `</${tag}>${wrapToken}` : '';

  let content: string | number = '';
  if (
    (typeof children === 'string' && !/<.+>.+<\/[a-z0-9]+>/.test(content))
    || typeof children === 'number'
  ) {
    content = children;
  } else {
    if (/<.+>.+<\/[a-z0-9]+>/.test(content)) { // 如果是标签，则需要加缩进和换行
      content = indentToken + indentToken + children + wrapToken;
    } else if (typeof children === 'object') {
      content = UEJsonToHtml(children, config, depth + 1);
    } else if (Array.isArray(children)) {
      content = children.map(child => UEJsonToHtml(child, config, depth + 1)).join('');
    }

    leftTag = leftTag + wrapToken;
    rightTag = indentToken + rightTag;
  }

  let result = leftTag + content + rightTag;

  if (raw) {
    result = result.replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  return result;
}

const _dot2 = '&quot;';
const _dot2Reg = new RegExp(_.escapeRegExp(_dot2), 'g');
const _dot21 = '&amp;';
const _dot21Reg = new RegExp(_.escapeRegExp(_dot21), 'g');
function _escapeS(str: string) {
  return (_.isString(str) && str.replace(/\&/g, _dot21).replace(/\"/g, _dot2)) || str;
}
function _unEscapeS(str: string) {
  return (_.isString(str) && str.replace(_dot2Reg, '"').replace(_dot21Reg, '&')) || str;
}

UEJsonToHtml.escape = _escapeS;
UEJsonToHtml.unEscape = _unEscapeS;


export { UEJsonToHtml };