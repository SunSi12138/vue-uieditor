
export interface UEContextmenuItem<T=any> {
    id?:string;
    name: string;
    disabled?: boolean;
    divided?: boolean;
    selected?: boolean;
    /** 是否有权限 */
    permission?: string | string[];
    datas?: T;
    click?: (item: UEContextmenuItem<T>) => void;
    children?: UEContextmenuItem<T>[];
}