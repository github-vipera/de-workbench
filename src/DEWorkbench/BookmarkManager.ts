'use babel'

import { ProjectManager } from './ProjectManager'

export interface Bookmark {
  lineNumber: number,
  filePath: string,
  marker: any,
  id:string
}
import { get } from 'lodash'
import { EventEmitter }  from 'events'
import { EventBus } from './EventBus'
const crypto = require('crypto');
const _ = require('lodash');

export type Bookmarks = Array<Bookmark>

export class BookmarkManager {

  public static get EVT_BOOKMARK_ADDED():string { return "dewb.workbench.bookmarks.bookmarkAdded" }
  public static get EVT_BOOKMARK_REMOVED():string { return "dewb.workbench.bookmarks.bookmarkRemoved" }

  private static instance: BookmarkManager;
  protected bookmarks:Bookmarks;
  protected events:EventEmitter;

  static getInstance() {
      if (!BookmarkManager.instance) {
          BookmarkManager.instance = new BookmarkManager();
      }
      return BookmarkManager.instance;
  }

  private constructor() {
    this.init();
  }

  protected init(){
    this.events = new EventEmitter();
    this.bookmarks = [];

    atom.workspace['observeActivePaneItem']((editor) => {
      if (editor) {
        this.addFeatures(editor)
      }
    })

    this.reloadBookmarks();
  }

  public getBookmarkById(bookmarkId:string):Bookmark{
    return  _.find(this.bookmarks, {id:bookmarkId});
  }

  public getBookmarks():Bookmarks {
    return this.bookmarks;
  }

  async reloadBookmarks():Promise<any>{
      //TODO!!
      this.bookmarks = [];
  }

  async storeBookmarks():Promise<any>{
      //TODO!!
  }

  async addFeatures (editor) {
    // restore bookmarks
    if (get(editor, 'getPath', false)) {
      let sourceFile = editor.getPath()
      let bookmarks = this.getBookmarksFromFile(sourceFile)
      bookmarks.forEach((bookmark: Bookmark) => {
        if (bookmark.marker) bookmark.marker.destroy()
        bookmark.marker = this.createBookmarkMarkerForEditor(editor, bookmark.lineNumber)
      })
      //this.currentEditor = editor
      if (get(editor, 'element.addEventListener', false)&&
        !get(editor, 'element.__dewbEnabledFeatures', false)) {
        let bookmarkHandler = (e) => {
          this.addBookmarkFromEvent(e, editor)
        }
        // add bookmark handler
        editor.element.__dewbEnabledFeatures = true
        editor.element.addEventListener('click', bookmarkHandler)
        editor.onDidDestroy(() => {
          editor.element.removeEventListener('click', bookmarkHandler)
        })
      }
    }
  }

  public async addBookmark(marker: any, lineNumber: number, filePath: string): Promise<Bookmark> {
    let id = this.createBookmarkId(lineNumber, filePath);
    let bookmark = {
        lineNumber,
        filePath,
        marker,
        id
      } as Bookmark
      this.bookmarks.push(bookmark);
      await this.storeBookmarks();
      return bookmark;
  }

  protected createBookmarkId(lineNumber: number, filePath: string){
    let base = "" + filePath +"_" + lineNumber;
    let hash = crypto.createHash('md5').update(base).digest("hex");
    return hash;
  }

  private createBookmarkMarkerForEditor (editor: any, lineNumber: any) {
    let range = [[lineNumber, 0], [lineNumber, 0]]
    let marker = editor.markBufferRange(range)
    let decorator = editor.decorateMarker(marker, {
      type: 'line-number',
      class: 'bookmarked dewb-bookmark' // dewb-bookmark'
    })
    return marker
  }

  getBookmarksFromFile(filePath: String): Bookmarks {
    return this.bookmarks.filter((item) => {
      return (item.filePath === filePath)
    })
  }



  private addBookmarkFromEvent (e: MouseEvent, editor: any) {
    let element = e.target as HTMLElement
    if (element.classList.contains('line-number') && e.shiftKey) {
      // toggle bookmark
      let lineNumber = Number(element.textContent) - 1
      if (lineNumber >= 0) {
        let sourceFile = editor.getPath()
        let exists = this.getBookmark(sourceFile, lineNumber)
        if (exists) {
          this.removeBookmark(exists)
        } else {
          let marker = this.createBookmarkMarkerForEditor(editor, lineNumber)
          this
            .addBookmark(marker, lineNumber, sourceFile)
            .then((bookmark) => {
              this.events.emit('didAddBookmark', sourceFile, lineNumber)
              EventBus.getInstance().publish(BookmarkManager.EVT_BOOKMARK_ADDED, bookmark);
            })
        }
        this.events.emit('didChange')
      }
    }
  }

  removeBookmark (bookmark: Bookmark): Promise<boolean> {
    return new Promise ((resolve, reject) => {
      let index = this.bookmarks.indexOf(bookmark)
      if(index != -1) {
        if (bookmark.marker) bookmark.marker.destroy()
      	this.bookmarks.splice(index, 1)
        EventBus.getInstance().publish(BookmarkManager.EVT_BOOKMARK_REMOVED, bookmark);
        return resolve(true)
      }
      return reject('Breakpoint does not exists')
    })
  }

  getBookmark (filePath: String, lineNumber: Number): Bookmark {
    let index = this.bookmarks.findIndex((item) => {
      return (item.filePath === filePath && item.lineNumber === lineNumber)
    })
    return this.bookmarks[index]
  }


}
