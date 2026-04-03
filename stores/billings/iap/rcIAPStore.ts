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
  init: () => Promise<void>;
  fetchPacks: () => Promise<TRcPack[]>;
  buyPack: (packId: string) => Promise<void>;
};

export type TIAPStore = TIapState & TIapActions & {};

export const useIapStore = create<TIAPStore>((set, get) => ({
  configured: false,
  customerInfo: null,
  packs: [],

  init: async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_IAP_API_KEY! });
  },

  fetchPacks: async (): Promise<TRcPack[]> => {
    await get().init();

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
    console.log({ packs });
    set({ packs });

    return packs;
  },

  buyPack: async (packId: string) => {
    await get().init();

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
