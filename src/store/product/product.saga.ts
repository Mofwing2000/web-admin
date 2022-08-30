import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { DocumentData, getDocs, Query, query } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { Top, Bottom } from '../../models/product';
import { fetchProductsAsync } from './product.action';

async function fetchProducts(dataQuery: Query<DocumentData>) {
    const list: (Top | Bottom)[] = [];
    const querySnapShot = await getDocs(dataQuery);
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Top | Bottom);
    });
    return list;
}

function* fetchProductsGen(action: ReturnType<typeof fetchProductsAsync.request>) {
    try {
        const fetchQuery = action.payload;
        const list: (Top | Bottom)[] = yield call(fetchProducts, fetchQuery);
        yield put(fetchProductsAsync.success(list));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(fetchProductsAsync.failure(error.message));
        }
    }
}

export function* productSaga() {
    yield takeEvery(fetchProductsAsync.request, fetchProductsGen);
}
