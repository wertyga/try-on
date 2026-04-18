import { create } from 'zustand';
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import {
  checkIAPTransaction,
  fetchIAPConfig,
} from '@/stores/billings/iap/rc.api';
import { sendLogs } from '@/api';

export type TRcPack = {
  id: string; // package.identifier или productIdentifier
  title: string;
  description?: string;
  priceString: string; // локализованная цена
  productIdentifier: string; // Apple productId
  package: PurchasesPackage; // то, что передаём в purchasePackage
};

type TIapState = {
  configured: boolean;
  customerInfo: CustomerInfo | null;
  packs: TRcPack[];
};

type TIapActions = {
  initialize: () => Promise<void>;
  fetchPacks: () => Promise<TRcPack[]>;
  buyPack: (packId: string) => Promise<void>;
};

export type TIAPStore = TIapState & TIapActions & {};

export const useIapStore = create<TIAPStore>((set, get) => ({
  configured: false,
  customerInfo: null,
  packs: [],

  initialize: async () => {
    if (get().configured) return;

    try {
      const { apiKey } = await fetchIAPConfig();

      await Purchases.setLogLevel(LOG_LEVEL.ERROR);
      Purchases.configure({ apiKey });

      set({ configured: true });
    } catch (e: any) {
      e.POINT = 'useIapStore.initialize';
      sendLogs(e);
    }
  },

  fetchPacks: async (): Promise<TRcPack[]> => {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) throw new Error('No current offering in RevenueCat');

    const packs = current.availablePackages
      .map((pkg) => {
        const p = pkg.product;
        return {
          id: pkg.identifier || p.identifier,
          title: p.title,
          description: p.description,
          priceString: p.priceString,
          productIdentifier: p.identifier,
          package: pkg,
        };
      })
      .sort((a, b) => parseInt(a.title) - parseInt(b.title));

    set({ packs });

    return packs;
  },

  buyPack: async (packId: string) => {
    const packs = await get().fetchPacks();

    const pack = packs.find((p) => p.productIdentifier === packId);

    if (!pack) throw new Error(`Pack not found: ${packId}`);

    const { transaction } = await Purchases.purchasePackage(pack.package);

    const payload = {
      productId: transaction.productIdentifier,
      transactionId: transaction.transactionIdentifier,
    };

    const { success } = await checkIAPTransaction(payload);

    if (!success) {
      throw new Error('No transaction found in customerInfo');
    }
  },
}));
