import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/auth.reducer';
import routerReducer from './router/routerReducer';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { RootState } from './store';

const authPersistConfig = {
    key: 'auth',
    storage: storage,
    whitelist: ['currentUser', 'userToken', 'isLogged'],
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    router: routerReducer,
});

export default rootReducer;
export const selectAuth = (state: RootState) => state.auth;
