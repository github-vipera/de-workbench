'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

 import {
   createText,
   createElement,
   insertElement,
   createGroupButtons,
   createButton,
   createIcon,
   createIconFromPath,
   attachEventFromObject,
   createTextEditor
 } from '../../element/index';

import { EventBus } from '../../DEWorkbench/EventBus'
import { EventEmitter }  from 'events'
import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { UIPane } from '../../ui-components/UIPane'
import { UIListView, UIListViewModel } from '../../ui-components/UIListView'
import { Logger } from '../../logger/Logger'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { BookmarkManager, Bookmark } from '../../DEWorkbench/BookmarkManager'
import { UIExtendedListView, UIExtendedListViewModel, UIExtendedListViewValidationResult } from '../../ui-components/UIExtendedListView'
import { DEWorkbench } from '../../DEWorkbench/DEWorkbench'

const _ = require("lodash")
const cliTruncate = require('cli-truncate');

export class BookmarksView extends UIPane {

  listView:UIExtendedListView;
  model:UIExtendedListViewModel;

  constructor(params:any){
    super(params)
    console.log("BookmarksView creating for ",this.paneId);
  }

  protected createUI():HTMLElement {

    this.model = new BookmarksModel();
    this.listView = new UIExtendedListView(this.model);

    let el = createElement('div', {
        elements: [
          this.listView.element()
        ],
        className: 'de-workbench-bookmarks-view'
    });


    return el;
  }


  public destroy(){
    this.listView.destroy()
    this.model.destroy()
    this.listView = null;
    this.model = null;
    super.destroy();
  }

}

class BookmarksModel implements UIExtendedListViewModel {

  public static get COL_ACTION():number { return 0; }
  public static get COL_RESOURCE():number { return 1; }
  public static get COL_LINENO():number { return 2; }

  bookmarks:Array<Bookmark>
  events:EventEmitter;

  constructor(){
    this.events = new EventEmitter();
    this.bookmarks = BookmarkManager.getInstance().getBookmarks();

    EventBus.getInstance().subscribe(BookmarkManager.EVT_BOOKMARK_ADDED,(eventData)=>{
      this.onBookmarkAdded(eventData[0])
    })
    EventBus.getInstance().subscribe(BookmarkManager.EVT_BOOKMARK_REMOVED,(eventData)=>{
      this.onBookmarkRemoved(eventData[0])
    })
  }

  protected onBookmarkAdded(bookmark){
    this.events.emit('didModelChanged', this)
  }

  protected onBookmarkRemoved(bookmark){
    _.remove(this.bookmarks, {
        id: bookmark.id
    });
    this.events.emit('didModelChanged', this)
  }

  hasHeader():boolean{
    return true;
  }

  getRowCount():number {
    return this.bookmarks.length;
  }

  getColCount():number {
    return 3;
  }

  isCellEditable(row:number, col:number):boolean {
    return false;
  }

  onValueChanged(row:number, col:number, value:any){
  }

  onEditValidation(row:number, col:number, value:any):UIExtendedListViewValidationResult {
    return null;
  }


  getElementAt(row:number, col:number):HTMLElement {
    let bookmark:Bookmark = this.bookmarks[row];
    if (col===BookmarksModel.COL_RESOURCE){
      let el = createElement('a',{
        elements: [ createText(cliTruncate(bookmark.filePath, 50, {position: 'start'}))]
      })
      el.setAttribute('href','#')
      el.setAttribute('bookmark_id',bookmark.id)
      el.addEventListener('click',(evt)=>{
        this.onBookmarkClicked(evt.target.getAttribute('bookmark_id'));
      })
      return el;
    } else if (col===BookmarksModel.COL_LINENO) {
      let el = createElement('a',{
        elements: [ createText(""+(bookmark.lineNumber+1)) ]
      })
      return el;
    } else if (col===BookmarksModel.COL_ACTION) {
      let el = createElement('span',{
        elements: [ ],
        className: 'icon icon-remove-close'
      })
      el.setAttribute('bookmark_id',bookmark.id)
      el.addEventListener('click',(evt)=>{
        this.onBookmarkDeleteClicked(evt.target.getAttribute('bookmark_id'));
      })
      return el;
    }
  }

  protected onBookmarkDeleteClicked(bookmarkId:string){
    this.events.emit("onDidBookmarkDeleteClick", bookmarkId)
    let deleted = BookmarkManager.getInstance().deleteBookmarkById(bookmarkId);
    if (deleted){
      this.events.emit('didModelChanged', this)
    }
  }

  protected onBookmarkClicked(bookmarkId:string){
      this.events.emit("onDidBookmarkClick", bookmarkId)
      let bookmark = BookmarkManager.getInstance().getBookmarkById(bookmarkId);
      if (bookmark){
        atom.workspace.open(bookmark.filePath, {
                    initialLine: bookmark.lineNumber,
                    initialColumn: 0
                });
      }
  }

  getValueAt(row:number, col:number):any {
    let bookmark:Bookmark = this.bookmarks[row];
    if (col===BookmarksModel.COL_RESOURCE){
      return cliTruncate(bookmark.filePath, 20, {position: 'start'});
    } else if (col===BookmarksModel.COL_LINENO){
      return (bookmark.lineNumber+1)
    } else if (col===BookmarksModel.COL_ACTION){
      return "-"
    } else {
      return "Unknown column"
    }
  }

  getTitleAt(row:number, col:number):any {
    let bookmark:Bookmark = this.bookmarks[row];
    if (col===BookmarksModel.COL_RESOURCE){
      return bookmark.filePath;
    } else if (col===BookmarksModel.COL_LINENO){
      return (bookmark.lineNumber+1)
    } else if (col===BookmarksModel.COL_ACTION){
      return null
    } else {
      return "Unknown column"
    }
  }

  getClassNameAt(row:number, col:number):string{
    if (col===BookmarksModel.COL_LINENO){
      return "de-workbench-bookmark-list-lineno"
    }
    else if (col===BookmarksModel.COL_ACTION){
      return "de-workbench-bookmark-list-action"
    }
    return null;
  }

  getColumnName(col:number):string {
      if (col===BookmarksModel.COL_RESOURCE){
        return "Resource"
      } else if (col===BookmarksModel.COL_LINENO){
        return "Line no."
      } else if (col===BookmarksModel.COL_ACTION){
        return ""
      }
  }

  getClassName():string {
    return ""
  }

  addEventListener(event:string, listener){
    this.events.addListener(event, listener)
  }
  removeEventListener(event:string, listener){
    this.events.removeListener(event, listener)
  }

  destroy(){
    this.events.removeAllListeners();
  }

}
