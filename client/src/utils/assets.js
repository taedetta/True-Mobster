export const ASSET_VERSION = '2.6.3';

export function uiAsset(name) {
  return `/assets/ui/${name}.webp?v=${ASSET_VERSION}`;
}

export const CATALOG_KEYS = {
  weapon: 'weapons',
  armor: 'armor',
  vehicle: 'vehicles',
  property: 'properties',
  consumable: 'consumables',
};

export function catalogItems(catalog, category) {
  if (!catalog) return [];
  const key = CATALOG_KEYS[category] || category;
  return catalog[key] || [];
}
