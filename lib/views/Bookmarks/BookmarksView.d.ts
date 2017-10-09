import { UIPane } from '../../ui-components/UIPane';
import { UIExtendedListView, UIExtendedListViewModel } from '../../ui-components/UIExtendedListView';
export declare class BookmarksView extends UIPane {
    listView: UIExtendedListView;
    model: UIExtendedListViewModel;
    constructor(uri: string);
    protected createUI(): HTMLElement;
    destroy(): void;
}
