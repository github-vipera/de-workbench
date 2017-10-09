'use babel';
import { createText, createElement } from '../../element/index';
import { EventBus } from '../../DEWorkbench/EventBus';
import { EventEmitter } from 'events';
import { UIPane } from '../../ui-components/UIPane';
import { Logger } from '../../logger/Logger';
import { BookmarkManager } from '../../DEWorkbench/BookmarkManager';
import { UIExtendedListView } from '../../ui-components/UIExtendedListView';
const _ = require("lodash");
const cliTruncate = require('cli-truncate');
export class BookmarksView extends UIPane {
    constructor(uri) {
        super(uri, "Bookmarks");
    }
    createUI() {
        Logger.consoleLog("BookmarksView creating for ", this.paneId);
        this.model = new BookmarksModel();
        this.listView = new UIExtendedListView(this.model).setCellSelectable(false);
        let el = createElement('div', {
            elements: [
                this.listView.element()
            ],
            className: 'de-workbench-bookmarks-view'
        });
        return el;
    }
    destroy() {
        this.listView.destroy();
        this.model.destroy();
        this.listView = null;
        this.model = null;
        super.destroy();
    }
}
class BookmarksModel {
    static get COL_ACTION() { return 0; }
    static get COL_RESOURCE() { return 1; }
    static get COL_LINENO() { return 2; }
    constructor() {
        this.events = new EventEmitter();
        this.bookmarks = BookmarkManager.getInstance().getBookmarks();
        EventBus.getInstance().subscribe(BookmarkManager.EVT_BOOKMARK_ADDED, (eventData) => {
            this.onBookmarkAdded(eventData[0]);
        });
        EventBus.getInstance().subscribe(BookmarkManager.EVT_BOOKMARK_REMOVED, (eventData) => {
            this.onBookmarkRemoved(eventData[0]);
        });
    }
    onBookmarkAdded(bookmark) {
        this.events.emit('didModelChanged', this);
    }
    onBookmarkRemoved(bookmark) {
        _.remove(this.bookmarks, {
            id: bookmark.id
        });
        this.events.emit('didModelChanged', this);
    }
    hasHeader() {
        return true;
    }
    getRowCount() {
        return this.bookmarks.length;
    }
    getColCount() {
        return 3;
    }
    isCellEditable(row, col) {
        return false;
    }
    onValueChanged(row, col, value) {
    }
    onEditValidation(row, col, value) {
        return null;
    }
    getElementAt(row, col) {
        let bookmark = this.bookmarks[row];
        let filePathValue = bookmark.filePath;
        if (col === BookmarksModel.COL_RESOURCE) {
            let el = createElement('a', {
                elements: [createText(filePathValue)]
            });
            el.setAttribute('href', '#');
            el.setAttribute('bookmark_id', bookmark.id);
            el.addEventListener('click', (evt) => {
                this.onBookmarkClicked(evt.target.getAttribute('bookmark_id'));
            });
            return el;
        }
        else if (col === BookmarksModel.COL_LINENO) {
            let el = createElement('a', {
                elements: [createText("" + (bookmark.lineNumber + 1))]
            });
            return el;
        }
        else if (col === BookmarksModel.COL_ACTION) {
            let el = createElement('span', {
                elements: [],
                className: 'icon icon-remove-close'
            });
            el.setAttribute('bookmark_id', bookmark.id);
            el.addEventListener('click', (evt) => {
                this.onBookmarkDeleteClicked(evt.target.getAttribute('bookmark_id'));
            });
            return el;
        }
    }
    onBookmarkDeleteClicked(bookmarkId) {
        this.events.emit("onDidBookmarkDeleteClick", bookmarkId);
        let deleted = BookmarkManager.getInstance().deleteBookmarkById(bookmarkId);
        if (deleted) {
            this.events.emit('didModelChanged', this);
        }
    }
    onBookmarkClicked(bookmarkId) {
        this.events.emit("onDidBookmarkClick", bookmarkId);
        let bookmark = BookmarkManager.getInstance().getBookmarkById(bookmarkId);
        if (bookmark) {
            atom.workspace.open(bookmark.filePath, {
                initialLine: bookmark.lineNumber,
                initialColumn: 0
            });
        }
    }
    getValueAt(row, col) {
        let bookmark = this.bookmarks[row];
        if (col === BookmarksModel.COL_RESOURCE) {
            return cliTruncate(bookmark.filePath, 20, { position: 'start' });
        }
        else if (col === BookmarksModel.COL_LINENO) {
            return (bookmark.lineNumber + 1);
        }
        else if (col === BookmarksModel.COL_ACTION) {
            return "-";
        }
        else {
            return "Unknown column";
        }
    }
    getTitleAt(row, col) {
        let bookmark = this.bookmarks[row];
        if (col === BookmarksModel.COL_RESOURCE) {
            return bookmark.filePath;
        }
        else if (col === BookmarksModel.COL_LINENO) {
            return (bookmark.lineNumber + 1);
        }
        else if (col === BookmarksModel.COL_ACTION) {
            return null;
        }
        else {
            return "Unknown column";
        }
    }
    getClassNameAt(row, col) {
        if (col === BookmarksModel.COL_LINENO) {
            return "de-workbench-bookmark-list-lineno";
        }
        else if (col === BookmarksModel.COL_ACTION) {
            return "de-workbench-bookmark-list-action";
        }
        return null;
    }
    getColumnName(col) {
        if (col === BookmarksModel.COL_RESOURCE) {
            return "Resource";
        }
        else if (col === BookmarksModel.COL_LINENO) {
            return "Line no.";
        }
        else if (col === BookmarksModel.COL_ACTION) {
            return "";
        }
    }
    getClassName() {
        return "";
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    destroy() {
        this.events.removeAllListeners();
    }
}
//# sourceMappingURL=BookmarksView.js.map