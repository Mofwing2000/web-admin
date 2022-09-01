import { createReducer, Reducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { ActionType } from 'typesafe-actions';
import { Top, Bottom, ProductState } from '../../models/product';
import { ProductActionType } from '../../type/product-actions';
import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initState: ProductState = {
    products: [],
    isProductLoading: false,
    error: '',
};

const productReducer: Reducer<ProductState, AnyAction> = createReducer(initState)
    .handleAction(ProductActionType.FETCH_PRODUCTS_START, (state: ProductState) => ({
        ...state,
        isProductLoading: true,
    }))
    .handleAction(
        ProductActionType.FETCH_PRODUCTS_SUCCEED,
        (state: ProductState, action: PayloadAction<(Top | Bottom)[]>) => ({
            ...state,
            isProductLoading: false,
            products: action.payload,
        }),
    )
    .handleAction(ProductActionType.FETCH_PRODUCTS_FAILED, (state: ProductState, action: PayloadAction<string>) => ({
        ...state,
        isProductLoading: false,
        error: action.payload,
    }))
    .handleAction(ProductActionType.ADD_PRODUCT_START, (state: ProductState) => ({
        ...state,
        isProductLoading: true,
    }))
    .handleAction(
        ProductActionType.ADD_PRODUCT_SUCCEED,
        (state: ProductState, action: PayloadAction<(Top | Bottom)[]>) => ({
            ...state,
            isProductLoading: false,
            products: action.payload,
        }),
    )
    .handleAction(ProductActionType.ADD_PRODUCT_FAILED, (state: ProductState, action: PayloadAction<string>) => ({
        ...state,
        isProductLoading: false,
        error: action.payload,
    }))
    .handleAction(ProductActionType.UPDATE_PRODUCT_START, (state: ProductState) => ({
        ...state,
        isProductLoading: true,
    }))
    .handleAction(
        ProductActionType.UPDATE_PRODUCT_SUCCEED,
        (state: ProductState, action: PayloadAction<(Top | Bottom)[]>) => ({
            ...state,
            isProductLoading: false,
            products: action.payload,
        }),
    )
    .handleAction(ProductActionType.UPDATE_PRODUCT_FAILED, (state: ProductState, action: PayloadAction<string>) => ({
        ...state,
        isProductLoading: false,
        error: action.payload,
    }))
    .handleAction(ProductActionType.DELETE_PRODUCT_START, (state: ProductState) => ({
        ...state,
        isProductLoading: true,
    }))
    .handleAction(
        ProductActionType.DELETE_PRODUCT_SUCCEED,
        (state: ProductState, action: PayloadAction<(Top | Bottom)[]>) => ({
            ...state,
            isProductLoading: false,
            products: action.payload,
        }),
    )
    .handleAction(ProductActionType.DELETE_PRODUCT_FAILED, (state: ProductState, action: PayloadAction<string>) => ({
        ...state,
        isProductLoading: false,
        error: action.payload,
    }))
    .handleAction(ProductActionType.CLEAR_PRODUCTS, (state: ProductState) => ({
        ...state,
        isProductLoading: false,
        error: '',
        products: [],
    }));

export default productReducer;
export const selectProduct = (state: RootState) => state.product;
