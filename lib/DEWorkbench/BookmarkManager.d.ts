/// <reference types="node" />
export interface Bookmark {
    lineNumber: number;
    filePath: string;
    marker: any;
    id: string;
}
import { EventEmitter } from 'events';
export declare type Bookmarks = Array<Bookmark>;
export declare class BookmarkManager {
    static readonly EVT_BOOKMARK_ADDED: string;
    static readonly EVT_BOOKMARK_REMOVED: string;
    private static instance;
    protected bookmarks: Bookmarks;
    protected events: EventEmitter;
    static getInstance(): BookmarkManager;
    private constructor();
    protected init(): void;
    getBookmarkById(bookmarkId: string): Bookmark;
    getBookmarks(): Bookmarks;
    reloadBookmarks(): Promise<any>;
    storeBookmarks(): Promise<any>;
    addFeatures(editor: any): Promise<void>;
    addBookmark(marker: any, lineNumber: number, filePath: string): Promise<Bookmark>;
    protected createBookmarkId(lineNumber: number, filePath: string): string;
    private createBookmarkMarkerForEditor(editor, lineNumber);
    getBookmarksFromFile(filePath: String): Bookmarks;
    private addBookmarkFromEvent(e, editor);
    removeBookmark(bookmark: Bookmark): Promise<boolean>;
    getBookmark(filePath: String, lineNumber: Number): Bookmark;
    deleteBookmarkById(bookmarkId: string): boolean;
}
