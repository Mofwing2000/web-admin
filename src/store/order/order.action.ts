import { DocumentData, Query } from 'firebase/firestore';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { Order } from '../../models/order';
import { OrderActionType } from '../../type/order-actions';

export const fetchOrdersAsync = createAsyncAction(
    OrderActionType.FETCH_ORDERS_START,
    OrderActionType.FETCH_ORDERS_SUCCEED,
    OrderActionType.FETCH_ORDERS_FAILED,
)<Query<DocumentData>, Array<Order>, string>();

export const clearOrders = createAction(OrderActionType.CLEAR_ORDERS)();
