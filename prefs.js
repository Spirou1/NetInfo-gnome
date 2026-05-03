import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class NetInfoPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings('org.gnome.shell.extensions.netinfo');
        const page = new Adw.PreferencesPage();
        const panelGroup = new Adw.PreferencesGroup({ title: 'Panel Options' });
        
        const flagRow = new Adw.SwitchRow({ title: 'Show Country Flag' });
        settings.bind('show-flag', flagRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        
        panelGroup.add(flagRow);

        const menuGroup = new Adw.PreferencesGroup({ title: 'Menu Options' });
        
        const graphRow = new Adw.SwitchRow({ title: 'Show Traffic Graph' });
        settings.bind('show-graph', graphRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        const mapRow = new Adw.SwitchRow({ title: 'Show Geolocation Map' });
        settings.bind('show-map', mapRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        const ispRow = new Adw.SwitchRow({ title: 'Show ISP Info' });
        settings.bind('show-isp', ispRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        menuGroup.add(graphRow);
        menuGroup.add(mapRow);
        menuGroup.add(ispRow);

        page.add(panelGroup);
        page.add(menuGroup);
        window.add(page);
    }
}