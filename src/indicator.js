import { fetchPublicIP, fetchVPNname } from './netInfo.js';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export const NetInfoIndicator = GObject.registerClass(
class NetInfoIndicator extends PanelMenu.Button {
    
    _init(extensionObject) {
        super._init(0.0, 'NetInfoIndicator', false);
        
        this._extension = extensionObject;

        this.box = new St.BoxLayout({
            style_class: 'panel-button-content'
        });

        this.icon = new St.Icon({
            icon_name: 'network-wired-symbolic',
            style_class: 'system-status-icon'
        });

        this.label = new St.Label({
            text: ' Fetching IP...',
            y_align: Clutter.ActorAlign.CENTER
        });

        this.box.add_child(this.icon);
        this.box.add_child(this.label);
        this.add_child(this.box);

        this._buildMenu();
        this._updateMenuData();
    }

    _buildMenu() {
        this.ipMenuItem = new PopupMenu.PopupMenuItem('IP: Fetching...', { reactive: false });
        this.menu.addMenuItem(this.ipMenuItem);

        this.vpnMenuItem = new PopupMenu.PopupMenuItem('VPN: Checking...', { reactive: false });
        this.menu.addMenuItem(this.vpnMenuItem);
    }
    
    async _updateMenuData() {
        try {  
            const ip = await fetchPublicIP();
            const vpn = fetchVPNname();

            if (ip) {
                this.label.set_text(` ${ip}`);
                this.ipMenuItem.label.set_text(`Public IP: ${ip}`);
            } else {
                this.ipMenuItem.label.set_text('Public IP: Not found');
            }

            if (vpn) {
                this.vpnMenuItem.label.set_text(`VPN: ${vpn}`);
            } else {
                this.vpnMenuItem.label.set_text('VPN: Disconnected');
            }

        } catch (e) {
            console.error(`[NetInfo] Update error: ${e.message}`);
            console.error(e.stack); 
            this.label.set_text(' Error');
        }
    }

    destroy() {
        super.destroy();
    }
});