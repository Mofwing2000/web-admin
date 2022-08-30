import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/auth.reducer';
import routerReducer from './router/router-reducer';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { RootState } from './store';
import darkModeReducer from './dark-mode/dark-mode.reducer';
import collectionReducer from './collection/collection.reducer';
import productReducer from './product/product.reducer';
import userReducer from './user/user.reducer';
import usersReducer from './users/users.reducer';
import ordersReducer from './order/order.reducer';

const authPersistConfig = {
    key: 'auth',
    storage: storage,
    whitelist: ['currentUser', 'userToken', 'isLogged'],
};

const darkModePersistConfig = {
    key: 'darkMode',
    storage: storage,
};

const userPersistConfig = {
    key: 'user',
    storage: storage,
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    darkMode: persistReducer(darkModePersistConfig, darkModeReducer),
    product: productReducer,
    collection: collectionReducer,
    router: routerReducer,
    user: persistReducer(userPersistConfig, userReducer),
    users: usersReducer,
    orders: ordersReducer,
});

export default rootReducer;
export const selectAuth = (state: RootState) => state.auth;
