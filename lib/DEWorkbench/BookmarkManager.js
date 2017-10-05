'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get } from 'lodash';
import { EventEmitter } from 'events';
import { EventBus } from './EventBus';
const GUID = require('guid');
const _ = require('lodash');
export class BookmarkManager {
    static get EVT_BOOKMARK_ADDED() { return "dewb.workbench.bookmarks.bookmarkAdded"; }
    static get EVT_BOOKMARK_REMOVED() { return "dewb.workbench.bookmarks.bookmarkRemoved"; }
    static getInstance() {
        if (!BookmarkManager.instance) {
            BookmarkManager.instance = new BookmarkManager();
        }
        return BookmarkManager.instance;
    }
    constructor() {
        this.init();
    }
    init() {
        this.events = new EventEmitter();
        this.bookmarks = [];
        atom.workspace['observeActivePaneItem']((editor) => {
            if (editor) {
                this.addFeatures(editor);
            }
        });
        this.reloadBookmarks();
    }
    getBookmarkById(bookmarkId) {
        return _.find(this.bookmarks, { id: bookmarkId });
    }
    getBookmarks() {
        return this.bookmarks;
    }
    reloadBookmarks() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bookmarks = [];
        });
    }
    storeBookmarks() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    addFeatures(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (get(editor, 'getPath', false)) {
                let sourceFile = editor.getPath();
                let bookmarks = this.getBookmarksFromFile(sourceFile);
                bookmarks.forEach((bookmark) => {
                    if (bookmark.marker)
                        bookmark.marker.destroy();
                    bookmark.marker = this.createBookmarkMarkerForEditor(editor, bookmark.lineNumber);
                });
                if (get(editor, 'element.addEventListener', false) &&
                    !get(editor, 'element.__dewbEnabledFeatures', false)) {
                    let bookmarkHandler = (e) => {
                        this.addBookmarkFromEvent(e, editor);
                    };
                    editor.element.__dewbEnabledFeatures = true;
                    editor.element.addEventListener('click', bookmarkHandler);
                    editor.onDidDestroy(() => {
                        editor.element.removeEventListener('click', bookmarkHandler);
                    });
                }
            }
        });
    }
    addBookmark(marker, lineNumber, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.createBookmarkId(lineNumber, filePath);
            let bookmark = {
                lineNumber,
                filePath,
                marker,
                id
            };
            this.bookmarks.push(bookmark);
            yield this.storeBookmarks();
            return bookmark;
        });
    }
    createBookmarkId(lineNumber, filePath) {
        return GUID.raw();
    }
    createBookmarkMarkerForEditor(editor, lineNumber) {
        let range = [[lineNumber, 0], [lineNumber, 0]];
        let marker = editor.markBufferRange(range);
        let decorator = editor.decorateMarker(marker, {
            type: 'line-number',
            class: 'bookmarked dewb-bookmark'
        });
        return marker;
    }
    getBookmarksFromFile(filePath) {
        return this.bookmarks.filter((item) => {
            return (item.filePath === filePath);
        });
    }
    addBookmarkFromEvent(e, editor) {
        let element = e.target;
        if (element.classList.contains('line-number') && e.shiftKey) {
            let lineNumber = Number(element.textContent) - 1;
            if (lineNumber >= 0) {
                let sourceFile = editor.getPath();
                let exists = this.getBookmark(sourceFile, lineNumber);
                if (exists) {
                    this.removeBookmark(exists);
                }
                else {
                    let marker = this.createBookmarkMarkerForEditor(editor, lineNumber);
                    this
                        .addBookmark(marker, lineNumber, sourceFile)
                        .then((bookmark) => {
                        this.events.emit('didAddBookmark', sourceFile, lineNumber);
                        EventBus.getInstance().publish(BookmarkManager.EVT_BOOKMARK_ADDED, bookmark);
                    });
                }
                this.events.emit('didChange');
            }
        }
    }
    removeBookmark(bookmark) {
        return new Promise((resolve, reject) => {
            let index = this.bookmarks.indexOf(bookmark);
            if (index != -1) {
                if (bookmark.marker)
                    bookmark.marker.destroy();
                this.bookmarks.splice(index, 1);
                EventBus.getInstance().publish(BookmarkManager.EVT_BOOKMARK_REMOVED, bookmark);
                return resolve(true);
            }
            return reject('Breakpoint does not exists');
        });
    }
    getBookmark(filePath, lineNumber) {
        let index = this.bookmarks.findIndex((item) => {
            return (item.filePath === filePath && item.lineNumber === lineNumber);
        });
        return this.bookmarks[index];
    }
    deleteBookmarkById(bookmarkId) {
        let beforeLen = this.bookmarks.length;
        let bookmark = this.getBookmarkById(bookmarkId);
        this.removeBookmark(bookmark);
        let afterLen = this.bookmarks.length;
        return (beforeLen > afterLen);
    }
}
//# sourceMappingURL=BookmarkManager.js.map