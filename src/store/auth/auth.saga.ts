import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { push } from 'redux-first-history';
import auth, { db } from '../../config/firebase.config';
import { loginAsync, logout } from './auth.action';

async function loginFirebase(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        const userToken = await userCredential.user.getIdToken();
        const docRef = doc(db, 'user', userCredential.user.uid);
        const docSnap = await getDoc(docRef);
        return {
            user: docSnap.data(),
            token: userToken,
        };
    });
}

function* login(action: ReturnType<typeof loginAsync.request>) {
    // const navigate = useNavigate();
    console.log('login');
    try {
        const { email, password } = action.payload;
        const { user, token } = yield call(loginFirebase, email, password);
        console.log(user);
        yield put(loginAsync.success({ user, token }));
        if (user.role !== 'admin' && user.role !== 'staff') yield put(logout());
        else yield put(push('/'));
    } catch (error) {
        if (error instanceof FirebaseError) yield put(loginAsync.failure(error.message));
    }
}

export function* authenticateSaga() {
    yield takeEvery(loginAsync.request, login);
}
