import { Top, Bottom } from './product';

export interface Collection {
    id: string;
    title: string;
    description: string;
    collectionBanner: string;
    productsList: string[];
    createdAt: Date;
}

export interface CollectionState {
    isCollectionLoading: boolean;
    collections: Array<Collection>;
    error: string;
}
