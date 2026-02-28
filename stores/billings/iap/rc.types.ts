import { PurchasesPackage } from 'react-native-purchases';

export type TRcPack = {
  id: string; // package.identifier или productIdentifier
  title: string;
  description?: string;
  priceString: string; // локализованная цена
  productIdentifier: string; // Apple productId
  package: PurchasesPackage; // то, что передаём в purchasePackage
};
