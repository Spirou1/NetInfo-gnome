import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { NetInfoIndicator } from './src/indicator.js';

export default class NetInfoExtension extends Extension {
    enable() {
        console.debug(`[NetInfo] Enabling extension ${this.metadata.uuid}`);
        
        this._indicator = new NetInfoIndicator(this);
        
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        console.debug(`[NetInfo] Disabling extension ${this.metadata.uuid}`);
        
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}