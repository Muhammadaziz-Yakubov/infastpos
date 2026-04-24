import Dexie from 'dexie';

export const db = new Dexie('InFastPOSDB');

// Define database schema
db.version(1).stores({
  products: '_id, name, categoryId, price, sku',
  categories: '_id, name',
  pendingSales: '++id, items, total, paymentMethod, createdAt, synced',
  settings: 'key, value'
});

// Helper functions
export const saveProductsLocally = async (products) => {
  await db.products.clear();
  return await db.products.bulkAdd(products);
};

export const saveCategoriesLocally = async (categories) => {
  await db.categories.clear();
  return await db.categories.bulkAdd(categories);
};

export const getLocalProducts = async () => {
  return await db.products.toArray();
};

export const getLocalCategories = async () => {
  return await db.categories.toArray();
};

export const savePendingSale = async (sale) => {
  return await db.pendingSales.add({
    ...sale,
    synced: 0,
    createdAt: new Date()
  });
};

export const getUnsyncedSales = async () => {
  return await db.pendingSales.where('synced').equals(0).toArray();
};

export const markSaleAsSynced = async (id) => {
  return await db.pendingSales.update(id, { synced: 1 });
};
