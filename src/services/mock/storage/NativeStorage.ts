'use babel'
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

  getItem(key:string,success:Function,fail:Function):void{

  }
  setItem(key:string,value,success:Function,fail:Function):void{

  }
  deleteItem(key:string,success:Function,fail:Function):void{

  }
  clear(success:Function,fail:Function):void{

  }
}

export class NativeStorageFactory {
  getNativeStorage(config:NativeStorageConfig):NativeStorage{
    return null;
  }
}
