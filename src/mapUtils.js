import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Soup from "gi://Soup";

const _session = new Soup.Session();

export function getTileCoords(lat, lon, zoom) {
  const xTile = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const yTile = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom),
  );
  return { x: xTile, y: yTile, z: zoom };
}

export async function downloadMapTile(lat, lon, zoom, cachePath) {
  const coords = getTileCoords(lat, lon, zoom);
  const url = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;

  const message = Soup.Message.new("GET", url);
  message.request_headers.append(
    "User-Agent",
    "NetInfoExtension/1.0 (seu_nome@email.com)",
  );

  try {
    const bytes = await _session.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
    );

    if (message.status_code !== Soup.Status.OK) {
      throw new Error(`OSM Error: ${message.status_code}`);
    }

    const dir = Gio.File.new_for_path(cachePath);
    if (!dir.query_exists(null)) {
        dir.make_directory_with_parents(null);
    }

    const file = Gio.File.new_for_path(`${cachePath}/map_cache.png`);

    const outStream = file.replace(null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);

    outStream.write_bytes(bytes, null);
    outStream.close(null);

    return file.get_path(); 
  } catch (e) {
    console.error(`[MapInfo] Erro ao baixar mapa: ${e.message}`);
    return null;
  }
}