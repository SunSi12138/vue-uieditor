<template>
  <div style="height: 100%; width: 100%">
    <div class="layui-uieditor">
      <div class="layui-tab layui-tab-card">
        <!-- tool-bar -->
        <div class="tool-bar">
          <div class="layui-btn-group">
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm"
            >
              文字
            </button>
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm divided"
            >
              <i class="layui-icon layui-icon-refresh"></i>
            </button>
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm"
            >
              <i class="layui-icon layui-icon-left"></i>
            </button>
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm"
            >
              <i class="layui-icon layui-icon-right"></i>
            </button>
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm divided"
            >
              <i class="layui-icon layui-icon-align-left"></i>
            </button>
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm"
            >
              <i class="layui-icon layui-icon-ok"></i>
            </button>
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm"
            >
              <i class="layui-icon layui-icon-close"></i>
            </button>
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm divided"
            >
              <i class="layui-icon layui-icon-set-fill"></i>
            </button>
            <button
              type="button"
              class="layui-btn layui-btn-primary layui-btn-sm"
            >
              <i class="layui-icon layui-icon-about"></i>
            </button>
          </div>
        </div>
        <ul class="layui-tab-title">
          <li class="layui-tab-first layui-this">设计</li>
          <li>代码</li>
          <li>模板</li>
          <li>JSON</li>
          <li>预览</li>
        </ul>
        <div class="layui-tab-content">
          <div class="layui-tab-item layui-show">
            <div class="editor-pane">
              <div class="left">
                <div class="left-content">
                  <form
                    id="form-attr-search"
                    class="layui-form uieditor-searchform"
                    action=""
                    lay-filter="first"
                  >
                    <input
                      type="text"
                      placeholder="请输入搜索关键字"
                      autocomplete="off"
                      class="layui-input"
                    />
                    <i class="layui-icon layui-icon-search"></i>
                  </form>
                  <div
                    class="layui-collapse editor-pane-collapse"
                    lay-filter="test"
                  >
                    <!-- 组件 -->
                    <div class="layui-colla-item">
                      <h2 class="layui-colla-title">
                        <span class="editor-pane-collapse-title">组件</span>
                        <i class="layui-icon layui-colla-icon"></i>
                      </h2>
                      <div class="layui-colla-content layui-show">
                        <div id="tree1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="center">
                <div class="center-content">
                  <div class="editor-content">
                    <div class="center-breadcrumb">
                      <span>
                        <a
                          href="/"
                          target="_self"
                          class="center-breadcrumb-item-link"
                        >
                          Home
                        </a>
                        <span class="center-breadcrumb-item-separator"
                          >&gt;</span
                        >
                      </span>
                      <span>
                        <a
                          href="/components/breadcrumb"
                          target="_self"
                          class="center-breadcrumb-item-link"
                        >
                          Components
                        </a>
                        <span class="center-breadcrumb-item-separator"
                          >&gt;</span
                        >
                      </span>
                      <span>
                        <span class="center-breadcrumb-item-link">
                          Breadcrumb
                        </span>
                      </span>
                    </div>
                    <div class="editor-json-content">
                      <div class="uieditor-drag-content uieditor-drag-root">
                        <div class="uieditor-drag-item test-item">item1</div>
                        <div class="uieditor-drag-item test-item-inline">
                          item-inline1
                        </div>
                        <div class="uieditor-drag-item test-item-inline">
                          item-inline2
                        </div>
                        <div class="uieditor-drag-content test-content">
                          content1
                          <div class="uieditor-drag-item test-item-inline">
                            item-inline3
                          </div>
                        </div>
                        <div class="uieditor-drag-content test-content">
                          content2
                          <input class="uieditor-drag-item test-item-inline" />
                          <select>
                            <option value="test">test</option>
                            <option value="test1">test1</option>
                          </select>
                          <input />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="right">
                <div class="right-content">
                  <div
                    class="layui-tab layui-tab-brief editor-pane-tab"
                    lay-filter="docDemoTabBrief"
                  >
                    <ul class="layui-tab-title">
                      <li class="layui-this">属性</li>
                      <li>事件</li>
                    </ul>
                    <div class="layui-tab-content">
                      <!-- 属性 -->
                      <div class="layui-tab-item layui-show">
                        <form
                          id="form-attr-search"
                          class="layui-form uieditor-searchform"
                          action=""
                          lay-filter="first"
                        >
                          <input
                            type="text"
                            placeholder="请输入搜索关键字"
                            autocomplete="off"
                            class="layui-input"
                          />
                          <i class="layui-icon layui-icon-search"></i>
                        </form>
                        <div
                          class="layui-collapse editor-pane-collapse"
                          lay-filter="test"
                        >
                          <!-- Vue -->
                          <div class="layui-colla-item">
                            <h2 class="layui-colla-title">
                              <span class="editor-pane-collapse-title"
                                >Vue</span
                              >
                              <i class="layui-icon layui-colla-icon"></i>
                            </h2>
                            <div class="layui-colla-content layui-show">
                              <form
                                id="form1"
                                class="layui-form layui-form-pane1 uieditor-form"
                                action=""
                                lay-filter="first"
                              >
                                <div class="layui-form-item">
                                  <label class="layui-form-label">v-if</label>
                                  <div
                                    class="layui-input-block attr-bind attr-code"
                                  >
                                    <span class="layui-badge layui-bg-orange"
                                      >v</span
                                    >
                                    <input
                                      type="text"
                                      name="v-if"
                                      lay-verify="required|title"
                                      lay-reqText="标题不能为空"
                                      required
                                      placeholder="请输入标题"
                                      autocomplete="off"
                                      class="layui-input"
                                    />
                                    <i class="layui-icon layui-icon-form"></i>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <label class="layui-form-label">v-show</label>
                                  <div
                                    class="layui-input-block attr-bind attr-code"
                                  >
                                    <span class="layui-badge layui-bg-orange"
                                      >v</span
                                    >
                                    <input
                                      type="text"
                                      name="vModel"
                                      lay-verify="required|title"
                                      lay-reqText="标题不能为空"
                                      required
                                      placeholder="请输入标题"
                                      autocomplete="off"
                                      class="layui-input"
                                    />
                                    <i class="layui-icon layui-icon-form"></i>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <label class="layui-form-label">v-for</label>
                                  <div
                                    class="layui-input-block attr-bind attr-code"
                                  >
                                    <span class="layui-badge layui-bg-orange"
                                      >v</span
                                    >
                                    <input
                                      type="text"
                                      name="vModel"
                                      lay-verify="required|title"
                                      lay-reqText="标题不能为空"
                                      required
                                      placeholder="请输入标题"
                                      autocomplete="off"
                                      class="layui-input"
                                    />
                                    <i class="layui-icon layui-icon-form"></i>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-row layui-col-space4">
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >v-model</label
                                      >
                                      <div class="layui-input-block attr-bind">
                                        <span
                                          class="layui-badge layui-bg-orange"
                                          >v</span
                                        >
                                        <input
                                          type="text"
                                          name="vModel"
                                          lay-verify="required|title"
                                          lay-reqText="标题不能为空"
                                          required
                                          placeholder="请输入标题"
                                          autocomplete="off"
                                          class="layui-input"
                                        />
                                      </div>
                                    </div>
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >ref</label
                                      >
                                      <div class="layui-input-block">
                                        <input
                                          type="text"
                                          name="ref"
                                          autocomplete="off"
                                          class="layui-input"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-row layui-col-space4">
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label">
                                        <i
                                          class="layui-icon layui-icon-about"
                                        ></i>
                                        class
                                      </label>
                                      <div
                                        class="layui-input-block attr-bind attr-code"
                                      >
                                        <span class="layui-badge layui-bg-gray"
                                          >：</span
                                        >
                                        <input
                                          type="text"
                                          name="disabled"
                                          autocomplete="off"
                                          class="layui-input"
                                        />
                                        <i
                                          class="layui-icon layui-icon-form"
                                        ></i>
                                      </div>
                                    </div>
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >style</label
                                      >
                                      <div
                                        class="layui-input-block attr-bind attr-code"
                                      >
                                        <span class="layui-badge layui-bg-gray"
                                          >：</span
                                        >
                                        <input
                                          type="text"
                                          name="name"
                                          autocomplete="off"
                                          class="layui-input"
                                        />
                                        <i
                                          class="layui-icon layui-icon-form"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                          <!-- 组件属性 -->
                          <div class="layui-colla-item">
                            <h2 class="layui-colla-title">
                              <span class="editor-pane-collapse-title"
                                >组件属性</span
                              >
                              <i class="layui-icon layui-colla-icon"></i>
                            </h2>
                            <div class="layui-colla-content layui-show">
                              <form
                                id="form1"
                                class="layui-form layui-form-pane1 uieditor-form"
                                action=""
                                lay-filter="first"
                              >
                                <div class="layui-form-item">
                                  <div class="layui-row layui-col-space4">
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label">
                                        <i
                                          class="layui-icon layui-icon-about"
                                        ></i>
                                        disabled
                                      </label>
                                      <div
                                        class="layui-input-block attr-bind attr-code"
                                      >
                                        <span class="layui-badge layui-bg-blue"
                                          >：</span
                                        >
                                        <input
                                          type="text"
                                          name="disabled"
                                          autocomplete="off"
                                          class="layui-input"
                                        />
                                        <i
                                          class="layui-icon layui-icon-form"
                                        ></i>
                                      </div>
                                    </div>
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >name</label
                                      >
                                      <div
                                        class="layui-input-block attr-bind attr-code"
                                      >
                                        <span class="layui-badge layui-bg-gray"
                                          >：</span
                                        >
                                        <input
                                          type="text"
                                          name="name"
                                          autocomplete="off"
                                          class="layui-input"
                                        />
                                        <i
                                          class="layui-icon layui-icon-form"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-row layui-col-space4">
                                    <div class="layui-col-xs12">
                                      <label class="layui-form-label"
                                        >密码</label
                                      >
                                      <div
                                        class="layui-input-block attr-bind attr-code"
                                      >
                                        <span class="layui-badge layui-bg-blue"
                                          >@</span
                                        >
                                        <input
                                          type="password"
                                          name="password"
                                          lay-verify="required|pass"
                                          placeholder="请输入密码"
                                          autocomplete="off"
                                          class="layui-input"
                                        />
                                        <i
                                          class="layui-icon layui-icon-form"
                                        ></i>
                                      </div>
                                      <div
                                        class="layui-form-mid layui-word-aux"
                                      >
                                        请务必填写用户名
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-row layui-col-space4">
                                    <div class="layui-col-xs12">
                                      <label class="layui-form-label"
                                        >selectInput</label
                                      >
                                      <div
                                        class="layui-input-block attr-bind attr-code"
                                      >
                                        <span class="layui-badge layui-bg-blue"
                                          >：</span
                                        >
                                        <div id="selectInput1"></div>
                                        <i
                                          class="layui-icon layui-icon-form"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="layui-form-item uieditor-add-item">
                                  <label class="layui-form-label"
                                    >添加属性</label
                                  >
                                  <div class="layui-input-block">
                                    <input
                                      type="text"
                                      name="addEvent"
                                      lay-verify="required|title"
                                      lay-reqText="标题不能为空"
                                      required
                                      placeholder="属性名称"
                                      autocomplete="off"
                                      class="layui-input"
                                    />
                                    <div class="layui-btn-group">
                                      <button
                                        type="button"
                                        class="layui-btn layui-btn-sm layui-btn-normal"
                                      >
                                        <i class="layui-icon">&#xe654;</i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-row layui-col-space4">
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >行内表单</label
                                      >
                                      <div class="layui-input-block attr-bind">
                                        <span class="layui-badge layui-bg-blue"
                                          >：</span
                                        >
                                        <select
                                          name="quiz"
                                          lay-verify="required"
                                          lay-verType="tips"
                                        >
                                          <option value="">请选择问题</option>
                                          <option value="0">
                                            你工作的第一个城市
                                          </option>
                                          <option value="1" disabled>
                                            你的工号
                                          </option>
                                          <option value="2">
                                            你最喜欢的老师
                                          </option>
                                        </select>
                                      </div>
                                    </div>
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >select分组</label
                                      >
                                      <div class="layui-input-block">
                                        <select name="quiz" lay-filter="quiz">
                                          <option value="">请选择问题</option>
                                          <optgroup label="城市记忆">
                                            <option value="0">
                                              你工作的第一个城市
                                            </option>
                                          </optgroup>
                                          <optgroup label="学生时代">
                                            <option value="1" disabled>
                                              你的工号
                                            </option>
                                            <option value="2">
                                              你最喜欢的老师
                                            </option>
                                          </optgroup>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-row layui-col-space4">
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >选择框</label
                                      >
                                      <div class="layui-input-block">
                                        <select
                                          name="interest"
                                          lay-filter="interest"
                                        >
                                          <option value=""></option>
                                          <option value="0">写作</option>
                                          <option value="1">阅读</option>
                                          <option value="2">游戏</option>
                                          <option value="3">音乐</option>
                                          <option value="4">旅行</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >搜索选择框</label
                                      >
                                      <div class="layui-input-block">
                                        <select
                                          name="interest-search"
                                          lay-filter="interest-search"
                                          lay-search
                                        >
                                          <option value="">请搜索</option>
                                          <option value="写作">写作</option>
                                          <option value="阅读" disabled>
                                            阅读
                                          </option>
                                          <option value="游戏" disabled>
                                            游戏
                                          </option>
                                          <option value="音乐">音乐</option>
                                          <option value="旅行">旅行</option>
                                          <option value="读书">读书</option>
                                          <option value="1">layer</option>
                                          <option value="2" disabled>
                                            laydate
                                          </option>
                                          <option value="3">3</option>
                                          <option value="4">layim</option>
                                          <option value="5">laypage</option>
                                          <option value="6">6</option>
                                          <option value="7">7</option>
                                          <option value="8">8</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-row layui-col-space4">
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >选择框</label
                                      >
                                      <div class="layui-input-block">
                                        <select
                                          name="interest"
                                          lay-filter="interest"
                                        >
                                          <option value=""></option>
                                          <option value="0">写作</option>
                                          <option value="1">阅读</option>
                                          <option value="2">游戏</option>
                                          <option value="3">音乐</option>
                                          <option value="4">旅行</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div class="layui-col-xs6">
                                      <label class="layui-form-label"
                                        >搜索选择框</label
                                      >
                                      <div class="layui-input-block">
                                        <select
                                          name="interest-search"
                                          lay-filter="interest-search"
                                          lay-search
                                        >
                                          <option value="">请搜索</option>
                                          <option value="写作">写作</option>
                                          <option value="阅读" disabled>
                                            阅读
                                          </option>
                                          <option value="游戏" disabled>
                                            游戏
                                          </option>
                                          <option value="音乐">音乐</option>
                                          <option value="旅行">旅行</option>
                                          <option value="读书">读书</option>
                                          <option value="1">layer</option>
                                          <option value="2" disabled>
                                            laydate
                                          </option>
                                          <option value="3">3</option>
                                          <option value="4">layim</option>
                                          <option value="5">laypage</option>
                                          <option value="6">6</option>
                                          <option value="7">7</option>
                                          <option value="8">8</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div class="layui-form-item" pane>
                                  <label class="layui-form-label">复选框</label>
                                  <div class="layui-input-block">
                                    <input
                                      type="checkbox"
                                      name="like[write]"
                                      title="写作"
                                    />
                                    <input
                                      type="checkbox"
                                      name="like[read]"
                                      title="阅读"
                                    />
                                    <input
                                      type="checkbox"
                                      name="like[game]"
                                      title="游戏"
                                      disabled
                                    />
                                  </div>
                                </div>
                                <div class="layui-form-item" pane>
                                  <label class="layui-form-label"
                                    >原始复选框</label
                                  >
                                  <div class="layui-input-block">
                                    <input
                                      type="checkbox"
                                      name="like1[write]"
                                      lay-skin="primary"
                                      title="写作"
                                    />
                                    <input
                                      type="checkbox"
                                      name="like1[read]"
                                      lay-skin="primary"
                                      title="阅读"
                                    />
                                    <input
                                      type="checkbox"
                                      name="like1[game]"
                                      lay-skin="primary"
                                      title="游戏"
                                      disabled
                                    />
                                  </div>
                                </div>
                                <div class="layui-form-item" pane>
                                  <label class="layui-form-label">开关关</label>
                                  <div class="layui-input-block">
                                    <input
                                      type="checkbox"
                                      name="close"
                                      lay-skin="switch"
                                      title="开关"
                                    />
                                  </div>
                                </div>
                                <div class="layui-form-item" pane>
                                  <label class="layui-form-label">开关开</label>
                                  <div class="layui-input-block">
                                    <input
                                      type="checkbox"
                                      checked
                                      name="open"
                                      lay-skin="switch"
                                      lay-filter="switchTest"
                                      lay-text="ON|OFF"
                                    />
                                    <input
                                      type="checkbox"
                                      name="open2"
                                      lay-skin="switch"
                                      lay-filter="switchTest"
                                      lay-text="已绑定|绑定"
                                    />
                                  </div>
                                </div>
                                <div class="layui-form-item" pane>
                                  <label class="layui-form-label">单选框</label>
                                  <div class="layui-input-block">
                                    <input
                                      type="radio"
                                      name="sex"
                                      value="男"
                                      title="男"
                                    />
                                    <input
                                      type="radio"
                                      name="sex"
                                      value="女"
                                      title="女"
                                      checked
                                    />
                                    <input
                                      type="radio"
                                      name="sex"
                                      value="中型"
                                      title="中"
                                      disabled
                                    />
                                  </div>
                                </div>
                                <div class="layui-form-item" pane>
                                  <label class="layui-form-label">单选框</label>
                                  <div class="layui-input-block">
                                    <input
                                      type="radio"
                                      name="sex.id"
                                      value="男"
                                      title="男"
                                    />
                                    <input
                                      type="radio"
                                      name="sex.id"
                                      value="女"
                                      title="女"
                                      checked
                                    />
                                    <input
                                      type="radio"
                                      name="sex.id"
                                      value="中型"
                                      title="中"
                                    />
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-input-block">
                                    <div colorpicker>
                                      <input
                                        type="text"
                                        value=""
                                        placeholder="请选择颜色"
                                        class="layui-input"
                                      />
                                      <div></div>
                                    </div>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-input-block">
                                    <div slider></div>
                                  </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                  <label class="layui-form-label"
                                    >请填写描述</label
                                  >
                                  <div class="layui-input-block">
                                    <textarea
                                      placeholder="请输入内容"
                                      class="layui-textarea"
                                      name="desc"
                                    ></textarea>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <div class="layui-input-block">
                                    <button
                                      class="layui-btn"
                                      lay-submit
                                      lay-filter="*"
                                    >
                                      立即提交
                                    </button>
                                    <button
                                      type="reset"
                                      class="layui-btn layui-btn-primary"
                                    >
                                      重置
                                    </button>
                                    <button class="layui-btn" id="next">
                                      切换
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- 事件 -->
                      <div class="layui-tab-item">
                        <div
                          class="layui-collapse editor-pane-collapse"
                          lay-filter="test"
                        >
                          <div class="layui-colla-item">
                            <h2 class="layui-colla-title">
                              <span class="editor-pane-collapse-title"
                                >事件</span
                              >
                              <i class="layui-icon layui-colla-icon"></i>
                            </h2>
                            <!-- 事件内容 -->
                            <div class="layui-colla-content layui-show">
                              <form
                                id="form1"
                                class="layui-form layui-form-pane1 uieditor-form"
                                action=""
                                lay-filter="first"
                              >
                                <div class="layui-form-item">
                                  <label class="layui-form-label"
                                    >on-click</label
                                  >
                                  <div
                                    class="layui-input-block attr-bind attr-code"
                                  >
                                    <span class="layui-badge layui-bg-orange"
                                      >@</span
                                    >
                                    <input
                                      type="text"
                                      name="vModel"
                                      lay-verify="required|title"
                                      lay-reqText="标题不能为空"
                                      required
                                      placeholder="请输入标题"
                                      autocomplete="off"
                                      class="layui-input"
                                    />
                                    <i class="layui-icon layui-icon-form"></i>
                                  </div>
                                </div>
                                <div class="layui-form-item">
                                  <label class="layui-form-label"
                                    >on-select</label
                                  >
                                  <div
                                    class="layui-input-block attr-bind attr-code"
                                  >
                                    <span class="layui-badge layui-bg-orange"
                                      >@</span
                                    >
                                    <input
                                      type="text"
                                      name="vModel"
                                      lay-verify="required|title"
                                      lay-reqText="标题不能为空"
                                      required
                                      placeholder="请输入标题"
                                      autocomplete="off"
                                      class="layui-input"
                                    />
                                    <i class="layui-icon layui-icon-form"></i>
                                  </div>
                                </div>
                                <div class="layui-form-item uieditor-add-item">
                                  <label class="layui-form-label"
                                    >添加事件</label
                                  >
                                  <div class="layui-input-block">
                                    <input
                                      type="text"
                                      name="addEvent"
                                      lay-verify="required|title"
                                      lay-reqText="标题不能为空"
                                      required
                                      placeholder="事件名称"
                                      autocomplete="off"
                                      class="layui-input"
                                    />
                                    <div class="layui-btn-group">
                                      <button
                                        type="button"
                                        class="layui-btn layui-btn-sm layui-btn-normal"
                                      >
                                        <i class="layui-icon">&#xe654;</i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="layui-tab-item">代码</div>
          <div class="layui-tab-item">模板</div>
          <div class="layui-tab-item">JSON</div>
          <div class="layui-tab-item">预览</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./vue-uieditor.component.ts"></script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.test-content {
  height: 100px;
}

.test-item {
  height: 30px;
}

.test-item-inline {
  height: 30px;
  display: inline-block;
}
</style>
