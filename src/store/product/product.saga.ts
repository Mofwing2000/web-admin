import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import {
    addDoc,
    collection,
    doc,
    DocumentData,
    getDocs,
    Query,
    query,
    setDoc,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../config/firebase.config';
import { Top, Bottom } from '../../models/product';
import { addProductAsync, deleteProductAsync, fetchProductsAsync, updateProductAsync } from './product.action';

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

async function addProduct(productData: Top | Bottom) {
    await setDoc(doc(db, 'product', productData.id), {
        ...productData,
    });
    const list: (Top | Bottom)[] = [];
    const querySnapShot = await getDocs(collection(db, 'product'));
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Top | Bottom);
    });
    return list;
}

function* addProductGen(action: ReturnType<typeof addProductAsync.request>) {
    try {
        const productData = action.payload;
        const list: (Top | Bottom)[] = yield call(addProduct, productData);
        yield put(addProductAsync.success(list));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(addProductAsync.failure(error.message));
        }
    }
}

async function updateProduct(productData: Top | Bottom) {
    await updateDoc(doc(db, 'product', productData.id), {
        ...productData,
    });
    const list: (Top | Bottom)[] = [];
    const querySnapShot = await getDocs(collection(db, 'collection'));
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Top | Bottom);
    });
    return list;
}

function* updateProductGen(action: ReturnType<typeof updateProductAsync.request>) {
    try {
        const productData = action.payload;
        const list: (Top | Bottom)[] = yield call(updateProduct, productData);
        yield put(updateProductAsync.success(list));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(updateProductAsync.failure(error.message));
        }
    }
}

async function deleteProduct(id: string) {
    const batch = writeBatch(db);
    const collectionRef = doc(db, 'product', id);
    batch.delete(collectionRef);
    await batch.commit();
    const list: (Top | Bottom)[] = [];
    const querySnapShot = await getDocs(collection(db, 'product'));
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Top | Bottom);
    });
    return list;
}

function* deleteProductGen(action: ReturnType<typeof deleteProductAsync.request>) {
    try {
        const id = action.payload;
        const list: (Top | Bottom)[] = yield call(deleteProduct, id);
        console.log('List saga:', list);

        yield put(deleteProductAsync.success(list));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(deleteProductAsync.failure(error.message));
        }
    }
}

export function* productSaga() {
    yield takeEvery(fetchProductsAsync.request, fetchProductsGen);
    yield takeEvery(addProductAsync.request, addProductGen);
    yield takeEvery(updateProductAsync.request, updateProductGen);
    yield takeEvery(deleteProductAsync.request, deleteProductGen);
}
