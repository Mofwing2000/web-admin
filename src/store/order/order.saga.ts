import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { DocumentData, getDocs, Query, query } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { Order } from '../../models/order';
import { Top, Bottom } from '../../models/product';
import { fetchOrdersAsync } from './order.action';

async function fetchOrders(dataQuery: Query<DocumentData>) {
    const list: Order[] = [];
    const querySnapShot = await getDocs(dataQuery);
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Order);
    });
    return list;
}

function* fetchOrdersGen(action: ReturnType<typeof fetchOrdersAsync.request>) {
    try {
        const fetchQuery = action.payload;
        const list: Order[] = yield call(fetchOrders, fetchQuery);
        yield put(fetchOrdersAsync.success(list));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(fetchOrdersAsync.failure(error.message));
        }
    }
}

export function* orderSaga() {
    yield takeEvery(fetchOrdersAsync.request, fetchOrdersGen);
}
