'use babel'

import { EventEmitter }  from 'events'

const {
    allowUnsafeEval,
    allowUnsafeNewFunction
} = require('loophole');

const trivialdb = require('trivialdb');
const fs = require('fs')
const path = require('path')

export class ProjectSettings  {

  private projectRoot:string;
  private db:any;

  constructor(projectRoot:string){
      this.projectRoot = projectRoot;
      this.db = trivialdb.db('project_settings', { loadFromDisk: true, rootPath: this.getProjectInfoFilePath(this.projectRoot), prettyPrint:true });
  }

  public getProjectRoot():string {
    return this.projectRoot;
  }

  public getProjectInfoFilePath(projectPath:string){
      return path.join(projectPath,'.deworkbench')
  }

  public load():Promise<ProjectSettings>{
    return new Promise((resolve,reject)=>{
      this.db.reload().then(()=>{
        resolve(this);
      });
    })
  }

  public get(key:string){
    return this.db.get(key);
  }

  public save(key:string, value:any){
    return this.db.save(key, value);
  }

}