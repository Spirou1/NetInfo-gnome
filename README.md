# NetInfo

A GNOME Shell extension that provides networking information including IP address, location, VPN status, and real-time data usage.

## Features

- Public IP and ISP detection.
- Geographic location information (City, Timezone).
- VPN connection status indicator.
- Real-time network speed monitoring (Download and Upload).
- Integrated traffic graph.
- Support for GNOME Shell versions 45 to 50.

## Screenshots

![NetInfo Screenshot](https://i.imgur.com/0c9U3zj.png)

## Installation

### Manual Install

1. Copy the extension folder to your local extensions directory:
   ```bash
   cp -r netinfo@enzospironelli.com.br ~/.local/share/gnome-shell/extensions/
   ```
2. Restart GNOME Shell (Log out and log back in, or press Alt+F2, type "r" and press Enter on X11).
3. Enable "NetInfo" via the Extensions app or GNOME Tweaks.

## Requirements

- GNOME Shell 45 or newer.
- NetworkManager.

## Development

To compile the GSettings schema:
```bash
glib-compile-schemas schemas/
```

