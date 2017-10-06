/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class UIModalPrompt {
    container: HTMLElement;
    events: EventEmitter;
    inputEl: HTMLElement;
    placeholder: string;
    value: string;
    panel: any;
    onConfirmCallback: Function;
    onCancelCallback: Function;
    subscriptions: any;
    constructor();
    protected createEditor(value: any, placeholder: any): any;
    addEventListener(event: string, listener: any): void;
    removeEventListener(event: string, listener: any): void;
    destroy(): void;
    show(value: string, placeholder: string, onConfirmCallback: Function, onCancelCallback: Function): void;
    protected doConfirm(): void;
    protected doCancel(): void;
    protected closePanel(): void;
}
