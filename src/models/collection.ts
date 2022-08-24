import { Top, Bottom } from './product';

export interface Collection {
    id: string;
    title: string;
    description: string;
    collectionBanner: string;
    productsList: string[];
    createdAt: Date;
}
