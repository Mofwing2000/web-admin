import { FirebaseError } from '@firebase/util';
import { call, put, putResolve, select, takeEvery } from '@redux-saga/core/effects';
import { updatePassword } from 'firebase/auth';
import { doc, DocumentData, DocumentReference, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import auth, { db } from '../../config/firebase.config';
import i18n from '../../i18n';
import { User } from '../../models/user';
import { loginAsync } from '../auth/auth.action';
import { fetchUserAsync, updateUserAsync } from './user.action';
import { selectUser } from './user.reducer';

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

async function updateUserPassword(newPassword: string) {
    console.log(newPassword);
    if (auth.currentUser) await updatePassword(auth.currentUser!, newPassword);
}

function* updateUserGen(action: ReturnType<typeof updateUserAsync.request>) {
    try {
        const userData = action.payload;
        const { user }: ReturnType<typeof selectUser> = yield select(selectUser);
        yield putResolve(loginAsync.request({ email: user!.email, password: user!.password }));
        yield call(updateUserPassword, userData.password);
        yield call(updateUser, userData);
        yield put(updateUserAsync.success(userData));
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
