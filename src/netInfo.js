import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Soup from "gi://Soup";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

const _session = new Soup.Session();

export async function fetchIPData() {
  const message = Soup.Message.new("GET", "https://ipwho.is/");

  try {
    const bytes = await _session.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
    );

    if (message.status_code !== Soup.Status.OK) {
      console.error(`[NetInfo] HTTP Error: ${message.status_code}`);
      return null;
    }

    const decoder = new TextDecoder("utf-8");
    const data = JSON.parse(decoder.decode(bytes.get_data()));

    return {
      ip: data.ip,
      flag: data.flag?.emoji || "🌐",
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      isp: data.connection?.isp,
      timezone: data.timezone?.id,
    };
  } catch (e) {
    console.error(`[NetInfo] Errror while making request: ${e.message}`);
    return null;
  }
}

export function fetchVPNname(nmClient) {
  try {
    if (nmClient) {
      const activeConnections = nmClient.get_active_connections() || [];
      const vpnConn = activeConnections.find(conn => conn.vpn);
      if (vpnConn) {
        return vpnConn.id || "Connected";
      }
    }

    const quickSettings = Main.panel?.statusArea?.quickSettings;
    const vpnToggle = quickSettings?._network?._vpnToggle;

    if (vpnToggle && vpnToggle.visible && vpnToggle.checked) {
      return vpnToggle.subtitle || "Connected";
    }
  } catch (e) {
    console.error(`[NetInfo] VPN Access Error: ${e.message}`);
  }
  return null;
}
