import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { push } from 'redux-first-history';
import auth, { db } from '../../config/firebase.config';
import { User } from '../../models/user';
import { loginAsync } from './auth.action';

import { fetchUserAsync } from '../user/user.action';

async function loginFirebase(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        const userToken = await userCredential.user.getIdToken();
        const docRef = doc(db, 'user', userCredential.user.uid);
        const docSnap = await getDoc(docRef);
        return {
            user: { ...docSnap.data() } as User,
            token: userToken,
        };
    });
}

function* login(action: ReturnType<typeof loginAsync.request>) {
    try {
        const { email, password } = action.payload;
        const {
            user,
            token,
        }: {
            user: User;
            token: string;
        } = yield call(loginFirebase, email, password);
        yield put(loginAsync.success({ token }));
        yield put(fetchUserAsync.success(user));
        yield put(push('/'));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(loginAsync.failure(error.message));
        }
    }
}

export function* authenticateSaga() {
    yield takeEvery(loginAsync.request, login);
}
