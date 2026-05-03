import { fetchIPData, fetchVPNname } from './netInfo.js';
import { downloadMapTile } from './mapUtils.js';
import { SpeedMeter } from './speedMeter.js';

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
        this._settings = this._extension.getSettings('org.gnome.shell.extensions.netinfo');
        
        this._settingsSignal = this._settings.connect('changed', this._applyLiveSettings.bind(this));

        this._speedMeter = new SpeedMeter();

        this.box = new St.BoxLayout({
            style_class: 'panel-button-content'
        });

        const iconEnabledFile = Gio.File.new_for_path(`${this._extension.path}/icons/vpn-caps-symbolic.svg`);
        const iconDisabledFile = Gio.File.new_for_path(`${this._extension.path}/icons/vpn-caps-disabled-symbolic.svg`);
        const iconSettingsFile = Gio.File.new_for_path(`${this._extension.path}/icons/settings-symbolic.svg`);
        
        this._iconSettings = Gio.FileIcon.new(iconSettingsFile);
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
        this._speedMeter.start();
    }

    // --- ALTERAÇÃO 2: Nova função que esconde ou mostra os elementos na hora ---
    _applyLiveSettings() {
        if (this._settings.get_boolean('show-graph')) {
            this.trafficColumn.show();
        } else {
            this.trafficColumn.hide();
        }

        if (this._settings.get_boolean('show-map')) {
            this.mapTitle.show();
            this.mapBin.show();
        } else {
            this.mapTitle.hide();
            this.mapBin.hide();
        }

        if (this._settings.get_boolean('show-isp')) {
            this.ispLabel.show();
        } else {
            this.ispLabel.hide();
        }

        if (this._lastIpData) {
            if (this._settings.get_boolean('show-flag')) {
                this.label.set_text(`- ${this._lastIpData.flag}`);
            } else {
                this.label.set_text('');
            }
        }
    }

    _buildMenu() {
        this.mainBox = new St.BoxLayout({
            vertical: true,
            style_class: 'netinfo-menu-content'
        });

        this.headerBox = new St.BoxLayout({
            vertical: false,
            x_expand: true,
            y_expand: false, 
            y_align: Clutter.ActorAlign.CENTER,
            style: 'margin-bottom: 10px;'
        });

        this.mainTitle = new St.Label({
            text: 'NetInfo Gnome Extension V0.1',
            style_class: 'netinfo-main-title',
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            style: 'border-bottom: 0px; margin-bottom: 0px; padding-bottom: 0px;' 
        });

        this.settingsButton = new St.Button({
            child: new St.Icon({
                gicon: this._iconSettings, 
                icon_size: 20,
                style_class: 'system-status-icon'
            }),
            style_class: 'settings-button', 
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.END,
            can_focus: true,
            track_hover: true
        });

        this.settingsButton.connect('clicked', () => {
            this._extension.openPreferences();
            this.menu.close();
        });

        this.headerBox.add_child(this.mainTitle);
        this.headerBox.add_child(this.settingsButton);

        this.mainBox.add_child(this.headerBox);
        
        this.mainBox.add_child(new PopupMenu.PopupSeparatorMenuItem().actor);

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

        this.ipLabel = new St.Label({ 
            text: 'IP: Fetching...',
            style_class: 'labels-text text-truncate'
        });

        this.cityLabel = new St.Label({ 
            text: 'City: ...',
            style_class: 'labels-text text-truncate'
        });

        this.ispLabel = new St.Label({ 
            text: 'ISP: ...',
            style_class: 'labels-text text-truncate' 
        });

        this.vpnLabel = new St.Label({ 
            text: 'VPN: Checking...',
            style_class: 'labels-text text-truncate' 
        });

        this.timezoneLabel = new St.Label({ 
            text: 'Timezone: Checking...',
            style_class: 'labels-text text-truncate' 
        });

        // --- ALTERAÇÃO 3: Removida a re-declaração duplicada da infoBox e do graphContainer ---
        this.infoBox.add_child(this.ipLabel);
        this.infoBox.add_child(this.cityLabel);
        this.infoBox.add_child(this.ispLabel);
        this.infoBox.add_child(this.vpnLabel);
        this.infoBox.add_child(this.timezoneLabel);

        this.trafficColumn = new St.BoxLayout({
            vertical: true,
            x_expand: true
        });

        this.graphTitleLabel = new St.Label({
            text: 'Traffic:',
            style_class: 'netinfo-label-title'
        });

        this.graphContainer = new St.BoxLayout({
            style_class: 'graph-container',
            vertical: true, 
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true 
        });

        let speedLabel = this._speedMeter.getWidget();
        speedLabel.add_style_class_name('labels-text');
        
        let speedGraph = this._speedMeter.getGraphWidget();

        this.graphContainer.add_child(speedLabel);           
        this.graphContainer.add_child(speedGraph);          

        this.trafficColumn.add_child(this.graphTitleLabel);
        this.trafficColumn.add_child(this.graphContainer);

        this.topSection.add_child(this.infoBox);
        this.topSection.add_child(this.trafficColumn);

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

        this.infoLabel = new St.Label({ 
            text: 'For more info, check out the repo at: github.com/Spirou1/NetInfo-gnome',
            style_class: 'info-text',
            x_expand: true,
            x_align: Clutter.ActorAlign.END
        });
        this.mainBox.add_child(this.infoLabel)

        this.menuItem.add_child(this.mainBox);
        this.menu.addMenuItem(this.menuItem);

        // --- ALTERAÇÃO 4: Aplica as configurações na interface recém-construída ---
        this._applyLiveSettings();
    }
    
    async _updateMenuData() {
        try {  
            const ipData = await fetchIPData();
            const vpn = fetchVPNname();

            // --- ALTERAÇÃO 5: Salva a API na classe para que a bandeira seja trocada sem requisição ---
            this._lastIpData = ipData;

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
                this.ipLabel.set_text(`Public IP: ${ipData.flag} - ${ipData.ip}`);
                this.cityLabel.set_text(`City: ${ipData.city || 'Unknown'}`);
                this.ispLabel.set_text(`ISP: ${ipData.isp || 'Unknown'}`);
                this.timezoneLabel.set_text(`Timezone: ${ipData.timezone || 'Unknown'}`);

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

                // --- ALTERAÇÃO 6: Garante que as labels recém-atualizadas sigam as regras do settings ---
                this._applyLiveSettings();

            } else {
                this.label.set_text(' API Offline'); 
                this.ipLabel.set_text('Public IP: Not found');
                this.cityLabel.set_text('City: Not found');
                this.ispLabel.set_text('ISP: Not found');
                this.timezoneLabel.set_text('Timezone: Not found');
            }

        } catch (e) {
            console.error(`[NetInfo] Update error: ${e.message}`);

            if (this.label) { 
                this.label.set_text(` Err: ${e.message}`);
            }
        }
    }

    destroy() {
        // --- ALTERAÇÃO 7: Desconecta o sinal para não vazar memória ---
        if (this._settingsSignal) {
            this._settings.disconnect(this._settingsSignal);
            this._settingsSignal = null;
        }

        if (this._speedMeter) {
            this._speedMeter.stop();
            this._speedMeter = null;
        }
        super.destroy();
    }
});