
const _vueDef = `

type Constructor = {
  new (...args: any[]): any;
}

// we don't support infer props in async component
// N.B. ComponentOptions<V> is contravariant, the default generic should be bottom type
type Component<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> =
  | typeof Vue
  | FunctionalComponentOptions<Props>
  | ComponentOptions<never, Data, Methods, Computed, Props>

interface EsModuleComponent {
  default: Component
}

type AsyncComponent<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps>
  = AsyncComponentPromise<Data, Methods, Computed, Props>
  | AsyncComponentFactory<Data, Methods, Computed, Props>

type AsyncComponentPromise<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> = (
  resolve: (component: Component<Data, Methods, Computed, Props>) => void,
  reject: (reason?: any) => void
) => Promise<Component | EsModuleComponent> | void;

type AsyncComponentFactory<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> = () => {
  component: AsyncComponentPromise<Data, Methods, Computed, Props>;
  loading?: Component | EsModuleComponent;
  error?: Component | EsModuleComponent;
  delay?: number;
  timeout?: number;
}

/**
 * When the Computed type parameter on ComponentOptions is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of Accessors<Computed> and work backwards.
 */
type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}

type DataDef<Data, Props, V> = Data | ((this: Readonly<Props> & V) => Data)
/**
 * This type should be used when an array of strings is used for a component's props value.
 */
type ThisTypedComponentOptionsWithArrayProps<V extends Vue, Data, Methods, Computed, PropNames extends string> =
  object &
  ComponentOptions<V, DataDef<Data, Record<PropNames, any>, V>, Methods, Computed, PropNames[], Record<PropNames, any>> &
  ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Record<PropNames, any>>>>;

/**
 * This type should be used when an object mapped to PropOptions is used for a component's props value.
 */
type ThisTypedComponentOptionsWithRecordProps<V extends Vue, Data, Methods, Computed, Props> =
  object &
  ComponentOptions<V, DataDef<Data, Props, V>, Methods, Computed, RecordPropsDefinition<Props>, Props> &
  ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Props>>>;

type DefaultData<V> =  object | ((this: V) => object);
type DefaultProps = Record<string, any>;
type DefaultMethods<V> =  { [key: string]: (this: V, ...args: any[]) => any };
type DefaultComputed = { [key: string]: any };
interface ComponentOptions<
  V extends Vue,
  Data=DefaultData<V>,
  Methods=DefaultMethods<V>,
  Computed=DefaultComputed,
  PropsDef=PropsDefinition<DefaultProps>,
  Props=DefaultProps> {
  data?: Data;
  props?: PropsDef;
  propsData?: object;
  computed?: Accessors<Computed>;
  methods?: Methods;
  watch?: Record<string, WatchOptionsWithHandler<any> | WatchHandler<any> | string>;

  el?: Element | string;
  template?: string;
  // hack is for functional component type inference, should not be used in user code
  render?(createElement: CreateElement, hack: RenderContext<Props>): VNode;
  renderError?(createElement: CreateElement, err: Error): VNode;
  staticRenderFns?: ((createElement: CreateElement) => VNode)[];

  beforeCreate?(this: V): void;
  created?(): void;
  beforeDestroy?(): void;
  destroyed?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;
  activated?(): void;
  deactivated?(): void;
  errorCaptured?(err: Error, vm: Vue, info: string): boolean | void;
  serverPrefetch?(this: V): Promise<void>;

  directives?: { [key: string]: DirectiveFunction | DirectiveOptions };
  components?: { [key: string]: Component<any, any, any, any> | AsyncComponent<any, any, any, any> };
  transitions?: { [key: string]: object };
  filters?: { [key: string]: Function };

  provide?: object | (() => object);
  inject?: InjectOptions;

  model?: {
    prop?: string;
    event?: string;
  };

  parent?: Vue;
  mixins?: (ComponentOptions<Vue> | typeof Vue)[];
  name?: string;
  extends?: ComponentOptions<Vue> | typeof Vue;
  delimiters?: [string, string];
  comments?: boolean;
  inheritAttrs?: boolean;
}

interface FunctionalComponentOptions<Props = DefaultProps, PropDefs = PropsDefinition<Props>> {
  name?: string;
  props?: PropDefs;
  model?: {
    prop?: string;
    event?: string;
  };
  inject?: InjectOptions;
  functional: boolean;
  render?(this: undefined, createElement: CreateElement, context: RenderContext<Props>): VNode | VNode[];
}

interface RenderContext<Props=DefaultProps> {
  props: Props;
  children: VNode[];
  slots(): any;
  data: VNodeData;
  parent: Vue;
  listeners: { [key: string]: Function | Function[] };
  scopedSlots: { [key: string]: NormalizedScopedSlot };
  injections: any
}

type Prop<T> = { (): T } | { new(...args: any[]): T & object } | { new(...args: string[]): Function }

type PropType<T> = Prop<T> | Prop<T>[];

type PropValidator<T> = PropOptions<T> | PropType<T>;

interface PropOptions<T=any> {
  type?: PropType<T>;
  required?: boolean;
  default?: T | null | undefined | (() => T | null | undefined);
  validator?(value: T): boolean;
}

type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>
}
type ArrayPropsDefinition<T> = (keyof T)[];
type PropsDefinition<T> = ArrayPropsDefinition<T> | RecordPropsDefinition<T>;

interface ComputedOptions<T> {
  get?(): T;
  set?(value: T): void;
  cache?: boolean;
}

type WatchHandler<T> = (val: T, oldVal: T) => void;

interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

interface WatchOptionsWithHandler<T> extends WatchOptions {
  handler: WatchHandler<T>;
}

interface DirectiveBinding extends Readonly<VNodeDirective> {
  readonly modifiers: { [key: string]: boolean };
}

type DirectiveFunction = (
  el: HTMLElement,
  binding: DirectiveBinding,
  vnode: VNode,
  oldVnode: VNode
) => void;

interface DirectiveOptions {
  bind?: DirectiveFunction;
  inserted?: DirectiveFunction;
  update?: DirectiveFunction;
  componentUpdated?: DirectiveFunction;
  unbind?: DirectiveFunction;
}

type InjectKey = string | symbol;

type InjectOptions = {
  [key: string]: InjectKey | { from?: InjectKey, default?: any }
} | string[];

type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;

interface PluginObject<T> {
  install: PluginFunction<T>;
  [key: string]: any;
}

type ScopedSlot = (props: any) => ScopedSlotReturnValue;
type ScopedSlotReturnValue = VNode | string | boolean | null | undefined | ScopedSlotReturnArray;
interface ScopedSlotReturnArray extends Array<ScopedSlotReturnValue> {}

// Scoped slots are guaranteed to return Array of VNodes starting in 2.6
type NormalizedScopedSlot = (props: any) => ScopedSlotChildren;
type ScopedSlotChildren = VNode[] | undefined;

// Relaxed type compatible with $createElement
type VNodeChildren = VNodeChildrenArrayContents | [ScopedSlot] | string | boolean | null | undefined;
interface VNodeChildrenArrayContents extends Array<VNodeChildren | VNode> {}

interface VNode {
  tag?: string;
  data?: VNodeData;
  children?: VNode[];
  text?: string;
  elm?: Node;
  ns?: string;
  context?: Vue;
  key?: string | number;
  componentOptions?: VNodeComponentOptions;
  componentInstance?: Vue;
  parent?: VNode;
  raw?: boolean;
  isStatic?: boolean;
  isRootInsert: boolean;
  isComment: boolean;
}

interface VNodeComponentOptions {
  Ctor: typeof Vue;
  propsData?: object;
  listeners?: object;
  children?: VNode[];
  tag?: string;
}

interface VNodeData {
  key?: string | number;
  slot?: string;
  scopedSlots?: { [key: string]: ScopedSlot | undefined };
  ref?: string;
  refInFor?: boolean;
  tag?: string;
  staticClass?: string;
  class?: any;
  staticStyle?: { [key: string]: any };
  style?: string | object[] | object;
  props?: { [key: string]: any };
  attrs?: { [key: string]: any };
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  on?: { [key: string]: Function | Function[] };
  nativeOn?: { [key: string]: Function | Function[] };
  transition?: object;
  show?: boolean;
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Function[];
  };
  directives?: VNodeDirective[];
  keepAlive?: boolean;
}

interface VNodeDirective {
  name: string;
  value?: any;
  oldValue?: any;
  expression?: any;
  arg?: string;
  oldArg?: string;
  modifiers?: { [key: string]: boolean };
}

interface CreateElement {
  (tag?: string | Component<any, any, any, any> | AsyncComponent<any, any, any, any> | (() => Component), children?: VNodeChildren): VNode;
  (tag?: string | Component<any, any, any, any> | AsyncComponent<any, any, any, any> | (() => Component), data?: VNodeData, children?: VNodeChildren): VNode;
}

class Vue {
  readonly $el: Element;
  readonly $options: ComponentOptions<Vue>;
  readonly $parent: Vue;
  readonly $root: Vue;
  readonly $children: Vue[];
  readonly $refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  readonly $slots: { [key: string]: VNode[] | undefined };
  readonly $scopedSlots: { [key: string]: NormalizedScopedSlot | undefined };
  readonly $isServer: boolean;
  readonly $data: Record<string, any>;
  readonly $props: Record<string, any>;
  readonly $ssrContext: any;
  readonly $vnode: VNode;
  readonly $attrs: Record<string, string>;
  readonly $listeners: Record<string, Function | Function[]>;

  $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
  $forceUpdate(): void;
  $destroy(): void;
  $set: typeof Vue.set;
  $delete: typeof Vue.delete;
  $watch(
    expOrFn: string,
    callback: (this: this, n: any, o: any) => void,
    options?: WatchOptions
  ): (() => void);
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: (this: this, n: T, o: T) => void,
    options?: WatchOptions
  ): (() => void);
  $on(event: string | string[], callback: Function): this;
  $once(event: string | string[], callback: Function): this;
  $off(event?: string | string[], callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
  $nextTick(callback: (this: this) => void): void;
  $nextTick(): Promise<void>;
  $createElement: CreateElement;
  
}

type CombinedVueInstance<Instance extends Vue, Data, Methods, Computed, Props> =  Data & Methods & Computed & Props & Instance;
type ExtendedVue<Instance extends Vue, Data, Methods, Computed, Props> = VueConstructor<CombinedVueInstance<Instance, Data, Methods, Computed, Props> & Vue>;

interface VueConfiguration {
  silent: boolean;
  optionMergeStrategies: any;
  devtools: boolean;
  productionTip: boolean;
  performance: boolean;
  errorHandler(err: Error, vm: Vue, info: string): void;
  warnHandler(msg: string, vm: Vue, trace: string): void;
  ignoredElements: (string | RegExp)[];
  keyCodes: { [key: string]: number | number[] };
  async: boolean;
}

interface VueConstructor<V extends Vue = Vue> {
  new <Data = object, Methods = object, Computed = object, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): CombinedVueInstance<V, Data, Methods, Computed, Record<PropNames, any>>;
  // ideally, the return type should just contain Props, not Record<keyof Props, any>. But TS requires to have Base constructors with the same return type.
  new <Data = object, Methods = object, Computed = object, Props = object>(options?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): CombinedVueInstance<V, Data, Methods, Computed, Record<keyof Props, any>>;
  new (options?: ComponentOptions<V>): CombinedVueInstance<V, object, object, object, Record<keyof object, any>>;

  extend<Data, Methods, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;
  extend<Data, Methods, Computed, Props>(options?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;
  extend<PropNames extends string = never>(definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>>;
  extend<Props>(definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>): ExtendedVue<V, {}, {}, {}, Props>;
  extend(options?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}>;

  nextTick<T>(callback: (this: T) => void, context?: T): void;
  nextTick(): Promise<void>
  set<T>(object: object, key: string | number, value: T): T;
  set<T>(array: T[], key: number, value: T): T;
  delete(object: object, key: string | number): void;
  delete<T>(array: T[], key: number): void;

  directive(
    id: string,
    definition?: DirectiveOptions | DirectiveFunction
  ): DirectiveOptions;
  filter(id: string, definition?: Function): Function;

  component(id: string): VueConstructor;
  component<VC extends VueConstructor>(id: string, constructor: VC): VC;
  component<Data, Methods, Computed, Props>(id: string, definition: AsyncComponent<Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;
  component<Data, Methods, Computed, PropNames extends string = never>(id: string, definition?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;
  component<Data, Methods, Computed, Props>(id: string, definition?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;
  component<PropNames extends string>(id: string, definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>>;
  component<Props>(id: string, definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>): ExtendedVue<V, {}, {}, {}, Props>;
  component(id: string, definition?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}>;

  use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): VueConstructor<V>;
  use(plugin: PluginObject<any> | PluginFunction<any>, ...options: any[]): VueConstructor<V>;
  mixin(mixin: VueConstructor | ComponentOptions<Vue>): VueConstructor<V>;
  compile(template: string): {
    render(createElement: typeof Vue.prototype.$createElement): VNode;
    staticRenderFns: (() => VNode)[];
  };

  observable<T>(obj: T): T;

  config: VueConfiguration;
  version: string;
}

const Vue: VueConstructor;
`;


const _routerDef = `
type Dictionary < T > = { [key: string]: T }
type ErrorHandler = (err: Error) => void

type RouterMode = 'hash' | 'history' | 'abstract'
type RawLocation = string | Location
type RedirectOption = RawLocation | ((to: Route) => RawLocation)
type NavigationGuard < V extends Vue = Vue > = (
  to: Route,
  from: Route,
  next: (to?: RawLocation | false | ((vm: V) => any) | void) => void
) => any

declare class VueRouter {
  constructor(options?: RouterOptions)

  app: Vue
  mode: RouterMode
  currentRoute: Route

  beforeEach(guard: NavigationGuard): Function
  beforeResolve(guard: NavigationGuard): Function
  afterEach(hook: (to: Route, from: Route) => any): Function
  push(location: RawLocation): Promise<Route>
  replace(location: RawLocation): Promise<Route>
  push(
    location: RawLocation,
    onComplete?: Function,
    onAbort?: ErrorHandler
  ): void
  replace(
    location: RawLocation,
    onComplete?: Function,
    onAbort?: ErrorHandler
  ): void
  go(n: number): void
  back(): void
  forward(): void
  getMatchedComponents(to?: RawLocation | Route): Component[]
  onReady(cb: Function, errorCb?: ErrorHandler): void
  onError(cb: ErrorHandler): void
  addRoutes(routes: RouteConfig[]): void
  resolve(
    to: RawLocation,
    current?: Route,
    append?: boolean
  ): {
    location: Location
    route: Route
    href: string
    // backwards compat
    normalizedTo: Location
    resolved: Route
  }

  static install: PluginFunction<never>
}

type Position = { x: number; y: number }
type PositionResult = Position | { selector: string; offset?: Position } | void

interface RouterOptions {
  routes?: RouteConfig[]
  mode?: RouterMode
  fallback?: boolean
  base?: string
  linkActiveClass?: string
  linkExactActiveClass?: string
  parseQuery?: (query: string) => Object
  stringifyQuery?: (query: Object) => string
  scrollBehavior?: (
    to: Route,
    from: Route,
    savedPosition: Position | void
  ) => PositionResult | Promise<PositionResult> | undefined | null
}

type RoutePropsFunction = (route: Route) => Object

interface PathToRegexpOptions {
  sensitive?: boolean
  strict?: boolean
  end?: boolean
}

interface RouteConfig {
  path: string
  name?: string
  component?: Component
  components?: Dictionary<Component>
  redirect?: RedirectOption
  alias?: string | string[]
  children?: RouteConfig[]
  meta?: any
  beforeEnter?: NavigationGuard
  props?: boolean | Object | RoutePropsFunction
  caseSensitive?: boolean
  pathToRegexpOptions?: PathToRegexpOptions
}

interface RouteRecord {
  path: string
  regex: RegExp
  components: Dictionary<Component>
  instances: Dictionary<Vue>
  name?: string
  parent?: RouteRecord
  redirect?: RedirectOption
  matchAs?: string
  meta: any
  beforeEnter?: (
    route: Route,
    redirect: (location: RawLocation) => void,
    next: () => void
  ) => any
  props:
    | boolean
    | Object
    | RoutePropsFunction
    | Dictionary<boolean | Object | RoutePropsFunction>
}

interface Location {
  name?: string
  path?: string
  hash?: string
  query?: Dictionary<string | (string | null)[] | null | undefined>
  params?: Dictionary<string>
  append?: boolean
  replace?: boolean
}

interface Route {
  path: string
  name?: string | null
  hash: string
  query: Dictionary<string | (string | null)[]>
  params: Dictionary<string>
  fullPath: string
  matched: RouteRecord[]
  redirectedFrom?: string
  meta?: any
}
`;

const _vueCompositionApi = `

declare namespace VueCompositionApi {
  type Data = {
      [key: string]: unknown;
  };

   type ComponentPropsOptions<P = Data> = ComponentObjectPropsOptions<P> | string[];
   type ComponentObjectPropsOptions<P = Data> = {
      [K in keyof P]: Prop<P[K]> | null;
  };
   type Prop<T, D = T> = PropOptions<T, D> | PropType<T>;
   type DefaultFactory<T> = () => T | null | undefined;
  interface PropOptions<T = any, D = T> {
      type?: PropType<T> | true | null;
      required?: boolean;
      default?: D | DefaultFactory<D> | null | undefined | object;
      validator?(value: unknown): boolean;
  }
   type PropType<T> = PropConstructor<T> | PropConstructor<T>[];
   type PropConstructor<T> = {
      new(...args: any[]): T & object;
  } | {
      (): T;
  } | {
      new(...args: string[]): Function;
  };
   type RequiredKeys<T> = {
      [K in keyof T]: T[K] extends {
          required: true;
      } | {
          default: any;
      } | BooleanConstructor | {
          type: BooleanConstructor;
      } ? K : never;
  }[keyof T];
   type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
   type ExtractFunctionPropType<T extends Function, TArgs extends Array<any> = any[], TResult = any> = T extends (...args: TArgs) => TResult ? T : never;
   type ExtractCorrectPropType<T> = T extends Function ? ExtractFunctionPropType<T> : Exclude<T, Function>;
   type InferPropType<T> = T extends null ? any : T extends {
      type: null | true;
  } ? any : T extends ObjectConstructor | {
      type: ObjectConstructor;
  } ? Record<string, any> : T extends BooleanConstructor | {
      type: BooleanConstructor;
  } ? boolean : T extends DateConstructor | {
      type: DateConstructor;
  } ? Date : T extends FunctionConstructor ? Function : T extends Prop<infer V, infer D> ? unknown extends V ? D : ExtractCorrectPropType<V> : T;
   type ExtractPropTypes<O> = O extends object ? {
      [K in RequiredKeys<O>]: InferPropType<O[K]>;
  } & {
          [K in OptionalKeys<O>]?: InferPropType<O[K]>;
      } : {
          [K in string]: any;
      };
   type DefaultKeys<T> = {
      [K in keyof T]: T[K] extends {
          default: any;
      } ? K : never;
  }[keyof T];
   type ExtractDefaultPropTypes<O> = O extends object ? {
      [K in DefaultKeys<O>]: InferPropType<O[K]>;
  } : {};

   type ComponentInstance = InstanceType<VueConstructor>;
   type ComponentRenderProxy<P = {}, // props type extracted from props option
      B = {}, // raw bindings returned from setup()
      D = {}, // return from data()
      C extends ComputedOptions = {}, M extends MethodOptions = {}, PublicProps = P, Defaults = {}, MakeDefaultsOptional extends boolean = false> = {
          $data: D;
          $props: Readonly<MakeDefaultsOptional extends true ? Partial<Defaults> & Omit<P & PublicProps, keyof Defaults> : P & PublicProps>;
          $attrs: Data;
      } & Readonly<P> & ShallowUnwrapRef<B> & D & M & ExtractComputedReturns<C> & Omit<Vue__default, '$data' | '$props' | '$attrs'>;
   type VueConstructorProxy<PropsOptions, RawBindings, Data, Computed extends ComputedOptions, Methods extends MethodOptions> = VueConstructor & {
      new(...args: any[]): ComponentRenderProxy<ExtractPropTypes<PropsOptions>, ShallowUnwrapRef<RawBindings>, Data, Computed, Methods, ExtractPropTypes<PropsOptions>, ExtractDefaultPropTypes<PropsOptions>, true>;
  };
   type DefaultData<V> = object | ((this: V) => object);
   type DefaultMethods<V> = {
      [key: string]: (this: V, ...args: any[]) => any;
  };
   type DefaultComputed = {
      [key: string]: any;
  };
   type VueProxy<PropsOptions, RawBindings, Data = DefaultData<Vue__default>, Computed extends ComputedOptions = DefaultComputed, Methods extends MethodOptions = DefaultMethods<Vue__default>> = ComponentOptions$1<Vue__default, ShallowUnwrapRef<RawBindings> & Data, Methods, Computed, PropsOptions, ExtractPropTypes<PropsOptions>> & VueConstructorProxy<PropsOptions, RawBindings, Data, Computed, Methods>;

  interface SetupContext {
      readonly attrs: Data;
      readonly slots: Readonly<{
          [key in string]?: (...args: any[]) => VNode[];
      }>;
      /**
       * @deprecated not available in Vue 3
       */
      readonly parent: ComponentInstance | null;
      /**
       * @deprecated not available in Vue 3
       */
      readonly root: ComponentInstance;
      /**
       * @deprecated not available in Vue 3
       */
      readonly listeners: {
          [key in string]?: Function;
      };
      /**
       * @deprecated not available in Vue 3
       */
      readonly refs: {
          [key: string]: Vue__default | Element | Vue__default[] | Element[];
      };
      emit(event: string, ...args: any[]): void;
  }
   type ComputedGetter$1<T> = (ctx?: any) => T;
   type ComputedSetter$1<T> = (v: T) => void;
  interface WritableComputedOptions$1<T> {
      get: ComputedGetter$1<T>;
      set: ComputedSetter$1<T>;
  }
   type ComputedOptions = Record<string, ComputedGetter$1<any> | WritableComputedOptions$1<any>>;
  interface MethodOptions {
      [key: string]: Function;
  }
   type SetupFunction<Props, RawBindings = {}> = (this: void, props: Props, ctx: SetupContext) => RawBindings | (() => VNode | null) | void;
  interface ComponentOptionsBase<Props, D = Data, C extends ComputedOptions = {}, M extends MethodOptions = {}> extends Omit<ComponentOptions$1<Vue__default, D, M, C, Props>, 'data' | 'computed' | 'method' | 'setup' | 'props'> {
      [key: string]: any;
      data?: (this: Props & Vue__default, vm: Props) => D;
      computed?: C;
      methods?: M;
  }
   type ExtractComputedReturns<T extends any> = {
      [key in keyof T]: T[key] extends {
          get: (...args: any[]) => infer TReturn;
      } ? TReturn : T[key] extends (...args: any[]) => infer TReturn ? TReturn : never;
  };
   type ComponentOptionsWithProps<PropsOptions = ComponentPropsOptions, RawBindings = Data, D = Data, C extends ComputedOptions = {}, M extends MethodOptions = {}, Props = ExtractPropTypes<PropsOptions>> = ComponentOptionsBase<Props, D, C, M> & {
      props?: PropsOptions;
      emits?: string[] | Record<string, null | ((emitData: any) => boolean)>;
      setup?: SetupFunction<Props, RawBindings>;
  } & ThisType<ComponentRenderProxy<Props, RawBindings, D, C, M>>;
   type ComponentOptionsWithArrayProps<PropNames extends string = string, RawBindings = Data, D = Data, C extends ComputedOptions = {}, M extends MethodOptions = {}, Props = Readonly<{
      [key in PropNames]?: any;
  }>> = ComponentOptionsBase<Props, D, C, M> & {
      props?: PropNames[];
      emits?: string[] | Record<string, null | ((emitData: any) => boolean)>;
      setup?: SetupFunction<Props, RawBindings>;
  } & ThisType<ComponentRenderProxy<Props, RawBindings, D, C, M>>;
   type ComponentOptionsWithoutProps<Props = unknown, RawBindings = Data, D = Data, C extends ComputedOptions = {}, M extends MethodOptions = {}> = ComponentOptionsBase<Props, D, C, M> & {
      props?: undefined;
      emits?: string[] | Record<string, null | ((emitData: any) => boolean)>;
      setup?: SetupFunction<Props, RawBindings>;
  } & ThisType<ComponentRenderProxy<Props, RawBindings, D, C, M>>;

   type AnyObject = Record<string | number | symbol, any>;
   type Equal<Left, Right> = (<U>() => U extends Left ? 1 : 0) extends (<U>() => U extends Right ? 1 : 0) ? true : false;
   type HasDefined<T> = Equal<T, unknown> extends true ? false : true;

   function defineComponent<RawBindings, D = Data, C extends ComputedOptions = {}, M extends MethodOptions = {}>(options: ComponentOptionsWithoutProps<unknown, RawBindings, D, C, M>): VueProxy<unknown, RawBindings, D, C, M>;
   function defineComponent<PropNames extends string, RawBindings = Data, D = Data, C extends ComputedOptions = {}, M extends MethodOptions = {}, PropsOptions extends ComponentPropsOptions = ComponentPropsOptions>(options: ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M>): VueProxy<Readonly<{
      [key in PropNames]?: any;
  }>, RawBindings, D, C, M>;
   function defineComponent<Props, RawBindings = Data, D = Data, C extends ComputedOptions = {}, M extends MethodOptions = {}, PropsOptions extends ComponentPropsOptions = ComponentPropsOptions>(options: HasDefined<Props> extends true ? ComponentOptionsWithProps<PropsOptions, RawBindings, D, C, M, Props> : ComponentOptionsWithProps<PropsOptions, RawBindings, D, C, M>): VueProxy<PropsOptions, RawBindings, D, C, M>;

   type ComponentOptions = ComponentOptionsWithoutProps | ComponentOptionsWithArrayProps | ComponentOptionsWithProps;
   type Component = VueProxy<any, any, any, any, any>;
   type ComponentOrComponentOptions = ComponentOptions | Component;
   type AsyncComponentResolveResult<T = ComponentOrComponentOptions> = T | {
      default: T;
  };
   type AsyncComponentLoader = () => Promise<AsyncComponentResolveResult>;
  interface AsyncComponentOptions {
      loader: AsyncComponentLoader;
      loadingComponent?: ComponentOrComponentOptions;
      errorComponent?: ComponentOrComponentOptions;
      delay?: number;
      timeout?: number;
      suspensible?: boolean;
      onError?: (error: Error, retry: () => void, fail: () => void, attempts: number) => any;
  }
   function defineAsyncComponent(source: AsyncComponentLoader | AsyncComponentOptions): AsyncComponent;

   const Plugin: {
      install: (Vue: VueConstructor) => void;
  };

   const _refBrand: unique symbol;
  interface Ref<T = any> {
      readonly [_refBrand]: true;
      value: T;
  }
   type ToRefs<T = any> = {
      [K in keyof T]: Ref<T[K]>;
  };
   type CollectionTypes = IterableCollections | WeakCollections;
   type IterableCollections = Map<any, any> | Set<any>;
   type WeakCollections = WeakMap<any, any> | WeakSet<any>;
   type BaseTypes = string | number | boolean | Node | Window;
   type ShallowUnwrapRef<T> = {
      [K in keyof T]: T[K] extends Ref<infer V> ? V : T[K];
  };
   type UnwrapRef<T> = T extends Ref<infer V> ? UnwrapRefSimple<V> : UnwrapRefSimple<T>;
   type UnwrapRefSimple<T> = T extends Function | CollectionTypes | BaseTypes | Ref ? T : T extends Array<any> ? {
      [K in keyof T]: UnwrapRefSimple<T[K]>;
  } : T extends object ? UnwrappedObject<T> : T;
   type SymbolExtract<T> = (T extends {
      [Symbol.asyncIterator]: infer V;
  } ? {
      [Symbol.asyncIterator]: V;
  } : {}) & (T extends {
      [Symbol.hasInstance]: infer V;
  } ? {
      [Symbol.hasInstance]: V;
  } : {}) & (T extends {
      [Symbol.isConcatSpreadable]: infer V;
  } ? {
      [Symbol.isConcatSpreadable]: V;
  } : {}) & (T extends {
      [Symbol.iterator]: infer V;
  } ? {
      [Symbol.iterator]: V;
  } : {}) & (T extends {
      [Symbol.match]: infer V;
  } ? {
      [Symbol.match]: V;
  } : {}) & (T extends {
      [Symbol.replace]: infer V;
  } ? {
      [Symbol.replace]: V;
  } : {}) & (T extends {
      [Symbol.search]: infer V;
  } ? {
      [Symbol.search]: V;
  } : {}) & (T extends {
      [Symbol.species]: infer V;
  } ? {
      [Symbol.species]: V;
  } : {}) & (T extends {
      [Symbol.split]: infer V;
  } ? {
      [Symbol.split]: V;
  } : {}) & (T extends {
      [Symbol.toPrimitive]: infer V;
  } ? {
      [Symbol.toPrimitive]: V;
  } : {}) & (T extends {
      [Symbol.toStringTag]: infer V;
  } ? {
      [Symbol.toStringTag]: V;
  } : {}) & (T extends {
      [Symbol.unscopables]: infer V;
  } ? {
      [Symbol.unscopables]: V;
  } : {});
   type UnwrappedObject<T> = {
      [P in keyof T]: UnwrapRef<T[P]>;
  } & SymbolExtract<T>;
  interface RefOption<T> {
      get(): T;
      set?(x: T): void;
  }
   class RefImpl<T> implements Ref<T> {
      readonly [_refBrand]: true;
      value: T;
      constructor({ get, set }: RefOption<T>);
  }
   function createRef<T>(options: RefOption<T>, readonly?: boolean): RefImpl<T>;
   function ref<T extends object>(raw: T): T extends Ref ? T : Ref<UnwrapRef<T>>;
   function ref<T>(raw: T): Ref<UnwrapRef<T>>;
   function ref<T = any>(): Ref<T | undefined>;
   function isRef<T>(value: any): value is Ref<T>;
   function unref<T>(ref: T): T extends Ref<infer V> ? V : T;
   function toRefs<T extends object>(obj: T): ToRefs<T>;
   type CustomRefFactory<T> = (track: () => void, trigger: () => void) => {
      get: () => T;
      set: (value: T) => void;
  };
   function customRef<T>(factory: CustomRefFactory<T>): Ref<T>;
   function toRef<T extends object, K extends keyof T>(object: T, key: K): Ref<T[K]>;
   function shallowRef<T extends object>(value: T): T extends Ref ? T : Ref<T>;
   function shallowRef<T>(value: T): Ref<T>;
   function shallowRef<T = any>(): Ref<T | undefined>;
   function triggerRef(value: any): void;
   function proxyRefs<T extends object>(objectWithRefs: T): ShallowUnwrapRef<T>;

   function isRaw(obj: any): boolean;
   function isReactive(obj: any): boolean;
   function shallowReactive<T extends object = any>(obj: T): T;
  /**
   * Make obj reactivity
   */
   function reactive<T extends object>(obj: T): UnwrapRef<T>;
  /**
   * Make sure obj can't be a reactive
   */
   function markRaw<T extends object>(obj: T): T;
   function toRaw<T>(observed: T): T;

   function isReadonly(obj: any): boolean;
   type Primitive = string | number | boolean | bigint | symbol | undefined | null;
   type Builtin = Primitive | Function | Date | Error | RegExp;
   type DeepReadonly<T> = T extends Builtin ? T : T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> : T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> : T extends WeakMap<infer K, infer V> ? WeakMap<DeepReadonly<K>, DeepReadonly<V>> : T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>> : T extends ReadonlySet<infer U> ? ReadonlySet<DeepReadonly<U>> : T extends WeakSet<infer U> ? WeakSet<DeepReadonly<U>> : T extends Promise<infer U> ? Promise<DeepReadonly<U>> : T extends {} ? {
      readonly [K in keyof T]: DeepReadonly<T[K]>;
  } : Readonly<T>;
   type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;
  /**
   * **In @vue/composition-api, \`reactive\` only provides type-level readonly check**
   *
   * Creates a readonly copy of the original object. Note the returned copy is not
   * made reactive, but \`readonly\` can be called on an already reactive object.
   */
   function readonly<T extends object>(target: T): DeepReadonly<UnwrapNestedRefs<T>>;
   function shallowReadonly<T extends object>(obj: T): Readonly<T>;

  /**
   * Set a property on an object. Adds the new property, triggers change
   * notification and intercept it's subsequent access if the property doesn't
   * already exist.
   */
   function set<T>(target: AnyObject, key: any, val: T): T;

  /**
   * Delete a property and trigger change if necessary.
   */
   function del(target: AnyObject, key: any): void;

   const onBeforeMount: (callback: Function) => void;
   const onMounted: (callback: Function) => void;
   const onBeforeUpdate: (callback: Function) => void;
   const onUpdated: (callback: Function) => void;
   const onBeforeUnmount: (callback: Function) => void;
   const onUnmounted: (callback: Function) => void;
   const onErrorCaptured: (callback: Function) => void;
   const onActivated: (callback: Function) => void;
   const onDeactivated: (callback: Function) => void;
   const onServerPrefetch: (callback: Function) => void;

  interface ComputedRef<T = any> extends WritableComputedRef<T> {
      readonly value: T;
  }
  interface WritableComputedRef<T> extends Ref<T> {
  }
   type ComputedGetter<T> = (ctx?: any) => T;
   type ComputedSetter<T> = (v: T) => void;
  interface WritableComputedOptions<T> {
      get: ComputedGetter<T>;
      set: ComputedSetter<T>;
  }
   function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>;
   function computed<T>(options: WritableComputedOptions<T>): WritableComputedRef<T>;

   type WatchEffect = (onInvalidate: InvalidateCbRegistrator) => void;
   type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);
   type WatchCallback<V = any, OV = any> = (value: V, oldValue: OV, onInvalidate: InvalidateCbRegistrator) => any;
   type MapSources<T> = {
      [K in keyof T]: T[K] extends WatchSource<infer V> ? V : never;
  };
   type MapOldSources<T, Immediate> = {
      [K in keyof T]: T[K] extends WatchSource<infer V> ? Immediate extends true ? V | undefined : V : never;
  };
  interface WatchOptionsBase {
      flush?: FlushMode;
  }
   type InvalidateCbRegistrator = (cb: () => void) => void;
   type FlushMode = 'pre' | 'post' | 'sync';
  interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
      immediate?: Immediate;
      deep?: boolean;
  }
  interface VueWatcher {
      lazy: boolean;
      get(): any;
      teardown(): void;
      run(): void;
      value: any;
  }
   type WatchStopHandle = () => void;
   function watchEffect(effect: WatchEffect, options?: WatchOptionsBase): WatchStopHandle;
   function watch<T extends Readonly<WatchSource<unknown>[]>, Immediate extends Readonly<boolean> = false>(sources: T, cb: WatchCallback<MapSources<T>, MapOldSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchStopHandle;
   function watch<T, Immediate extends Readonly<boolean> = false>(source: WatchSource<T>, cb: WatchCallback<T, Immediate extends true ? T | undefined : T>, options?: WatchOptions<Immediate>): WatchStopHandle;
   function watch<T extends object, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<T, Immediate extends true ? T | undefined : T>, options?: WatchOptions<Immediate>): WatchStopHandle;

  interface InjectionKey<T> extends Symbol {
  }
   function provide<T>(key: InjectionKey<T> | string, value: T): void;
   function inject<T>(key: InjectionKey<T> | string): T | undefined;
   function inject<T>(key: InjectionKey<T> | string, defaultValue: T, treatDefaultAsFactory?: boolean): T;

   const useCssModule: (name?: string) => Record<string, string>;
  /**
   * @deprecated use \`useCssModule\` instead.
   */
   const useCSSModule: (name?: string) => Record<string, string>;

  interface App {
      config: VueConstructor$1['config'];
      use: VueConstructor$1['use'];
      mixin: VueConstructor$1['mixin'];
      component: VueConstructor$1['component'];
      directive: VueConstructor$1['directive'];
      mount: Vue__default['$mount'];
      unmount: Vue__default['$destroy'];
  }
   function createApp(rootComponent: any, rootProps?: any): App;

   type NextTick = Vue__default['$nextTick'];
   const nextTick: NextTick;

   const createElement: Vue.CreateElement;

  /**
   * Displays a warning message (using console.error) with a stack trace if the
   * function is called inside of active component.
   *
   * @param message warning message to be displayed
   */
   function warn(message: string): void;

   type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

   type Slot = (...args: any[]) => VNode[];
   type InternalSlots = {
      [name: string]: Slot | undefined;
  };
   type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;
   type EmitFn<Options = ObjectEmitsOptions, Event extends keyof Options = keyof Options> = Options extends Array<infer V> ? (event: V, ...args: any[]) => void : {} extends Options ? (event: string, ...args: any[]) => void : UnionToIntersection<{
      [key in Event]: Options[key] extends (...args: infer Args) => any ? (event: key, ...args: Args) => void : (event: key, ...args: any[]) => void;
  }[Event]>;
  /**
   * We expose a subset of properties on the internal instance as they are
   * useful for advanced external libraries and tools.
   */
   interface ComponentInternalInstance {
      uid: number;
      parent: ComponentInternalInstance | null;
      root: ComponentInternalInstance;
      /**
       * Vnode representing this component in its parent's vdom tree
       */
      vnode: VNode;
      /**
       * Root vnode of this component's own vdom tree
       */
      /**
       * The reactive effect for rendering and patching the component. Callable.
       */
      update: Function;
      data: Data;
      props: Data;
      attrs: Data;
      refs: Data;
      emit: EmitFn;
      slots: InternalSlots;
      emitted: Record<string, boolean> | null;
      proxy: ComponentInstance;
      isMounted: boolean;
      isUnmounted: boolean;
      isDeactivated: boolean;
  }
   function getCurrentInstance(): ComponentInternalInstance | null;

   const version: string;

  export { App, ComponentInstance, ComponentInternalInstance, ComponentPropsOptions, ComponentRenderProxy, ComputedGetter, ComputedOptions, ComputedRef, ComputedSetter, Data, DeepReadonly, ExtractDefaultPropTypes, ExtractPropTypes, FlushMode, InjectionKey, MethodOptions, PropOptions, PropType, Ref, SetupContext, SetupFunction, ShallowUnwrapRef, ToRefs, UnwrapRef, VueWatcher, WatchCallback, WatchEffect, WatchOptions, WatchOptionsBase, WatchSource, WatchStopHandle, WritableComputedOptions, WritableComputedRef, computed, createApp, createRef, customRef, defineAsyncComponent, defineComponent, del, getCurrentInstance, createElement as h, inject, isRaw, isReactive, isReadonly, isRef, markRaw, nextTick, onActivated, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onDeactivated, onErrorCaptured, onMounted, onServerPrefetch, onUnmounted, onUpdated, provide, proxyRefs, reactive, readonly, ref, set, shallowReactive, shallowReadonly, shallowRef, toRaw, toRef, toRefs, triggerRef, unref, useCSSModule, useCssModule, version, warn, watch, watchEffect };
}
`;

const _vueExtends = `
declare type UEVueMixin<V extends Vue = Vue> = ComponentOptions<Vue> | typeof Vue;
interface UEVueComponentOptions<V extends Vue> extends ComponentOptions<V> {
}
declare function UEMergeMixin<V extends Vue = Vue>(mixin1: UEVueMixin<V>, mixin2: UEVueMixin<V>): UEVueMixin<V>;
declare function UEVueComponent<V extends Vue>(options: UEVueComponentOptions<V> & ThisType<V>): <VC extends VueClass<V>>(target: VC) => VC;
/**
 * UEProp(String)
 * @param options
 * @returns
 */
declare function UEVueProp(options?: (PropOptions | Constructor[] | Constructor)): PropertyDecorator;
/**
  * 定义 Inject
  * @param provide
  * @example
  *  UEVueProvide('ppName')
  *  private _tstPo() {
  *      return this.name + 'asdfasf';
  *  }
  *
  */
declare function UEVueProvide(provide?: string): PropertyDecorator;
/**
 * 注入 Provide
 * @param provide
 * @param defaultValue
 * @example
 *  UEVueInject('ppName')
    private _ppName:any;
 */
declare function UEVueInject(provide?: string, defaultValue?: any): PropertyDecorator;
/**
 * vue data
 * @example
 *   UEVueData()
 *   private _initData1() {
 *       this.name1 = '11111';
 *       this.name2 = '2222';
 *      return {name3: '3333'};
 *   }
 */
declare function UEVueData(): PropertyDecorator;
/**
 * UEProp(String)
 * @param options
 * @returns
 */
declare function UETransFn(fn: any): MethodDecorator;
/**
 *
 * @param path
 * @param options
 * @param change
 * @returns
 * @example
 * UEVueWatch('name')
 * private _wName(val){}
 */
declare function UEVueWatch<T = UEVue>(path: string | ((this: T) => any), options?: WatchOptions, change?: boolean): MethodDecorator;
declare type UEVueLifeName = 'beforeCreate' | 'created' | 'beforeMount' | 'mounted' | 'beforeDestroy' | 'destroyed' | 'beforeUpdate' | 'updated' | 'activated' | 'deactivated' | 'beforeRouteEnter' | 'beforeRouteUpdate' | 'beforeRouteLeave';
/**
 * vue data
 * @example
 *   UEVueLife('created')
 *   private _created1() {
 *   }
 */
declare function UEVueLife(lifeName: UEVueLifeName, after?: boolean): PropertyDecorator;
/**
 *
 * @param event 事件名称
 * @param once 是否只触发一次
 * @param el 是否绑定到el
 */
declare function UEVueEvent<T = UEVue>(event: string, once?: boolean, el?: ((this: T, el: HTMLElement) => HTMLElement | Document | Window) | boolean): PropertyDecorator;
/**
 *
 * @param event 事件名称
 * @param p 选项
 * @param el 是否绑定到el
 */
declare function UEVueEvent<T = UEVue>(event: string, p?: {
    /** 是否只触发一次，默认为false */
    once?: boolean;
    /** 是否路由activated才触发, 如果有el参数默认为true 否则为 false */
    activated?: boolean;
}, el?: ((this: T, el: HTMLElement) => HTMLElement | Document | Window) | boolean): PropertyDecorator;
/**
 * 影射到v-model value 值
 * @param change change(self, val, oldVal):void
 * @example UEVueValue() id:string = '';
 */
declare function UEVueValue<T>(change?: (self: T, val: any, oldVal: any) => void): (target: any, propKey: string) => void;
declare class UEVue extends Vue {
    static getVueName(vnode: any): any;
    get $vueName(): string;
    readonly props: void;
    readonly store: void;
    readonly beforeCreate: void;
    readonly created: void;
    readonly beforeMount: void;
    readonly mounted: void;
    readonly beforeDestroy: void;
    readonly destroyed: void;
    readonly beforeUpdate: void;
    readonly updated: void;
    readonly activated: void;
    readonly deactivated: void;
    readonly computed: void;
    readonly beforeRouteEnter: void;
    readonly beforeRouteUpdate: void;
    readonly beforeRouteLeave: void;
    readonly render: () => any;
    readonly _render: () => any;
    private value;
    /** 获取或设置值 */
    get $value(): any;
    set $value(value: any);
    get $isDestroyed(): boolean;
    get $isBeingDestroyed(): boolean;
    get $isMounted(): boolean;
    get $isRouteActived(): boolean;
}

`;

const _ueDef = `
declare type UEObject = {
  [key: string]: any;
};
interface UEOption {
  /** vue 组合，扩展到组件内部，如：组件、指令或方法等 */
  mixins?: UEVueMixin[];
  /** 转换器，定义json的渲染行为 和 定义组件在编辑时的行为属性 */
  transfer?: UETransfer;
  /** 设置模板到编辑器左边树 */
  templates?: UETemplate[];
  /** 编辑器设置 */
  readonly editor?: {
      [type: string]: UETransferEditor;
  };
  /** 转换器处理之前 */
  transferBefore?: (render: UERenderItem, extend?: UETransferExtend) => UERenderItem;
  /** 转换器处理之后 */
  transferAfter?: (render: UERenderItem, extend?: UETransferExtend) => UERenderItem;
  /** 扩展代码智能提示声明 */
  extraLib?(): Promise<string>;
  /** 添加全局变量，object对象 */
  global?(): UEObject;
  /** 设置http对象 */
  http?(): UEHttpRequest;
  /** 是否开启 babel 在线编译（要加载babel-standalone js），默认为 true */
  babel?: boolean;
  /** 是否已初始化 */
  readonly inited?: boolean;
}

type UEHttpRequestConfig = {
  url?:string;
  method?:string;
  data?: any;
  query?: any;
  [key: string]: any;
};

type UEHttpRequest = {
  get?(url: string, config?: UEHttpRequestConfig): Promise<any>;
  delete?(url: string, config?: UEHttpRequestConfig): Promise<any>;
  head?(url: string, config?: UEHttpRequestConfig): Promise<any>;
  post?(url: string, config?: UEHttpRequestConfig): Promise<any>;
  put?(url: string, config?: UEHttpRequestConfig): Promise<any>;
  patch?(url: string, config?: UEHttpRequestConfig): Promise<any>;
  [key: string]: (url: string, config?: UEHttpRequestConfig) => Promise<any>;
};

declare type UETransferExtend = {
  /** Vue 初始化数据 */
  data?: UEObject;
  /** 编辑中 */
  readonly editing?: boolean;
  readonly service?: UEService;
  readonly editor?: UETransferEditor;
  /** 当前 render */
  readonly render?: UERenderItem;
  /** 全局变量 */
  global?: any;
  readonly options?: UEOption;
  /**
   * 添加 mixin
   * @param mixin
   * @param before
   */
  extendMixin(mixin: UEVueMixin, before?: boolean): any;
  /**
   * 设置prop内容
   * @param name
   * @param content
   */
  setProp(name: string, content: RenderProp): RenderProp;
  /**
   * 获取prop内容
   * @param name
   * @param remove 获取后是否删除
   */
  getProp(name: string, remove?: boolean): RenderProp;
  /**
   * 删除属性
   * @param name
   */
  removeProp(name: string): void;
  /**
   * 获取prop值
   * @param name
   * @param remove  获取后是否删除
   */
  getPropValue(name: string, remove?: boolean): any;
  setPropValue(name: string, content: RenderProp): any;
  /**
   * 获取prop text内容，如果bind返回 {{text}}
   * @param name
   * @param remove  获取后是否删除
   */
  getPropText(name: string, defaultValue?: any, remove?: boolean): any;
  /**
   * 向上查找节点，包括自己
   * @param find 查找条件，默认上一级节点
   */
  closest(find: (render: UERenderItem) => boolean): UERenderItem;
};
declare type RenderProp = {
  bind?: boolean;
  has?: boolean;
  event?: boolean;
  name: string;
  value?: any;
};
interface UETransferEditorAttrsItem {
  /** render属性props名称，一般与key相同，请参考transition appear事件与属性的定义 */
  readonly name?: string;
  /** 定义attr的key */
  readonly key?: string;
  /** 是否自定义属性，属性栏自定义的属性，可删除的属性 */
  readonly cust?: boolean;
  /** 显示名称 */
  text?: string;
  /** 默认值 */
  value?: any;
  /** 编辑时代替value，保证组件编辑时的显示效果和防止使用value时出错 */
  demoValue?: any;
  /** 进入高级代码编写时，使用些属性代替 value 属性 */
  editValue?: string | {
      get(): any;
      set(val: any): void;
  };
  /** 是否默认代码编辑按钮，默认为: true */
  codeBtn?: boolean;
  placeholder?: string;
  /** 描述 */
  desc?: string;
  /** 代码编辑器的语言，javascript, typescript, ts, css */
  language?: string;
  row?: boolean;
  /** 分组 */
  group?: string;
  /** 分组顺序，同组第一个为准 */
  groupOrder?: number;
  /** 顺序 */
  order?: number;
  /** 是否显示属性，默认：true */
  show?: boolean;
  /** 是否事件，默认：false */
  event?: boolean;
  /** 是否vue属性，默认：false */
  vue?: boolean;
  /** 是否在编辑时生效，默认：false */
  effect?: boolean;
  /** 此属性只使用于编辑器，即最终结果没有此属性 */
  editorOlny?: boolean;
  /** 显示类型，默认：text，custom为自定义（弹出对话框） */
  type?: 'text' | 'slider' | 'select' | 'select-only' | 'boolean' | 'boolean-only' | 'number' | 'custom';
  /** 显示类型的参数 */
  typeOption?: any;
  /** 数据源, string[] | {text:string;value:string;} */
  datas?: any[] | ((p: {
      attr: UETransferEditorAttrsItem;
      attrs: UETransferEditorAttrs;
      service: UEService;
  }) => any[]);
  /** 是否为bind属性，默认为 false */
  bind?: boolean;
  /** 是否允许编辑bind属性, 默认 true */
  enabledBind?: boolean;
  /** 编辑是否使用bind，默认: false */
  editorBind?: boolean;
  /** 是否支持 codeEditor, 不是全部属性支持，默认为: true */
  codeEditor?: boolean;
  /** 是否默认vue-def 内容，只在vue-def使用, 默认：false */
  isVueDef?: boolean;
  /** 点击时处理，返回false中断，type为custom时生效 */
  click?(attr: UETransferEditorAttrsItem, service: UEService): Promise<boolean> | boolean;
  /** 改变时处理，返回false中断 */
  change?(attr: UETransferEditorAttrsItem, service: UEService): Promise<boolean> | boolean;
  /** 是否已初始化 */
  readonly inited?: boolean;
}
interface UETransferEditorAttrs {
  [key: string]: UETransferEditorAttrsItem;
}
interface UETransferEditor {
  /** 显示名称, 支持环境变量, 如:%label% */
  text?: string | ((p: {
      editor: UETransferEditor;
      attrs: UETransferEditorAttrs;
  }) => string);
  /** 如果text为空时默认内容 */
  defaultText?: string;
  /** 格式化 text */
  textFormat?(editor: UETransferEditor, attrs: UETransferEditorAttrs): string;
  /** 名称 */
  readonly name?: string;
  placeholder?: string;
  icon?: string;
  /** 默认的模板内容(JSON) */
  json?: UERenderItem;
  /** 默认的模板内容 */
  template?: string;
  /** 排序，默认：99 */
  order?: number;
  /** 分组，可用"/"实现分组层级，如：基础库/基础组件 */
  group?: string;
  /** 分组顺序 */
  groupOrder?: number;
  /** 是否容器组件（可以插入子节点），默认为 false */
  container?: boolean;
  /** 是否显示容器边框，默认为 false */
  containerBorder?: boolean;
  /** 是否在左边留空方便控制 */
  controlLeft?: boolean;
  /** 是否基础组件，编辑时作为独立组件，内容不能拖动，默认：true */
  base?: boolean;
  /** 编辑时使用div代替显示 */
  empty?: string;
  /** 是否可以收起，容器时默认为 true */
  collapse?: boolean;
  /** 编辑时临时添加样式 */
  className?: string | ((p: {
      render: UERenderItem;
      editor: UETransferEditor;
      attrs: UETransferEditorAttrs;
  }) => string);
  /** 是否可以选中（编辑），默认：true */
  select?: boolean;
  /** 是否可以拖动（编辑），默认：true */
  draggable?: boolean;
  /** 是否显示在组件树，默认为 true */
  showInTree?: boolean;
  /** 编辑时是否显示 */
  show?: boolean;
  /** 编辑时是否强制显示为inline */
  inline?: boolean;
  /** 是否有placeholder属性， 默认为:false */
  placeholderAttr?: boolean;
  /** 是否有 disabled 属性， 默认为:false */
  disabledAttr?: boolean;
  /** 处理是否可以复制 */
  coping?: (p: {
      render: UERenderItem;
      parent: UERenderItem;
      service: UEService;
  }) => boolean;
  /** 是否可以拖动组件为子节点，容器时才会生产 */
  contenting?: (p: {
      /** 当前render(父层) */
      fromRender: UERenderItem;
      /** 移动到 render */
      toRender: UERenderItem;
      /** 当前render的editort */
      fromEditor: UETransferEditor;
      /** 移动到 render 的editort*/
      toEditor: UETransferEditor;
      /** 容器render(父层) */
      fromParent: UERenderItem;
      /** 容器render(父层) */
      toParent: UERenderItem;
      service: UEService;
  }) => boolean;
  /** 拖动时处理，返回true|false，决定是否可以拖动到目标 */
  moving?: (p: {
      /** 当前render(父层) */
      fromRender: UERenderItem;
      /** 移动到 render */
      toRender: UERenderItem;
      /** 当前render的editort */
      fromEditor: UETransferEditor;
      /** 移动到 render 的editort*/
      toEditor: UETransferEditor;
      /** 容器render(父层) */
      fromParent: UERenderItem;
      /** 容器render(父层) */
      toParent: UERenderItem;
      type2?: UEDragType2;
      service: UEService;
  }) => boolean;
  /** 是否可以移动子节点 */
  movingChild?: (p: {
      /** 当前render(父层) */
      fromRender: UERenderItem;
      /** 移动到 render */
      toRender: UERenderItem;
      /** 当前render的editort */
      fromEditor: UETransferEditor;
      /** 移动到 render 的editort*/
      toEditor: UETransferEditor;
      /** 容器render(父层) */
      fromParent: UERenderItem;
      /** 容器render(父层) */
      toParent: UERenderItem;
      service: UEService;
  }) => boolean;
  /**
   * 编辑渲染时转换 render 和 attr
   */
  transferAttr?: (p: {
      render: UERenderItem;
      attrs: UETransferEditorAttrs;
      editor: UETransferEditor;
      editing: boolean;
      service: UEService;
  }) => void;
  /**
   * 选中对像的快捷菜单
   */
  contextmenu?: (p: {
      render: UERenderItem;
      attrs: UETransferEditorAttrs;
      editor: UETransferEditor;
      service: UEService;
  }) => UEContextmenuItem[];
  /**
   * 选中对像的工具栏
   */
  toolbar?: (p: {
      render: UERenderItem;
      attrs: UETransferEditorAttrs;
      editor: UETransferEditor;
      service: UEService;
  }) => UEContextmenuItem[];
  /** 隐藏attr，如: ['class'] */
  hideAttrs?: string[];
  /** 隐藏attr group，如: ['Vue'] */
  hideAttrGroups?: string[];
  /** 属性栏 */
  attrs?: UETransferEditorAttrs;
  /** 是否已初始化 */
  readonly inited?: boolean;
}
interface UETransferItem {
  /** 组件名称 */
  type?: string;
  /** 默认属性 */
  props?: UEObject;
  /** 编辑器配置 */
  editor?: UETransferEditor;
  /**
   * 渲染时转换 render, 如果返回空不渲染
   */
  transfer?: (render: UERenderItem, extend?: UETransferExtend) => UERenderItem;
  /** 是否已初始化 */
  readonly inited?: boolean;
}
interface UETransfer {
  [key: string]: UETransferItem;
}
/**
* 获取 ExtraLib 智能提示声明内容
*/
declare function UEGetExtraLib(): Promise<string>;
interface UETemplate {
  /**
   * 分组
   */
  group?: string;
  /**
   * 分组顺序，同分组的第一个groupOrder生效
   */
  groupOrder?: number;
  /**
   * 标题
   */
  title?: string;
  icon?: string;
  /**
   * 描述
   */
  desc?: string;
  /**
   * json 模板，可以json字串或json对像
   */
  json?: string | UEObject;
  /**
   * html 模板，如果有json内容，优先使用json内容
   */
  template?: string;
  /** 拖动时处理，返回true|false，决定是否可以拖动到目标 */
  moving?: (p: {
      /** 移动到 render */
      toRender: UERenderItem;
      /** 移动到 render 的editort*/
      toEditor: UETransferEditor;
      fromEditor: UETransferEditor;
      /** 容器render(父层) */
      toParent: UERenderItem;
      type2?: UEDragType2;
      service: UEService;
  }) => boolean;
}
declare type UEThemeMode = 'json' | 'script' | 'tmpl';
declare type UEMode = UEThemeMode | 'design' | 'json' | 'script' | 'tmpl' | 'preview' | 'other';
interface UEThemeEvent {
  item: any;
  event: any;
  service: UEService;
}
interface UEToolBar {
  title?: string;
  icon?: string;
  divided?: boolean;
  disabled?: boolean | ((e: UEThemeEvent) => boolean);
  show?: boolean | ((e: UEThemeEvent) => boolean);
  /** 点击, 返回 false 不处理默认行为 */
  click?(e: UEThemeEvent): void | boolean | Promise<void | boolean>;
}
interface UETheme {
  /**
   * 设置关于对话框内容
   * @param p
   */
  about?(p: {
      service: UEService;
  }): string | (Promise<string>);
  /**
   * 编辑器可用模式：'json' | 'script' | 'tmpl
   */
  modes?: UEThemeMode[];
  /** 设置顶部工具栏 */
  toolBar?: UEToolBar[];
  /** 选中组件的添加快捷菜单 */
  contextmenus?(p: {
      render: UERenderItem;
      parent: UERenderItem;
      editor: UETransferEditor;
      service: UEService;
  }): UEContextmenuItem[];
}
declare type UEDragType = 'in' | 'top' | 'bottom' | 'left' | 'right';
declare type UEDragType2 = 'in' | 'before' | 'after';
/** 标记为不能选择 */
declare const UECanNotSelectProps = "ue-cant-select";
/** 标记为不能移动 */
declare const UECanNotMoveProps = "ue-cant-move";
/** 标记为不能删除 */
declare const UECanNotRemoveProps = "ue-cant-remove";
/** 标记为不能复制 */
declare const UECanNotCopyProps = "ue-cant-copy";
/** 标记为不能选择子节点 */
declare const UECanNotSelectChildProps = "ue-cant-select-child";
/** 标记为不能移动子节点 */
declare const UECanNotMoveChildProps = "ue-cant-move-child";
/** 标记为不能删除子节点 */
declare const UECanNotRemoveChildProps = "ue-cant-remove-child";
/** 标记为不能复制子节点 */
declare const UECanNotCopyChildProps = "ue-cant-copy-child";
/** 标记为不能移入子节点 */
declare const UECanNotMoveInProps = "ue-cant-movein";
/** 标记为不能移出子节点 */
declare const UECanNotMoveOutProps = "ue-cant-moveout";
/** 标记节点是否锁定 */
declare const UEIsLockProps = "ue-is-lock";
/** 标记节点是否折叠 */
declare const UEIsCollapseProps = "ue-is-collapse";
/**
* 删除 ue 私有特殊属性，如：ue-cant-move
* @param props
*/
declare function UEClearPrivateProps(props: any): void;
/**
* 是否不能标示属性名称
* @param name
*/
declare function UEIsCanNotProps(name: string): boolean;
/**
* 是否不能操作
* @param render
* @param cantName 标记名称, 如：UECanNotSelectProps
*/
declare function UEIsCanNot(render: any, cantName: string): any;
declare class UECompiler {
  static toTemplate(items: (UERenderItem | string)[], editing?: boolean): string;
  static vueCompile(template: string): {
      render(createElement: any): VNode;
      staticRenderFns: (() => VNode)[];
  };
  static vueTemplateCompiler(template: string): Promise<CompiledResult<string>>;
  static compile(template: string | UERenderItem, debugInfo?: any, editing?: boolean): Promise<{
      render: any;
      staticRenderFns: any[];
  }>;
  static isEqual(p1: any, p2: any): boolean;
  /** render to code(script) */
  static renderToScriptJson(render: UERenderItem): string;
  /** code(script) render */
  static scriptJsonToRender(obj: string): UERenderItem;
  /**
   * Html 转成 Render
   * @param html
   */
  static htmlToRenderAsync(html: string): Promise<string | UERenderItem>;
  /**
   * Html 转成 Render
   * @param html
   */
  static htmlToRender(html: string): Promise<string | UERenderItem>;
  private static _htmlToRender;
  /**
   * Render 转成 Html
   * @param html
   */
  static renderToHtml(render: UERenderItem, config?: UEJsonToHtmlConfig): string;
  /**
   * Html 转成 Json
   * @param html
   */
  static htmlToJsonAsync(html: string): Promise<any>;
  /**
   * Html 转成 Json，注意先使用 UECompiler 初始化
   * @param html
   */
  static htmlToJson(html: string): any;
  /**
   * Json 转成 Html
   * @param html
   */
  static jsonToHtmlAsync(json: any, config?: UEJsonToHtmlConfig): Promise<string>;
  /**
   * Json 转成 Html，注意先使用 UECompiler 初始化
   * @param html
   */
  static jsonToHtml(json: any, config?: UEJsonToHtmlConfig): string;
  /**
   * 初始babel环境
   */
  static init(p?: {
      bable?: boolean;
  }): Promise<((html: string) => any[])[]>;
  /**
   * 使用 babel 编译，注意先使用 UECompiler 初始化
   * @param script 脚本内容
   * @param opt babel 参数
   */
  static babelTransform(script: string, opt?: any): {
      code: string;
      ast: any;
      [key: string]: any;
  };
  /**
   * 使用 babel 编译，返回一个fun name与code，注意先使用 UECompiler 初始化
   * @param script 脚本内容
   * @param hasRet 是否有返回值
   * @param opt babel 参数
   */
  static babelTransformToFun(script: string, hasRet?: boolean, opt?: any): {
      code: string;
      ast: any;
      fnName: string;
  };
  /**
   * 使用 babel 编译，返回一个fun name与code，注意先使用 UECompiler 初始化
   * @param args 新方法的参数名称，如：['name', 'id']
   * @param script 脚本内容
   * @param withThis with(this)
   * @param opt babel 参数
   * @example babelTransformToFunEx(['name', 'id'], 'return {name, id}')()
   */
  static babelTransformToFunEx(args: string[], script: string, withThis?: boolean, opt?: any): Function;
  /**
   * 使用 babel 编译，不用 UECompiler 初始化，直接可以使用
   * @param strcipt 脚本内容
   * @param opt babel 参数
   */
  static babelTransformAsync(script: string, opt?: any): Promise<{
      [key: string]: any;
      code: string;
      ast: any;
  }>;
}
declare class UEHelper {
  static stringEmpty: string;
  static noop(): void;
  static error(...args: any[]): void;
  /** 深 assign */
  static assignDepth(...objs: any[]): any;
  static isWindow(obj: any): boolean;
  /**
   * 比较两个对像是否相等，但不比较function类型
   * @param p1
   * @param p2
   */
  static isEqualNotFn(p1: any, p2: any): boolean;
  static toArray(p: any, start?: number, count?: number): Array<any>;
  static makeAutoId(): string;
  /**
   * 是否属于类或基类
   * @param p 参数
   * @param cls 类
   */
  static isClass(p: any, cls: any): boolean;
  static offset(element: HTMLElement, offset?: {
      top: number;
      left: number;
  }): {
      top: number;
      left: number;
  };
  /**
   * setQuerystring
   * @param url
   * @param p
   * @param json 如果为true , 属性内容 Array 或 Object 转为JSON, 默认为 false
   * @param useToHttp 是否用于http，encode会不一样 , 默认为 false
   */
  static setQuerystring(url: string, p: object, json?: boolean, useToHttp?: boolean): string;
  /**
   * 获取url query, 如果name为空返回query部分
   * @param url
   * @param name
   */
  static getQuerystring(url: string, name?: string): string;
  static queryParse(query: string): object;
  /**
   *
   * @param query
   * @param useToHttp 是否用于http，encode会不一样 , 默认为 false
   */
  static queryStringify(query: any, useToHttp?: boolean): string;
  /**
   * setHashQuerystring
   * @param url
   * @param p
   * @param json 如果为true , 属性内容 Array 或 Object 转为JSON, 默认为 false
   */
  static setHashQuerystring(url: string, p: object, json?: boolean): string;
  /**
   * 获取url hash query, 如果name为空返回query部分
   * @param url
   * @param name
   */
  static getHashQuerystring(url: string, name?: string): string;
  /**
   * 获取 url hash部分
   * @param url
   */
  static getUrlHash(url: string): string;
  /**
   * 获取url路径部分
   * @param url
   */
  static getUrlPart(url: string): string;
  /**
   * url 是否绝对路径
   * @param url
   */
  static isAbsolutelyUrl(url: string): boolean;
  /**
   * 发送一个事件
   * @param element HTML Element
   * @param eventName 事件名称
   * @param type 事件类型，默认 MouseEvents
   * @param bubbles 是否可以取消，默认 true
   * @param cancelable 是否可以取消，默认 true
   */
  static dispatchEvent(element: Element | EventTarget, eventName: string, type?: "UIEvents" | "MouseEvents" | "MutationEvents" | "HTMLEvents", bubbles?: boolean, cancelable?: boolean): void;
  /**
   * 统一 await 返回值: [err, data]
   * @param promise
   */
  static awaitWrap<T = any, U = any>(promise: Promise<T>): Promise<[U | null, T | null]>;
  /**
   * 暂停
   * @param time 微秒
   */
  static pause(time: any): Promise<unknown>;
}
declare class UERender {
  /**
   * 将元数据转为vue 元数据
   * @param renders
   * @param extend
   */
  static JsonToVueRender(renders: UERenderItem[], extend: UETransferExtend, parentRender?: UERenderItem): UERenderItem[];
  /**
   * 添加公共模板，传入参数会被亏染
   * @param options
   * @param transfer
   */
  static AddGlobalTemplates(templates: UETemplate[]): void;
  /**
   * 添加公共 transfer，传入参数会被亏染
   * @param options
   * @param transfer
   */
  static AddGlobalTransfer(...transfers: UETransfer[]): void;
  /** 将公共内容放到option */
  static GlobalToOptions(options: UEOption): UEOption;
  /**
   * 添加新的 transfer 到 options，传入参数会被亏染
   * @param options
   * @param transfer
   */
  static AddTransfer(options: UEOption, transfer: UETransfer): UEOption;
  /**
   * 定义 options，传入参数会被亏染
   * @param options
   */
  static DefineOption(options: UEOption): UEOption;
  /**
   * 定义 transfer，传入参数会被亏染
   * @param transfer
   */
  static DefineTransfer(transfer: UETransfer): UETransfer;
  /**
   * 定义 transfer.editor，传入参数会被亏染
   * @param type
   * @param editor
   */
  static DefineTransferEditor(type: string, editor: UETransferEditor): UETransferEditor;
  /**
   * 定义 transfer.editor.attr，传入参数会被亏染
   * @param name
   * @param attr
   * @param editor
   */
  static DefineTransferEditorAttr(name: string, attr: UETransferEditorAttrsItem, editor: UETransferEditor): UETransferEditorAttrsItem;
  /**
   * 新建一个自定义attr
   * @param name
   * @param attr
   * @param editor
   */
  static NewCustAttr(name: string, attr: UETransferEditorAttrsItem, editor: UETransferEditor): UETransferEditorAttrsItem;
  static newEditValue(fnName: string): {
      get(): any;
      set(val: any): void;
  };
  static findRender(renders: UERenderItem[], p: any): UERenderItem;
  static getVueBindName(name: string): string;
  static getVueBindNameEx(name: string): {
      isBind: boolean;
      isEvent: boolean;
      name: string;
  };
  static makeExportDefault(content: string): string;
  static removeExportDefault(content: string): string;
}
interface UERenderItem {
  /** 标签类型 */
  type?: string;
  /** 属性 */
  props?: any;
  /** 子节点 */
  children?: (UERenderItem | string)[];
  /** 是否创建此节点，默认为 true */
  isRender?: boolean;
  /** 获取父节点 */
  parent?(): UERenderItem;
  content?: string;
  /** 编辑时的ID */
  readonly editorId?: string;
  /** 编辑时的 parent ID */
  readonly editorPId?: string;
  /** 编辑器组件配置 */
  readonly editor?: UETransferEditor;
  /**
   * 存放临时内容
   */
  readonly temp?: UEObject;
  /** 编辑器组件属性配置 */
  readonly attrs?: UETransferEditorAttrs;
  /** 编辑器设计时使用 */
  'editor-attrs'?: any;
}
declare type MonacoEditorContext = {
  content?: string;
  extraLib?: string;
  formatAuto?: boolean;
  show?: boolean;
  language?: "javascript" | 'json' | 'html' | 'css';
  save?(content?: string): Promise<void> | void;
  close?(): Promise<void> | void;
};
declare type UEAddComponent = {
  id?: string;
  $isTmpl?: boolean;
  uedrag?: boolean;
  icon?: string;
  title?: string;
  type?: string;
  item: any;
};
declare class UEService {
  readonly $uieditor: UEVue;
  constructor($uieditor: UEVue, options: UEOption);
  private _options;
  get options(): UEOption;
  set options(options: UEOption);
  _destroy(): void;
  $emit(event: string, ...arg: any[]): void;
  $on(event: string, callback: Function): void;
  /** 历史记录 */
  history: {
      list: any[];
      curList: any[];
      pos: number;
      max: number;
      init: boolean;
      canNext: boolean;
      canPre: boolean;
      _cacle: () => void;
      add: (item: any) => void;
      addCur: () => void;
      next: () => Promise<void>;
      pre: () => Promise<void>;
  };
  /** 当前处理内容 */
  current: {
      /** 当前选中Id */
      id: string;
      /** 当前选中parentId */
      parentId: string;
      /** 根Id */
      rootId: string;
      /** 面包屑 */
      breadcrumbs: any[];
      /** 是否属性栏 */
      refreshAttr: boolean;
      /** 编辑中的属性栏 */
      attrs: any;
      /** 编辑中的editor内容 */
      editor: any;
      /** 用于显示的vue mixin */
      mixin: any;
      /** 计算后用于显示的JSON */
      json: any;
      /** 模式：design, json, script, tmpl, preview */
      mode: UEMode;
      monacoEditor: MonacoEditorContext;
      monacoEditorOther: MonacoEditorContext;
  };
  private _clearMonacoEditor;
  setModeUI(mode: UEMode): void;
  setMode(mode: UEMode): Promise<void>;
  /**
   * 打开代码编辑
   * @param option
   */
  showMonacoEditorOther(option: MonacoEditorContext): Promise<void>;
  getTmpl(): string;
  setTmpl(html: any): Promise<void>;
  getScript(): string;
  setScript(script: string): Promise<void>;
  /** 获取预览参数 */
  getPreviewOpt(): string;
  setPreviewOpt(content: string): Promise<void>;
  showPreviewOpt(): void;
  private _resetCurrent;
  /** 编辑中的JSON */
  private _editJson;
  /** 编辑中的 root JSON，注意：不是完整JSON内容，如：collapse 后，子节点给删除了。 */
  get rootRender(): UERenderItem;
  setJson(json: UERenderItem): Promise<any>;
  _lastcp: Vue;
  private _setJson;
  getRenderItem(id: string, context?: UERenderItem): UERenderItem;
  /**
 * 根据 type 获取 render
 * @param type
 * @param render 如果不为空，从些render开始查找
 */
  getRenderByType(type: string, context?: UERenderItem): UERenderItem;
  /**
   * 获取当前render
   */
  getCurRender(): UERenderItem;
  /**
   * 获取父节点
   * @param render
   * @param all 是否所有内容，否则根据select设置查找父节点，默认为：true
   */
  getParentRenderItem(render: UERenderItem, all?: boolean): UERenderItem;
  getParentRenderByType(render: UERenderItem, type: string): any;
  closest(render: UERenderItem, fn: (render: UERenderItem) => boolean): any;
  empty(cnf?: boolean): Promise<void>;
  /**
   * 获取 render 的临时内容，使用内容传送
   * @param id
   * @param key
   */
  getRenderTemp(id: string, key: string): any;
  /**
   * 获取 render 的临时内容，使用内容传送
   * @param render
   * @param key
   */
  getRenderTemp(render: UERenderItem, key: string): any;
  /**
   * 设置 render 的临时内容(不会生成meta)，使用内容传送
   * @param id
   * @param key
   * @param value
   */
  setRenderTemp(id: string, key: string, value: any): any;
  /**
   * 设置 render 的临时内容(不会生成meta)，使用内容传送
   * @param render
   * @param key
   * @param value
   */
  setRenderTemp(render: UERenderItem, key: string, value: any): any;
  /**
   * 刷新导向栏
   * @param render
   */
  refresBreadcrumbs(render?: UERenderItem): void;
  private _makeBreadcrumbs;
  /**
   * 根据component创建render
   * @param type
   * @param parentId
   */
  private createRender;
  /**
   * 修改 render type(类型)
   * @param render
   * @param type
   */
  changeRenderType(render: UERenderItem, type: string): void;
  /**
   *
   * @param cnf 是否要确认
   * @param norefresh 是否刷新
   */
  delCur(cnf?: boolean, norefresh?: boolean): Promise<void>;
  /** norefresh 是否刷新 */
  deleteWidget(parentId: string, id: string, norefresh?: boolean): void;
  getAttr(id: string, key: string): UETransferEditorAttrsItem;
  /**
   * 根据id， 设置render属性
   * @param id
   * @param attr
   */
  setAttr(id: string, attr: UETransferEditorAttrsItem, refresh?: boolean): Promise<void>;
  /**
   * 添加属性
   * @param id
   * @param attrName
   */
  addAttr(id: string, attrName: string): UETransferEditorAttrsItem;
  /**
   * 返回编辑最终render，保存时用
   * @param editing 是否编辑中的render， 默认：false
   * @param id 返回指定render内容
   */
  getJson(editing?: boolean, id?: string): any;
  /**
   * 返回编辑最终render，保存时用
   * @param editing 是否编辑中的render， 默认：false
   * @param render 返回指定render内容
   */
  getJson(editing?: boolean, render?: UERenderItem): any;
  private _isRrefreshing;
  /**
   * 刷新编辑内容
   * @param formHistory
   */
  refresh(): Promise<any>;
  _currentTimeId: any;
  /**
   * 设置（选择）当前render
   * @param render
   */
  setCurrent(render: UERenderItem): any;
  /**
   * 根据id，设置（选择）当前render
   * @param id
   */
  setCurrent(id: string): any;
  refeshSelectBox(): void;
  private _components;
  private _components_tree;
  /** 组件栏数据 */
  get components(): {
      list: any[];
      tree: any[];
  };
  /**
   * 通过拖动添加
   * @param cpId
   * @param renderId
   * @param type2
   */
  addByDrag(cpId: string, renderId: string, type2: UEDragType2): Promise<void>;
  canAddByDrag(cpId: string, renderId: string, type2: UEDragType2): boolean;
  /**
   * 通过类型添加
   * @param type
   * @param renderId
   * @param type2
   */
  addByType(type: string, renderId: string, type2: UEDragType2): Promise<void>;
  /**
   * 通过JSON添加
   * @param json
   * @param renderId
   * @param type2
   */
  addByJson(json: any, renderId: string, type2: UEDragType2): Promise<void>;
  /**
   * 通过模板添加
   * @param json
   * @param renderId
   * @param type2
   */
  addByTmpl(template: string, renderId: string, type2: UEDragType2): Promise<void>;
  /**
   * 添加组件 或 模板
   * @param component
   * @param renderId
   * @param type2
   */
  addByComponent(component: UEAddComponent, renderId: string, type2: UEDragType2): Promise<any>;
  isLocked(render: UERenderItem): boolean;
  isLocked(id: string): boolean;
  locked(render: UERenderItem, locked: boolean): Promise<any>;
  locked(id: string, locked: boolean): Promise<any>;
  isCollapse(render: UERenderItem): boolean;
  isCollapse(id: string): boolean;
  collapse(render: UERenderItem, isCollapse: boolean): Promise<any>;
  collapse(id: string, isCollapse: boolean): Promise<any>;
  canRemove(render: UERenderItem): boolean;
  canRemove(id: string): boolean;
  canCopy(render: UERenderItem): boolean;
  canCopy(id: string): boolean;
  canSelect(render: UERenderItem): boolean;
  canSelect(id: string): boolean;
  canMove(fromId: string, toId: string, type2: UEDragType2): boolean;
  move(fromId: string, toId: string, type2: string): Promise<any>;
  private _copyId;
  private _copyParentId;
  private _isCut;
  copyCur(): void;
  copyCurToNext(): void;
  /** 剪切 */
  cutCur(): void;
  get canPaste(): boolean;
  pasteCur(pos?: 'before' | 'after' | 'child', keepCur?: boolean, currentId?: string, focus?: boolean): void;
  private selectById;
  selectNext(): void;
  selectPre(): void;
  selectParent(): void;
  selectChild(): void;
  foucs(): void;
}

`;


const _other = `

declare function UEEditorVueDef(def:UEVueMixin & {
  setup:VueCompositionApi.SetupFunction<VueCompositionApi.Props, VueCompositionApi.RawBindings>;
}
):UEVueMixin;

declare function UEPreviewOptionDef(p:{
  /** 模拟 $query */
  query:any;
  /** 模拟 $param */
  param:any;
  /** 模拟 vue def */
  vueDef:UEVueMixin;
}):any;

`;

export const ExtraLib = `
${_vueDef}
${_routerDef}
${_vueCompositionApi}
${_vueExtends}
${_ueDef}
${_other}
`;