import { IDictionary } from "@bettercorp/tools/lib/Interfaces";

export interface RedisBase {
  _id: string;
}
export interface RavenBase {
  '@metadata': any;
}
export interface ProductListItem extends RedisBase {
  enabled?: boolean;
  id: string;
  img: string;
  brand: string;
  categories: string[];
  title: string;
  sku: string;
  status: string;
  firstSeen: number;
  additionalInfo: ProductAdditionalInfo;
}
export interface ProductAdditionalInfo {
  descriptionShort?: string;
  descriptionLong?: string;
  descriptionLongHtml?: string;
  images: Array<string>
  urls: IDictionary<string>;
  created?: number;
  published?: number;
}
export interface ProductPublic extends ProductListItem {
  distUrls: Array<string>;
}

export interface ProductSpecialStockLevel {
  [key: string]: number;
}
export type ProductStockLevelType = number | ProductSpecialStockLevel;

export interface ProductStockLevel {
  [key: string]: ProductStockLevelType;
}

export interface Product extends ProductListItem {
  lastCrawl: number;
  last_crawl: string;
  stock_level: ProductStockLevel;
}

export interface Brand extends RedisBase {
  key: string;
  name: string;
}

export interface ADCover {
  enabled?: boolean;
  id: string;
  title: string;
  link: string;
  ads: Array<ADvert>;
  start?: number;
  end?: number;
}
export interface ADvert {
  img: string;
  line1: string;
  line2: string;
  linkText: string;
}

export interface DistributorShopifyRunner {
  hostname: string;
  manufacturingBrand: boolean;
}
export interface Distributor {
  enabled: boolean;
  key: string;
  name: string;
  icon: string;
  url: string;
  regions: string[];
  shopifyRunner?: DistributorShopifyRunner;
}
export interface Region {
  name: string;
  code: string;
  country: string;
  continent: string;
  domain: string;
}
export interface Category {
  enabled: boolean;
  name: string;
  key: string;
}
export interface FavProduct {
  id: string,
  tenantId: string;
  appId: string;
  userId: string;
  productId: string;
  createdTime: number;
  deletedTime: number | null;
  list: string | null;
}
export interface AnalyticsStat extends RavenBase {
  id: string;
  tenantId: string | null;
  appId: string | null;
  userId: string | null;
  ip: string;
  userAgent: string;
  time: number;
  actions: AnalyticsStatAction[]
}
export interface AnalyticsStatAction {
  time: number;
  action: string;
  id: string;
  desc: string | null;
}

export const Collections = {
  products: "products",
} as const;

export const QueryCollections = {
  products: { collection: Collections.products}
} as const;