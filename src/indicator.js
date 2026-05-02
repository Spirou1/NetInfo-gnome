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
        this.mainBox = new St.BoxLayout({
            vertical: true,
            style_class: 'netinfo-menu-content'
        });

        this.topSection = new St.BoxLayout({
            style_class: 'netinfo-top-section',
            x_expand: true
        });

        this.infoBox = new St.BoxLayout({
            vertical: true,
            style_class: 'netinfo-info-box',
            x_expand: true
        });

        this.titleLabel = new St.Label({
            text: 'Network Information',
            style_class: 'netinfo-label-title'
        });
        this.infoBox.add_child(this.titleLabel);

        this.ipLabel = new St.Label({ text: 'IP: Fetching...' });
        this.cityLabel = new St.Label({ text: 'City: ...' });
        this.ispLabel = new St.Label({ text: 'ISP: ...' });
        this.vpnLabel = new St.Label({ text: 'VPN: Checking...' });

        this.infoBox.add_child(this.ipLabel);
        this.infoBox.add_child(this.cityLabel);
        this.infoBox.add_child(this.ispLabel);
        this.infoBox.add_child(this.vpnLabel);

        this.topSection.add_child(this.infoBox);
        
        this.mainBox.add_child(this.topSection);

        // Separator
        this.mainBox.add_child(new PopupMenu.PopupSeparatorMenuItem().actor);

        // Map Section
        this.mapTitle = new St.Label({
            text: 'Geolocation',
            style_class: 'netinfo-label-title',
            style: 'margin-top: 10px; margin-bottom: 5px;'
        });
        this.mainBox.add_child(this.mapTitle);

        this.mapBin = new St.Bin({
            style_class: 'netinfo-map-bin',
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER
        });
        
        this.mainBox.add_child(this.mapBin);

        this.menuItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        this.menuItem.add_child(this.mainBox);
        this.menu.addMenuItem(this.menuItem);
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
                this.vpnLabel.set_text(`VPN: ${vpn}`);
            } else {
                this.icon.gicon = this._iconDisabled;
                this.icon.remove_style_class_name('vpn-enabled');
                this.icon.add_style_class_name('vpn-disabled');
                this.vpnLabel.set_text('VPN: Disconnected');
            }

            if (ipData) {
                this.label.set_text(`- ${ipData.flag}`);
                this.ipLabel.set_text(`Public IP: ${ipData.flag} ${ipData.ip}`);
                this.cityLabel.set_text(`City: ${ipData.city || 'Unknown'}`);
                this.ispLabel.set_text(`ISP: ${ipData.isp || 'Unknown'}`);

                if (ipData.latitude && ipData.longitude) {
                    const cacheDir = this._extension.dir.get_child('cache').get_path();
                    const mapPath = await downloadMapTile(ipData.latitude, ipData.longitude, 13, cacheDir);

                    if (mapPath && this.mapBin) {
                        this.mapBin.style = `
                            background-image: url("file://${mapPath}");
                            background-size: cover;
                            background-position: center;
                        `;
                    }
                }
            } else {
                this.label.set_text(' API Offline'); 
                this.ipLabel.set_text('Public IP: Not found');
                this.cityLabel.set_text('City: Not found');
                this.ispLabel.set_text('ISP: Not found');
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