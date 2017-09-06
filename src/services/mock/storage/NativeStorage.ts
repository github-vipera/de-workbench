'use babel'
import {InitOptions} from 'node-persist'
import {initSync, getItem, setItem, removeItem, clear} from 'node-persist'
export interface NativeStorage{
  getItem(key:string,success:Function,fail:Function):void
  setItem(key:string,value,success:Function,fail:Function):void
  deleteItem(key:string,success:Function,fail:Function):void
  clear(success:Function,fail:Function):void
}

export class NativeStorageConfig{
  public dbPath:string
}

class NativeStorageImp implements NativeStorage{

  constructor(conf:NativeStorageConfig){
    initSync({
        dir: conf.dbPath,
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        logging: false,  // can also be custom logging function
        continuous: true, // continously persist to disk
        interval: false, // milliseconds, persist to disk on an interval
        ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
    });
  }

  getItem(key:string,success:Function,fail:Function):void{
    getItem(key).then((value) => {
          if(value){
            success(value)
          }else{
            success(null)
          }
        },(err) => {
          console.error(err);
          success(null);
      });
  }
  setItem(key:string,value,success:Function,fail:Function):void{

  }
  deleteItem(key:string,success:Function,fail:Function):void{
    removeItem(key).then(() => {
      success();
    }, (err) => {
      console.error(err);
      fail(err);
    })
  }
  clear(success:Function,fail:Function):void{
    clear().then(() => {
      success();
    }, (err) => {
      fail(err)
    });
  }
}

export class NativeStorageFactory {
  getNativeStorage(config:NativeStorageConfig):NativeStorage{
    return new NativeStorageImp(config);
  }
}
