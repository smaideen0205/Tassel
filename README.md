# Tassel

Little charms that swing on your desktop. They hang from the top of your screen, sway on real rope physics, and can be nudged or flung with the mouse. Clicks pass straight through to whatever is underneath, except on the charm itself.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm start
```

Tassel has no window or Dock icon. Look for its icon in the **menu bar** (macOS) or **system tray** (Windows), and use it to control everything.

## Features

- **10 original charms** in three collections: Luck & protection (evil eye, open hand, four-leaf clover, horseshoe), Sky (crescent moon, star, sun), and Love & calm (heart, lotus, bell).
- **Your own charms**: Tray → Charms → Your charms → *Add from image…*. Transparent PNGs look best.
- **8 rope styles**: cotton thread, leather cord, gold chain, silver chain, neon, spider silk, midnight cord, and temple thread.
- **Rope physics**: each charm has its own weight. Brush past a charm to nudge it, or drag and throw it.
- **Up to 5 charms** at the same time, plus short, medium, or long ropes.
- **Multi-monitor**: Tray → Display lets you pick which screen the charms hang on.
- **Reduce Motion**: if it's turned on in your OS, swings settle much faster.
- **Open at login**, hide/show, and saved settings.

## Build an installer

```bash
npm run dist:mac   # .dmg (run on a Mac)
npm run dist:win   # .exe installer (run on Windows)
```

Output goes to `dist/`. On Windows you get two files: `Tassel Setup 1.1.0.exe` (installer) and `Tassel-Portable-1.1.0.exe` (runs without installing). Unsigned macOS builds need right-click → **Open** the first time.

### Windows build troubleshooting

- **"Cannot create symbolic link"** (the most common error): turn on **Settings → System → For developers → Developer Mode**, or run the terminal as Administrator. Then run `npm run dist:win` again.
- **"Windows protected your PC"** when you open the installer: click **More info → Run anyway**. This happens because the app isn't code-signed.
- **Can't find Tassel after it starts?** It doesn't show in the taskbar. Click the **^** arrow next to the clock and look for the evil-eye icon. To keep it visible, drag it out of that menu onto the taskbar.

## Project layout

```
src/main.js      app, transparent overlay window, tray menu, settings
src/renderer.js  Verlet rope physics, drawing, mouse interaction
src/charms.js    charm artwork (canvas drawing)
src/catalog.js   charm, rope, and length lists
assets/          app and tray icons
```

To add a charm, add an entry to `CHARM_CATALOG` in `catalog.js` and a draw function with the same id in `charms.js`.
