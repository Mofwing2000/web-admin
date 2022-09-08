import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { collection, doc, DocumentData, getDocs, Query, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../config/firebase.config';
import i18n from '../../i18n';
import { User } from '../../models/user';
import { addUsersAsync, deleteUsersAsync, fetchUsersAsync, updateUsersAsync } from './users.action';

async function fetchUsers(docQuery: Query<DocumentData>) {
    const docSnap = await getDocs(docQuery);
    const list: User[] = [];
    docSnap.forEach((item) => {
        list.push(item.data() as User);
    });
    return list;
}

function* fetchUsersGen(action: ReturnType<typeof fetchUsersAsync.request>) {
    try {
        const docQuery = action.payload;
        const users: User[] = yield call(fetchUsers, docQuery);
        yield put(fetchUsersAsync.success(users));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(fetchUsersAsync.failure(error.message));
        }
    }
}

async function updateUsers(user: User) {
    await updateDoc(doc(db, 'user', user.id), {
        ...user,
    });
    const docSnap = await getDocs(collection(db, 'user'));
    const list: User[] = [];
    docSnap.forEach((item) => {
        if ((item.data() as User).id === user.id) list.push(user);
        else list.push({ ...(item.data() as User) });
    });
    return list;
}

function* updateUsersGen(action: ReturnType<typeof updateUsersAsync.request>) {
    try {
        const user = action.payload;
        const users: User[] = yield call(updateUsers, user);
        yield put(updateUsersAsync.success(users));
        if (i18n.language === 'en') toast.success('Update profile succeed');
        else if (i18n.language === 'vn') toast.success('Cập nhật thông tin thành công');
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(updateUsersAsync.failure(error.message));
        }
    }
}

async function deleteUsers(id: string) {
    const batch = writeBatch(db);
    const userRef = doc(db, 'user', id);
    batch.delete(userRef);
    await batch.commit();
    const docSnap = await getDocs(collection(db, 'user'));
    const list: User[] = [];
    docSnap.forEach((item) => {
        list.push({ ...(item.data() as User) });
    });
    return list;
}

function* deleteUsersGen(action: ReturnType<typeof deleteUsersAsync.request>) {
    try {
        const id = action.payload;
        const users: User[] = yield call(deleteUsers, id);
        yield put(deleteUsersAsync.success(users));
        if (i18n.language === 'en') toast.success('Delete user succeed');
        else if (i18n.language === 'vn') toast.success('Xóa người dùng thành công');
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(deleteUsersAsync.failure(error.message));
        }
    }
}

async function addUsers(user: User) {
    await setDoc(doc(db, 'user', user.id), {
        ...user,
    });
    const docSnap = await getDocs(collection(db, 'user'));
    const list: User[] = [];
    docSnap.forEach((item) => {
        list.push({ ...(item.data() as User) });
    });
    return list;
}

function* addUsersGen(action: ReturnType<typeof addUsersAsync.request>) {
    try {
        const user = action.payload;
        const users: User[] = yield call(addUsers, user);
        yield put(addUsersAsync.success(users));
        if (i18n.language === 'en') toast.success('Add user succeed');
        else if (i18n.language === 'vn') toast.success('Xóa người dùng thành công');
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(addUsersAsync.failure(error.message));
        }
    }
}

export function* usersSaga() {
    yield takeEvery(fetchUsersAsync.request, fetchUsersGen);
    yield takeEvery(updateUsersAsync.request, updateUsersGen);
    yield takeEvery(deleteUsersAsync.request, deleteUsersGen);
    yield takeEvery(addUsersAsync.request, addUsersGen);
}
