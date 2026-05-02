import Gio from "gi://Gio";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export function fetchPublicIP() {
  return new Promise((resolve) => {
    try {
      const proc = new Gio.Subprocess({
        argv: ["curl", "-s", "https://api.ipify.org"],
        flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
      });

      proc.init(null);
      
      proc.communicate_utf8_async(null, null, (procObj, res) => {
        try {
          const [, stdout, stderr] = procObj.communicate_utf8_finish(res);

          if (procObj.get_successful() && stdout) {
            resolve(stdout.trim()); 
          } else {
            if (stderr) {
              console.error(`[NetInfo] curl error: ${stderr}`);
            }
            resolve(null); 
          }
        } catch (e) {
          console.error(`[NetInfo] Error reading output: ${e}`);
          resolve(null);
        }
      });
    } catch (e) {
      console.error(`[NetInfo] Failed to spawn curl: ${e.message}`);
      resolve(null);
    }
  });
}

export function fetchVPNname() {
  try {
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
