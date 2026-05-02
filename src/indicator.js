import { fetchIPData, fetchVPNname } from './netInfo.js';
import { downloadMapTile } from './mapUtils.js';

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

        const iconEnabledFile = Gio.File.new_for_path(`${this._extension.path}/icons/vpn-caps-symbolic.svg`);
        const iconDisabledFile = Gio.File.new_for_path(`${this._extension.path}/icons/vpn-caps-disabled-symbolic.svg`);
        
        this._iconEnabled = Gio.FileIcon.new(iconEnabledFile);
        this._iconDisabled = Gio.FileIcon.new(iconDisabledFile);

        this.icon = new St.Icon({
            gicon: this._iconDisabled,
            style_class: 'system-status-icon netinfo-icon'
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
        this.titleItem = new PopupMenu.PopupMenuItem('NetInfo Gnome Extension V0.1')
        this.menu.addMenuItem(this.titleItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.ipMenuItem = new PopupMenu.PopupMenuItem('IP: Fetching...', { reactive: false });
        this.menu.addMenuItem(this.ipMenuItem);

        this.cityMenuItem = new PopupMenu.PopupMenuItem('City: ...', { reactive: false });
        this.menu.addMenuItem(this.cityMenuItem);

        this.ispMenuItem = new PopupMenu.PopupMenuItem('ISP: ...', { reactive: false });
        this.menu.addMenuItem(this.ispMenuItem);

        this.vpnMenuItem = new PopupMenu.PopupMenuItem('VPN: Checking...', { reactive: false });
        this.menu.addMenuItem(this.vpnMenuItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.mapTitle = new PopupMenu.PopupMenuItem('Geolocation:', { reactive: false });
        this.menu.addMenuItem(this.mapTitle);
        this.mapContainer = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false });
        this.mapBin = new St.Bin({
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            style: 'border-radius: 12px; width: 256px; height: 256px; margin: 10px; background-color: #333;'
        });
        
        this.mapContainer.add_child(this.mapBin);
        this.menu.addMenuItem(this.mapContainer);
    }
    
    async _updateMenuData() {
        try {  
            const ipData = await fetchIPData();
            const vpn = fetchVPNname();

            if (!this.label) return;

            if (vpn) {
                this.icon.gicon = this._iconEnabled;
                this.icon.remove_style_class_name('vpn-disabled');
                this.icon.add_style_class_name('vpn-enabled');
                this.vpnMenuItem.label.set_text(`VPN: ${vpn}`);
            } else {
                this.icon.gicon = this._iconDisabled;
                this.icon.remove_style_class_name('vpn-enabled');
                this.icon.add_style_class_name('vpn-disabled');
                this.vpnMenuItem.label.set_text('VPN: Disconnected');
            }

            if (ipData) {
                this.label.set_text(`- ${ipData.flag}`);
                this.ipMenuItem.label.set_text(`Public IP: ${ipData.flag} ${ipData.ip}`);
                this.cityMenuItem.label.set_text(`City: ${ipData.city || 'Unknown'}`);
                this.ispMenuItem.label.set_text(`ISP: ${ipData.isp || 'Unknown'}`);

                if (ipData.latitude && ipData.longitude) {
                    const cacheDir = this._extension.dir.get_child('cache').get_path();
                    const mapPath = await downloadMapTile(ipData.latitude, ipData.longitude, 12, cacheDir);

                    if (mapPath && this.mapBin) {
                        this.mapBin.style = `
                            border-radius: 12px;
                            width: 256px; 
                            height: 256px; 
                            margin: 10px;
                            background-image: url("file://${mapPath}");
                            background-size: cover;
                        `;
                    }
                }
            } else {
                this.label.set_text(' API Offline'); 
                this.ipMenuItem.label.set_text('Public IP: Not found');
                this.cityMenuItem.label.set_text('City: Not found');
                this.ispMenuItem.label.set_text('ISP: Not found');
            }

        } catch (e) {
            console.error(`[NetInfo] Update error: ${e.message}`);

            if (this.label) { 
                this.label.set_text(` Err: ${e.message}`);
            }
        }
    }

    destroy() {
        super.destroy();
    }
});