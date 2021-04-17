
export interface UEContextmenuItem<> {
    id?: string;
    title: string;
    disabled?: boolean;
    divided?: boolean;
    show?: boolean;
    click?: (item: UEContextmenuItem, e: MouseEvent) => void;
    child?: UEContextmenuItem[];
}