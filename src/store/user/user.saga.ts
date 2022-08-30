import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { doc, DocumentData, DocumentReference, getDoc, getDocs, Query, query, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../config/firebase.config';
import i18n from '../../i18n';
import { User } from '../../models/user';
import { fetchUserAsync, updateUserAsync } from './user.action';

async function fetchUser(docRef: DocumentReference<DocumentData>) {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as User;
}

function* fetchUserGen(action: ReturnType<typeof fetchUserAsync.request>) {
    try {
        const docRef = action.payload;
        const user: User = yield call(fetchUser, docRef);
        yield put(fetchUserAsync.success(user));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(fetchUserAsync.failure(error.message));
        }
    }
}

async function updateUser(user: User) {
    await updateDoc(doc(db, 'user', user.id), {
        ...user,
    });
    if (i18n.language === 'en') toast.success('Update profile succeed');
    else if (i18n.language === 'vn') toast.success('Cập nhật thông tin thành công');
}

function* updateUserGen(action: ReturnType<typeof updateUserAsync.request>) {
    try {
        const user = action.payload;
        yield call(updateUser, user);
        yield put(updateUserAsync.success(user));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(updateUserAsync.failure(error.message));
        }
    }
}

export function* userSaga() {
    yield takeEvery(fetchUserAsync.request, fetchUserGen);
    yield takeEvery(updateUserAsync.request, updateUserGen);
}
