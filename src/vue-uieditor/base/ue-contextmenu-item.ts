
export interface UEContextmenuItem<> {
    id?: string;
    title: string;
    disabled?: boolean;
    divided?: boolean;
    click?: (item: UEContextmenuItem) => void;
    child?: UEContextmenuItem[];
}