import { useEffect, useState } from 'react';
import { db, saveProductsLocally, saveCategoriesLocally, getUnsyncedSales, markSaleAsSynced } from '../db/db';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const useOfflineSync = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(t('ConnectionRestored'));
      syncData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error(t('ConnectionLost'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync if online
    if (isOnline) {
      syncData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncData = async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    try {
      // 1. Fetch latest data from server and save locally
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      
      await saveProductsLocally(prodRes.data);
      await saveCategoriesLocally(catRes.data);

      // 2. Push unsynced sales to server
      const unsyncedSales = await getUnsyncedSales();
      if (unsyncedSales.length > 0) {
        for (const sale of unsyncedSales) {
          try {
            await api.post('/sales', {
              ...sale,
              isOfflineSale: true
            });
            await markSaleAsSynced(sale.id);
          } catch (err) {
            console.error('Failed to sync sale:', sale.id, err);
          }
        }
        toast.success(`${unsyncedSales.length} ta sotuv serverga yuborildi.`);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  return { isOnline, syncing, syncData };
};
