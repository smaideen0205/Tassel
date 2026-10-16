// Shared catalog — loaded by the main process (require) and the renderer (<script>).
(function (root) {
  const CHARM_CATALOG = [
    { id: 'nazar',     name: 'Evil eye',      collection: 'Luck & protection', weight: 1.0 },
    { id: 'hamsa',     name: 'Open hand',     collection: 'Luck & protection', weight: 1.2 },
    { id: 'clover',    name: 'Four-leaf clover', collection: 'Luck & protection', weight: 0.8 },
    { id: 'horseshoe', name: 'Horseshoe',     collection: 'Luck & protection', weight: 1.3 },
    { id: 'moon',      name: 'Crescent moon', collection: 'Sky',               weight: 0.9 },
    { id: 'star',      name: 'Star',          collection: 'Sky',               weight: 0.9 },
    { id: 'sun',       name: 'Sun',           collection: 'Sky',               weight: 1.1 },
    { id: 'heart',     name: 'Heart',         collection: 'Love & calm',       weight: 1.0 },
    { id: 'lotus',     name: 'Lotus',         collection: 'Love & calm',       weight: 0.9 },
    { id: 'bell',      name: 'Bell',          collection: 'Love & calm',       weight: 1.4 },
    { id: 'cat',       name: 'Cat',           collection: 'Cute animals',      weight: 1.0 },
    { id: 'owl',       name: 'Owl',           collection: 'Cute animals',      weight: 1.0 },
    { id: 'panda',     name: 'Panda',         collection: 'Cute animals',      weight: 1.1 },
    { id: 'bunny',     name: 'Bunny',         collection: 'Cute animals',      weight: 0.9 },
    { id: 'fox',       name: 'Fox',           collection: 'Cute animals',      weight: 1.0 },
    { id: 'penguin',   name: 'Penguin',       collection: 'Cute animals',      weight: 1.1 },
  ];

  const ROPE_STYLES = [
    { id: 'thread',   name: 'Cotton thread' },
    { id: 'leather',  name: 'Leather cord' },
    { id: 'gold',     name: 'Gold chain' },
    { id: 'silver',   name: 'Silver chain' },
    { id: 'neon',     name: 'Neon' },
    { id: 'spider',   name: 'Spider silk' },
    { id: 'midnight', name: 'Midnight cord' },
    { id: 'temple',   name: 'Temple thread' },
  ];

  const LENGTHS = { short: 110, medium: 170, long: 250 };

  const api = { CHARM_CATALOG, ROPE_STYLES, LENGTHS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TasselCatalog = api;
})(typeof window !== 'undefined' ? window : globalThis);
