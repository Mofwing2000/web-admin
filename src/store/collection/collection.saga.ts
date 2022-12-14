import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { collection, doc, DocumentData, getDocs, Query, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../config/firebase.config';
import i18n from '../../i18n';
import { Collection } from '../../models/collection';
import {
    addCollectionAsync,
    deleteColllectionAsync,
    fetchColllectionsAsync,
    updateColllectionAsync,
} from './collection.action';

async function fetchColllections(dataQuery: Query<DocumentData>) {
    const list: Collection[] = [];
    const querySnapShot = await getDocs(dataQuery);
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Collection);
    });
    return list;
}

function* fetchColllectionsGen(action: ReturnType<typeof fetchColllectionsAsync.request>) {
    try {
        const fetchQuery = action.payload;
        const list: Collection[] = yield call(fetchColllections, fetchQuery);
        yield put(fetchColllectionsAsync.success(list));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(fetchColllectionsAsync.failure(error.message));
        }
    }
}

async function addColllection(collectionData: Collection) {
    await setDoc(doc(db, 'collection', collectionData.id), {
        ...collectionData,
    });
    const list: Collection[] = [];
    const querySnapShot = await getDocs(collection(db, 'collection'));
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Collection);
    });
    return list;
}

function* addColllectionGen(action: ReturnType<typeof addCollectionAsync.request>) {
    try {
        const collectionData = action.payload;
        const list: Collection[] = yield call(addColllection, collectionData);
        yield put(addCollectionAsync.success(list));
        if (i18n.language === 'en') toast.success('Add collection succeed');
        else if (i18n.language === 'vn') toast.success('Th??m b??? s??u t???p th??nh c??ng');
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(addCollectionAsync.failure(error.message));
        }
    }
}

async function updateColllection(collectionData: Collection) {
    await updateDoc(doc(db, 'collection', collectionData.id), {
        ...collectionData,
    });
    const list: Collection[] = [];
    const querySnapShot = await getDocs(collection(db, 'collection'));
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Collection);
    });
    return list;
}

function* updateColllectionGen(action: ReturnType<typeof updateColllectionAsync.request>) {
    try {
        const collectionData = action.payload;
        const list: Collection[] = yield call(updateColllection, collectionData);
        yield put(updateColllectionAsync.success(list));
        if (i18n.language === 'en') toast.success('Update collection succeed');
        else if (i18n.language === 'vn') toast.success('C???p nh???t b??? s??u t???p th??nh c??ng');
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(updateColllectionAsync.failure(error.message));
        }
    }
}

async function deleteColllection(id: string) {
    const batch = writeBatch(db);
    const collectionRef = doc(db, 'collection', id);
    batch.delete(collectionRef);
    await batch.commit();
    const list: Collection[] = [];
    const querySnapShot = await getDocs(collection(db, 'collection'));
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Collection);
    });
    return list;
}

function* deleteColllectionGen(action: ReturnType<typeof deleteColllectionAsync.request>) {
    try {
        const id = action.payload;
        const list: Collection[] = yield call(deleteColllection, id);
        yield put(deleteColllectionAsync.success(list));
        if (i18n.language === 'en') toast.success('Delete collection succeed');
        else if (i18n.language === 'vn') toast.success('X??a b??? s??u t???p th??nh c??ng');
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(deleteColllectionAsync.failure(error.message));
        }
    }
}

export function* collectionSaga() {
    yield takeEvery(fetchColllectionsAsync.request, fetchColllectionsGen);
    yield takeEvery(addCollectionAsync.request, addColllectionGen);
    yield takeEvery(updateColllectionAsync.request, updateColllectionGen);
    yield takeEvery(deleteColllectionAsync.request, deleteColllectionGen);
}
