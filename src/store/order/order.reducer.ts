import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { createReducer, Reducer } from 'typesafe-actions';
import { Order, OrdersState } from '../../models/order';
import { OrderActionType } from '../../type/order-actions';
import { RootState } from '../store';

const initState: OrdersState = {
    orders: [],
    isOrdersLoading: false,
    error: '',
};

const ordersReducer: Reducer<OrdersState, AnyAction> = createReducer(initState)
    .handleAction(OrderActionType.FETCH_ORDERS_START, (state: OrdersState) => ({
        ...state,
        isOrdersLoading: true,
    }))
    .handleAction(OrderActionType.FETCH_ORDERS_SUCCEED, (state: OrdersState, action: PayloadAction<Order[]>) => ({
        ...state,
        isOrdersLoading: false,
        orders: action.payload,
    }))
    .handleAction(OrderActionType.FETCH_ORDERS_FAILED, (state: OrdersState, action: PayloadAction<string>) => ({
        ...state,
        isOrdersLoading: false,
        error: action.payload,
    }))
    .handleAction(OrderActionType.CLEAR_ORDERS, (state: OrdersState) => ({
        ...state,
        isOrdersLoading: false,
        error: '',
        orders: [],
    }));

export default ordersReducer;
export const selectOrders = (state: RootState) => state.orders;
