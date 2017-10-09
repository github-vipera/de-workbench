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

import { EventEmitter }  from 'events'
import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../cordova/Cordova'
import { UIListView, UIListViewModel } from '../../ui-components/UIListView'
import { Logger } from '../../logger/Logger'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { InstalledPluginsView } from './plugins/InstalledPluginsView'
import { InstallNewPluginsView } from './plugins/InstallNewPluginsView'
import { VariantsView } from './variants/VariantsView'
import { AppSignatureView } from './signature/AppSignatureView'
import { GeneralSettingsView } from './GeneralSettingsView'
import { UIPane } from '../../ui-components/UIPane'

const crypto = require('crypto');

export class ProjectSettingsView extends UIPane {

  private projectRoot: string;
  private projectId: string;
  private tabbedView: UITabbedView;

  // Sub views
  private installedPluginsView: InstalledPluginsView;
  private installNewPluginsView: InstallNewPluginsView;
  private variantsView: VariantsView;
  private appSignatureView: AppSignatureView;
  private generalSettingsView: GeneralSettingsView;

  constructor(uri:string){
    super(uri, "Project Settings");
  }

  private reloadProjectSettings(){
  }

  protected  createUI():HTMLElement{
    Logger.consoleLog("ProjectSettingsView initUI called.");

    // create the single views
    this.installedPluginsView = new InstalledPluginsView();
    this.installNewPluginsView = new InstallNewPluginsView();
    this.variantsView = new VariantsView();
    this.appSignatureView = new AppSignatureView();
    this.generalSettingsView = new GeneralSettingsView();

    // Create the main UI
    let element = document.createElement('de-workbench-project-settings')

    this.tabbedView = new UITabbedView();//.setTabType(UITabbedViewTabType.Horizontal);
    this.tabbedView.addView(new UITabbedViewItem('general',           'General',              this.generalSettingsView.element()).setTitleClass('icon icon-settings'));
    this.tabbedView.addView(new UITabbedViewItem('installed_plugins', 'Installed Plugins',    this.installedPluginsView.element()).setTitleClass('icon icon-plug'));
    this.tabbedView.addView(new UITabbedViewItem('install_plugins',   'Install New Plugins',  this.installNewPluginsView.element()).setTitleClass('icon icon-puzzle'));
    this.tabbedView.addView(new UITabbedViewItem('variants',          'Build Variants',       this.variantsView.element()).setTitleClass('icon icon-versions'));
    this.tabbedView.addView(new UITabbedViewItem('app_signature',     'App Signature',        this.appSignatureView.element()).setTitleClass('icon icon-shield'));

    let el = createElement('div', {
        elements: [
          this.tabbedView.element()
        ],
        className: 'de-workbench-project-settings-view'
    });
    insertElement(element, el)

    return element;
  }


  public destroy(){
    this.generalSettingsView.destroy();
    this.installedPluginsView.destroy();
    this.installNewPluginsView.destroy();
    this.variantsView.destroy();
    this.appSignatureView.destroy();
    this.tabbedView.destroy();
    this.element.remove();
  }

}
