'use babel'
import {PlatformServer,PlatformServerImpl} from './PlatformServer'
export class BrowserPlatformServer extends PlatformServerImpl{
  constructor(){
    super();
  }
  protected initExpressStaticServe(){
    //NOP: in browser platform assets are already published from embedded server
  }

  
}
