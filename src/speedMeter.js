import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

export class SpeedMeter {
    constructor() {
        this.label = new St.Label({
            text: "⇅ -.-- --",
            y_align: Clutter.ActorAlign.CENTER,
        });
        
        this.timeoutId = 0;
        this.prevRx = 0;
        this.prevTx = 0;
    }


    getWidget() {
        return this.label;
    }

    start() {
        let [rx, tx] = this._getBytes();
        this.prevRx = rx;
        this.prevTx = tx;


        this.timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            1,
            () => {
                this._update();
                return GLib.SOURCE_CONTINUE; 
            }
        );
    }

    stop() {
        if (this.timeoutId) {
            GLib.Source.remove(this.timeoutId);
            this.timeoutId = 0;
        }
        if (this.label) {
            this.label.destroy();
            this.label = null;
        }
    }

    _getBytes() {
        let rx = 0, tx = 0;
        try {
            let lines = Shell.get_file_contents_utf8_sync("/proc/net/dev").split("\n");
            for (let line of lines) {
                let cols = line.trim().split(/\s+/);
                if (cols.length > 2 && !cols[0].match(/^(lo|tun|tap|veth|br|docker|virbr)/)) {
                    rx += parseInt(cols[1]) || 0;
                    tx += parseInt(cols[9]) || 0;
                }
            }
        } catch (e) {
            console.error(`Erro ao ler /proc/net/dev: ${e}`);
        }
        return [rx, tx];
    }

    _update() {
        let [rx, tx] = this._getBytes();
        let speed = ((rx - this.prevRx) + (tx - this.prevTx)) / 1024.0;
        
        this.prevRx = rx;
        this.prevTx = tx;

        this.label.set_text(`⇅ ${this._formatSpeed(speed)}`);
    }

    _formatSpeed(speedKBs) {
        let units = ["KB/s", "MB/s", "GB/s"];
        let i = 0;
        while (speedKBs >= 1024 && i < units.length - 1) {
            speedKBs /= 1024;
            i++;
        }
        return `${speedKBs.toFixed(2)} ${units[i]}`;
    }
}