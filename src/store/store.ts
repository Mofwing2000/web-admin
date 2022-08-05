import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';
import { authenticateSaga } from './auth/auth.saga';
// import { authenticateSaga } from '../app/saga/authenticate.saga';
import rootReducer from './rootReducer';
import { createReduxHistory, routerMiddleware } from './router/routerReducer';
const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: rootReducer,
    middleware: [sagaMiddleware, routerMiddleware],
});

sagaMiddleware.run(authenticateSaga);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const history = createReduxHistory(store);
