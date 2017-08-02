'use babel'
export interface DEStorage {
  set(key:string, value):void
  setObject(key:string, value:Object):void
  get(key:string):string
  getObject(key:string):Object
  remove(key):void
  clear():void
  getLength():number
  printAllData():void
}

class DEStorageImpl implements DEStorage{
  localStorageObj:Object
  constructor(){
    this.localStorageObj = {}
  }

  set(key:string, value):void{
    this.localStorageObj[key] = value;
  }

  setObject(key:string, value:Object):void{
    this.set(key,JSON.stringify(value));
  }
  get(key:string):string{
    return this.localStorageObj[key];
  }
  getObject(key:string):Object{
    var rawValue = this.get(key);
    if(rawValue == 'undefined'){
      return undefined;
    }
    if(rawValue){
      return JSON.parse(rawValue);
    }
    return rawValue;
  }
  remove(key):void{
    delete this.localStorageObj[key];
  }
  clear():void{
    this.localStorageObj = {};
  }
  getLength():number{
    return Object.keys(this.localStorageObj).length
  }
  printAllData():void{
    Object.keys(this.localStorageObj).forEach((i:string) => {
      console.log(i + ": " + this.get(i));
    });
  }

}
export class DEStorageFactory {
  getDEStorage():DEStorage{
    return null;
  }
}
