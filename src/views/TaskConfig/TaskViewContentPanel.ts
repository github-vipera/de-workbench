'use babel'
import {
  createText,
  createElement,
  insertElement,
  createButton,
  createIcon,
  attachEventFromObject,
  createSelect,
  createInput
} from '../../element/index';
import { UIBaseComponent } from '../../ui-components/UIComponent'
import { CordovaTaskConfiguration, TaskConstraints } from '../../cordova/CordovaTasks'
import { CordovaPlatform, CordovaProjectInfo } from '../../cordova/Cordova'
import { UIInputFormElement } from '../../ui-components/UIInputFormElement'
import { Variant, VariantsManager } from '../../DEWorkbench/VariantsManager'
import { EventEmitter }  from 'events'
import { CordovaDeviceManager, CordovaDevice } from '../../cordova/CordovaDeviceManager'
import { UISelect, UISelectItem, UISelectListener } from '../../ui-components/UISelect'
import { UILineLoader } from '../../ui-components/UILineLoader'
import { map } from 'lodash'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'

const NONE_PLACEHOLDER:string = '-- None --';

export class TaskViewContentPanel extends UIBaseComponent{
  private taskConfig:CordovaTaskConfiguration
  private projectInfo:CordovaProjectInfo
  private taskNameEl:UIInputFormElement;
  private deviceManager:CordovaDeviceManager;
  private variantManager:VariantsManager;
  private platformSelect:UISelect;
  private platformSelectListener:UISelectListener;
  private deviceSelect:UISelect;
  private variantSelect:UISelect;
  private npmScriptsSelect:UISelect;
  private deviceLineLoader: UILineLoader;
  private variantsLineLoader: UILineLoader;
  private isReleaseEl:HTMLElement
  private evtEmitter:EventEmitter
  private tabbedView:UITabbedView
  constructor(evtEmitter:EventEmitter){
    super();
    this.evtEmitter = evtEmitter;
    this.initUI();
  }

  private initUI(){
    this.mainElement = createElement('atom-panel',{
      className:'de-workbench-taskpanel-content',
      elements:[
      ]
    });
    this.initTabView();
    this.initGeneralTabUI();
    this.initEnvironmentTabUI();
  }

  private initTabView(){
    this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
    insertElement(this.mainElement,this.tabbedView.element());
  }

  private initGeneralTabUI(){
    let panelContainer:HTMLElement = createElement('div',{
      className:'de-workbench-taskpanel-content-container',
      elements:[
      ]
    });
    panelContainer.classList.add('form-container');
    this.createTaskNameEl(panelContainer);
    this.createPlatformSelect(panelContainer);
    this.createDeviceSelect(panelContainer);
    this.createReleaseCheckbox(panelContainer);
    this.createVariantSelect(panelContainer);
    this.createNodeTaskSelect(panelContainer);
    this.tabbedView.addView(new UITabbedViewItem('GeneralPanel',"General",panelContainer));
  }

  private initEnvironmentTabUI(){
    let panelContainer:HTMLElement = createElement('div',{
      className:'de-workbench-taskpanel-content-container',
      elements:[
      ]
    });
    this.tabbedView.addView(new UITabbedViewItem('EnvironmentPanel',"Environment",panelContainer));
  }

  private createTaskNameEl(panelContainer:HTMLElement){
    this.taskNameEl = new UIInputFormElement().setCaption('Task name').setPlaceholder('Your task name').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
      if(this.taskConfig){
        this.taskConfig.name = this.taskNameEl.getValue();
        this.evtEmitter.emit('didChangeName',this.taskConfig.name);
      }
    });
    insertElement(panelContainer,this.taskNameEl.element());
  }

  private createPlatformSelect(panelContainer:HTMLElement){
    this.platformSelect = new UISelect();
    this.platformSelectListener = {
      onItemSelected:() => {
        this.updateDevices(this.getSelectedPlatform());
      }
    };
    this.platformSelect.addSelectListener(this.platformSelectListener);
    let row=this.createFormRow(createText('Platform'),this.platformSelect.element(),'platforms');
    insertElement(panelContainer,row);
  }

  private createVariantSelect(panelContainer:HTMLElement){
    this.variantsLineLoader= new UILineLoader();
    this.variantSelect = new UISelect();
    let wrapper=createElement('div',{
      className:'line-loader-wrapper',
      elements:[
        this.variantSelect.element(),
        this.variantsLineLoader.element()
      ]
    });
    let row=this.createFormRow(createText('Variant'),wrapper,'variants');
    insertElement(panelContainer,row);
  }

  private createNodeTaskSelect(panelContainer:HTMLElement){
    this.npmScriptsSelect = new UISelect();
    let row=this.createFormRow(createText('Npm scripts (before task)'),this.npmScriptsSelect.element(),'npmScript');
    insertElement(panelContainer,row);
  }

  private createDeviceSelect(panelContainer:HTMLElement){
    this.deviceSelect = new UISelect();
    this.deviceLineLoader= new UILineLoader();
    let wrapper=createElement('div',{
      className:'line-loader-wrapper',
      elements:[
        this.deviceSelect.element(),
        this.deviceLineLoader.element()
      ]
    });
    let row=this.createFormRow(createText('Device / Emulator'),wrapper,'devices');
    insertElement(panelContainer,row);
  }

  private createReleaseCheckbox(panelContainer:HTMLElement){
    this.isReleaseEl = createInput({
      type:'checkbox'
    });
    this.isReleaseEl.classList.remove('form-control');
    this.isReleaseEl.setAttribute('name','release');
    let label:HTMLElement= createElement('label',{
      className:"label-for"
    });
    label.innerText = 'Release'
    label.setAttribute('for','release');
    let row= this.createFormRow(label,this.isReleaseEl,'isRelease')
    insertElement(panelContainer,row);
  }

  private updateTaskName(){
    this.taskNameEl.setValue(this.taskConfig.name);
  }

  private updatePlatforms(){
    let platforms:Array<CordovaPlatform> = this.projectInfo? this.projectInfo.platforms: [];
    let model:Array<UISelectItem> = map <CordovaPlatform,UISelectItem> (platforms, (single:CordovaPlatform) => {
      return {
        value:single.name,
        name:single.name
      };
    });
    this.platformSelect.setItems(model)
  }

  private updateNodeScripts(){
    let npmScripts:Array<string> = this.projectInfo ? this.projectInfo.npmScripts : [];
    let model:Array<UISelectItem> = map<any,UISelectItem>(npmScripts,(value:string ,key:string) => {
      return {
        name:key,
        value:key
      }
    });
    model.unshift({
      name: NONE_PLACEHOLDER,
      value:''
    })
    this.npmScriptsSelect.setItems(model);
  }

  private async updateDevices(platform:CordovaPlatform){
    if(!this.deviceManager || !platform){
      return Promise.resolve([]);
    }
    this.deviceLineLoader.setOnLoading(true);
    let devices= await this.deviceManager.getDeviceList(platform.name);
    let model:Array<UISelectItem> = map<CordovaDevice,UISelectItem>(devices,(single:CordovaDevice) => {
      return {
        value:single.targetId,
        name:single.name
      }
    });
    this.deviceSelect.setItems(model)
    this.deviceLineLoader.setOnLoading(false);
  }

  private async updateVariants(){
    if(!this.variantManager){
      return Promise.reject('INVALID_VARIANT_MANAGER');
    }
    this.variantsLineLoader.setOnLoading(true);
    let variantModel = await this.variantManager.load();
    let model:Array<UISelectItem> = map<Variant,UISelectItem>(variantModel.variants,(variant:Variant) => {
      return {
        value:variant.name,
        name:variant.name
      }
    });
    model.unshift({
      value:'',
      name: NONE_PLACEHOLDER
    });
    this.variantSelect.setItems(model);
    this.variantsLineLoader.setOnLoading(false);
  }

  private createRowId(elementId:string):string{
    return "row-" + elementId;
  }

  private createFormRow(text: HTMLElement | Text,element:HTMLElement,rowId?:string):HTMLElement{
    let row=createElement('div',{
      className:'control-row',
      id: this.createRowId(rowId || element.id),
      elements:[
        text,
        element]
    });
    return row;
  }

  contextualize(taskConfig:CordovaTaskConfiguration,projectInfo:CordovaProjectInfo){
    if(!taskConfig){
      return;
    }
    this.taskConfig = taskConfig;
    this.projectInfo = projectInfo;
    if(!this.deviceManager){
      this.deviceManager = new CordovaDeviceManager(this.projectInfo.path);
    }
    if(!this.variantManager){
      this.variantManager = new VariantsManager(this.projectInfo.path);
    }
    setTimeout(() => {
      this.contextualizeImpl();
    });
  }

  private setRowVisible(rowId:string,visible:boolean){
    var el = document.getElementById(rowId);
    if(el && el.style){
      el.style.display = visible? 'block' : 'none';
    }
  }
  private setElementVisible(el:HTMLElement,visible:boolean){
    if(el && el.style){
      el.style.display = visible? 'block' : 'none';
    }
  }

  private contextualizeImpl(){
    if(!this.getSelectedPlatform()){
      this.updatePlatforms();
    }
    this.applyConstraintsToView(this.taskConfig.constraints);
  }

  private applyConstraintsToView(constraints:TaskConstraints){
      if(constraints.isDeviceEnabled){
        this.updateDevices(this.getSelectedPlatform());
      }
      this.setRowVisible(this.createRowId('devices'),constraints.isDeviceEnabled);

      if(constraints.isVariantEnabled){
        this.updateVariants();
      }
      this.setRowVisible(this.createRowId('variants'),constraints.isVariantEnabled);

      if(constraints.isNodeTaskEnabled){
        this.updateNodeScripts();
      }
      this.setRowVisible(this.createRowId('npmScript'),constraints.isNodeTaskEnabled);

      if(constraints.isCustom){
        this.updateTaskName();
      }
      this.setElementVisible(this.taskNameEl.element(),constraints.isCustom);
  }

  public resetContext():void{
    this.taskNameEl.setValue('');
    this.platformSelect.setItems([]);
    this.deviceSelect.setItems([]);
    this.variantSelect.setItems([]);
    this.npmScriptsSelect.setItems([]);
  }


  private getSelectedPlatform():CordovaPlatform{
    let platformValue = this.platformSelect.getSelectedItem();
    if(platformValue){
      return { name:platformValue };
    }
    return null;
  }

  private getSelectedDevice():CordovaDevice {
    let value= this.deviceSelect.getSelectedItem();
    if(value){
      return {
        targetId:value,
        name:value
      }
    }
    return null;
  }

  private getSelectedVariantName():string{
    let value = this.variantSelect.getSelectedItem()
    return value || null;
  }

  private getSelectedNpmScript():string {
    let value = this.npmScriptsSelect.getSelectedItem();
    return value || null;
  }

  getCurrentConfiguration():CordovaTaskConfiguration{
    console.log("getCurrentConfiguration");
    let platformValue = this.platformSelect.getSelectedItem();
    if(platformValue){
      this.taskConfig.selectedPlatform = {name:platformValue};
    }
    let device = this.deviceSelect.getSelectedItem();
    if(device){
      this.taskConfig.device = {
        targetId: device,
        name:device
      };
    }
    let release = this.isReleaseEl['checked'];
    if(release){
      this.taskConfig.isRelease = true
    }
    let variant = this.getSelectedVariantName();
    if(variant){
      this.taskConfig.variantName = variant;
    }
    let nodeScript = this.getSelectedNpmScript();
    if(nodeScript){
      this.taskConfig.nodeTasks = [nodeScript];
    }
    return this.taskConfig;


  }
}
