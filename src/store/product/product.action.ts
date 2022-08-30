import { DocumentData, Query } from 'firebase/firestore';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { Product } from '../../models/product';
import { ProductActionType } from '../../type/product-actions';

export const fetchProductsAsync = createAsyncAction(
    ProductActionType.FETCH_PRODUCTS_START,
    ProductActionType.FETCH_PRODUCTS_SUCCEED,
    ProductActionType.FETCH_PRODUCTS_FAILED,
)<Query<DocumentData>, Array<Product>, string>();

export const clearProducts = createAction(ProductActionType.CLEAR_PRODUCTS)();
