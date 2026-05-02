import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';


export const NetInfoIndicator = GObject.registerClass(
class NetInfoIndicator extends PanelMenu.Button {
    

    _init(extensionObject) {

        super._init(0.0, 'NetInfoIndicator');
        
        this._extension = extensionObject;

        this.box = new St.BoxLayout({
            style_class: 'panel-button-content'
        });

        this.icon = new St.Icon({
            icon_name: 'network-wired-symbolic',
            style_class: 'system-status-icon'
        });

        this.label = new St.Label({
            text: ' NetInfo Ready',
            y_align: Clutter.ActorAlign.CENTER
        });

        this.box.add_child(this.icon);
        this.box.add_child(this.label);
        this.add_child(this.box);
    }
    
    destroy() {
        super.destroy();
    }
});