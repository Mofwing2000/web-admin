import { DocumentData, Query } from 'firebase/firestore';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { Bottom, Top } from '../../models/product';
import { ProductActionType } from '../../type/product-actions';

export const fetchProductsAsync = createAsyncAction(
    ProductActionType.FETCH_PRODUCTS_START,
    ProductActionType.FETCH_PRODUCTS_SUCCEED,
    ProductActionType.FETCH_PRODUCTS_FAILED,
)<Query<DocumentData>, Array<Top | Bottom>, string>();

export const addProductAsync = createAsyncAction(
    ProductActionType.ADD_PRODUCT_START,
    ProductActionType.ADD_PRODUCT_SUCCEED,
    ProductActionType.ADD_PRODUCT_FAILED,
)<Top | Bottom, Array<Top | Bottom>, string>();

export const updateProductAsync = createAsyncAction(
    ProductActionType.UPDATE_PRODUCT_START,
    ProductActionType.UPDATE_PRODUCT_SUCCEED,
    ProductActionType.UPDATE_PRODUCT_FAILED,
)<Top | Bottom, Array<Top | Bottom>, string>();

export const deleteProductAsync = createAsyncAction(
    ProductActionType.DELETE_PRODUCT_START,
    ProductActionType.DELETE_PRODUCT_SUCCEED,
    ProductActionType.DELETE_PRODUCT_FAILED,
)<string, Array<Top | Bottom>, string>();

export const clearProducts = createAction(ProductActionType.CLEAR_PRODUCTS)();
