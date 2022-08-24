import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/auth.reducer';
import routerReducer from './router/router-reducer';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { RootState } from './store';
import darkModeReducer from './dark-mode/dark-mode.reducer';

const authPersistConfig = {
    key: 'auth',
    storage: storage,
    whitelist: ['currentUser', 'userToken', 'isLogged'],
};

const darkModePersistConfig = {
    key: 'darkMode',
    storage: storage,
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    darkMode: persistReducer(darkModePersistConfig, darkModeReducer),
    // persistReducer()
    // darkMode: darkModeReducer,
    router: routerReducer,
});

export default rootReducer;
export const selectAuth = (state: RootState) => state.auth;
