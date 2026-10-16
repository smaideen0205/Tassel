// Tassel — main process
// A transparent, click-through, always-on-top window that hosts swinging charms.
const {
  app, BrowserWindow, Tray, Menu, screen, ipcMain, dialog, nativeImage,
} = require('electron');
const path = require('path');
const fs = require('fs');
const { CHARM_CATALOG, ROPE_STYLES, LENGTHS } = require('./catalog');

const MAX_CHARMS = 5;
const MAX_CUSTOM = 12;

let win = null;
let tray = null;
let settings = null;

// ---------- settings ----------
const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');
const DEFAULTS = {
  charms: ['nazar'],      // ids currently hanging (catalog ids or custom ids)
  rope: 'thread',
  length: 'medium',
  displayId: null,        // null = primary display
  paused: false,
  custom: [],             // [{ id, name, dataUrl }]
};

function loadSettings() {
  try {
    const raw = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings() {
  try {
    fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
    fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error('Could not save settings', err);
  }
}

function update(patch) {
  settings = { ...settings, ...patch };
  saveSettings();
  applyDisplay();
  pushState();
  buildTrayMenu();
}

// ---------- display / window ----------
function targetDisplay() {
  const all = screen.getAllDisplays();
  return all.find((d) => d.id === settings.displayId) || screen.getPrimaryDisplay();
}

function applyDisplay() {
  if (!win) return;
  const d = targetDisplay();
  win.setBounds(d.bounds);
  if (settings.paused) win.hide();
  else win.showInactive();
}

function pushState() {
  if (!win) return;
  const d = targetDisplay();
  // Hang charms just below the macOS menu bar / top of the work area.
  const topInset = Math.max(0, d.workArea.y - d.bounds.y);
  win.webContents.send('state', {
    charms: settings.charms,
    custom: settings.custom,
    rope: settings.rope,
    length: settings.length,
    topInset,
  });
}

function createWindow() {
  const d = targetDisplay();
  win = new BrowserWindow({
    ...d.bounds,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    hasShadow: false,
    focusable: false,
    skipTaskbar: true,
    fullscreenable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // Clicks pass through to the desktop; mouse moves are still forwarded so
  // the renderer can tell when the cursor is over a charm.
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile(path.join(__dirname, 'index.html'));

  if (settings.paused) win.hide();
}

ipcMain.on('ready', () => pushState());
ipcMain.on('click-through', (_e, on) => {
  if (win) win.setIgnoreMouseEvents(on, { forward: true });
});

// ---------- custom charms (Creator Studio) ----------
async function addCustomCharm() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Choose an image for your charm',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }],
  });
  if (canceled || !filePaths[0]) return;

  let img = nativeImage.createFromPath(filePaths[0]);
  if (img.isEmpty()) {
    dialog.showErrorBox('Tassel', 'That image could not be read.');
    return;
  }
  // Keep stored images small.
  const { width, height } = img.getSize();
  const scale = Math.min(1, 256 / Math.max(width, height));
  if (scale < 1) img = img.resize({ width: Math.round(width * scale), height: Math.round(height * scale) });

  const id = `custom-${Date.now()}`;
  const name = path.basename(filePaths[0]).replace(/\.[^.]+$/, '').slice(0, 30);
  const custom = [...settings.custom, { id, name, dataUrl: img.toDataURL() }].slice(-MAX_CUSTOM);
  const charms = [...settings.charms.filter((c) => c !== id), id].slice(-MAX_CHARMS);
  update({ custom, charms, paused: false });
}

function removeCustomCharm(id) {
  update({
    custom: settings.custom.filter((c) => c.id !== id),
    charms: settings.charms.filter((c) => c !== id),
  });
}

function toggleCharm(id) {
  let charms = settings.charms.includes(id)
    ? settings.charms.filter((c) => c !== id)
    : [...settings.charms, id];
  if (charms.length > MAX_CHARMS) charms = charms.slice(-MAX_CHARMS);
  update({ charms });
}

// ---------- tray ----------
function trayIcon() {
  const assets = path.join(__dirname, '..', 'assets');
  if (process.platform === 'darwin') {
    const img = nativeImage.createFromPath(path.join(assets, 'trayTemplate.png'));
    img.setTemplateImage(true);
    return img;
  }
  // Windows/Linux taskbars are often dark — use the full-colour icon.
  return nativeImage.createFromPath(path.join(assets, process.platform === 'win32' ? 'icon.ico' : 'tray.png'));
}

function buildTrayMenu() {
  if (!tray) return;

  const collections = {};
  for (const c of CHARM_CATALOG) (collections[c.collection] ||= []).push(c);

  const charmMenu = Object.entries(collections).map(([name, items]) => ({
    label: name,
    submenu: items.map((c) => ({
      label: c.name,
      type: 'checkbox',
      checked: settings.charms.includes(c.id),
      click: () => toggleCharm(c.id),
    })),
  }));

  charmMenu.push({ type: 'separator' });
  charmMenu.push({
    label: 'Your charms',
    submenu: [
      { label: 'Add from image…', click: addCustomCharm },
      ...(settings.custom.length ? [{ type: 'separator' }] : []),
      ...settings.custom.map((c) => ({
        label: c.name,
        submenu: [
          { label: 'Hang it', type: 'checkbox', checked: settings.charms.includes(c.id), click: () => toggleCharm(c.id) },
          { label: 'Delete', click: () => removeCustomCharm(c.id) },
        ],
      })),
    ],
  });

  const displays = screen.getAllDisplays();
  const primaryId = screen.getPrimaryDisplay().id;
  const currentId = targetDisplay().id;

  const menu = Menu.buildFromTemplate([
    { label: `Tassel — ${settings.charms.length}/${MAX_CHARMS} charms`, enabled: false },
    { type: 'separator' },
    { label: 'Charms', submenu: charmMenu },
    {
      label: 'Rope',
      submenu: ROPE_STYLES.map((r) => ({
        label: r.name,
        type: 'radio',
        checked: settings.rope === r.id,
        click: () => update({ rope: r.id }),
      })),
    },
    {
      label: 'Length',
      submenu: Object.keys(LENGTHS).map((k) => ({
        label: k[0].toUpperCase() + k.slice(1),
        type: 'radio',
        checked: settings.length === k,
        click: () => update({ length: k }),
      })),
    },
    {
      label: 'Display',
      enabled: displays.length > 1,
      submenu: displays.map((d, i) => ({
        label: `Display ${i + 1} (${d.size.width}×${d.size.height})${d.id === primaryId ? ' — primary' : ''}`,
        type: 'radio',
        checked: d.id === currentId,
        click: () => update({ displayId: d.id }),
      })),
    },
    { type: 'separator' },
    {
      label: settings.paused ? 'Show charms' : 'Hide charms',
      click: () => update({ paused: !settings.paused }),
    },
    {
      label: 'Open at login',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked }),
    },
    { type: 'separator' },
    { label: 'Quit Tassel', role: 'quit' },
  ]);

  tray.setContextMenu(menu);
}

// ---------- lifecycle ----------
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    if (process.platform === 'darwin' && app.dock) app.dock.hide();
    settings = loadSettings();
    createWindow();

    tray = new Tray(trayIcon());
    tray.setToolTip('Tassel');
    buildTrayMenu();
    // Windows only opens the menu on right-click by default; open it on left-click too.
    tray.on('click', () => tray.popUpContextMenu());

    // Windows hides new tray icons under the ^ arrow, so say where Tassel lives.
    if (process.platform === 'win32' && !settings.welcomed) {
      tray.displayBalloon({
        title: 'Tassel is running',
        content: 'Find the Tassel icon under the ^ arrow next to the clock. Right-click it for charms and settings.',
        iconType: 'info',
      });
      settings.welcomed = true;
      saveSettings();
    }

    const refresh = () => { applyDisplay(); pushState(); buildTrayMenu(); };
    screen.on('display-added', refresh);
    screen.on('display-removed', refresh);
    screen.on('display-metrics-changed', refresh);
  });

  app.on('window-all-closed', (e) => e.preventDefault());
}
