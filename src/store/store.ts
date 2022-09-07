import createSagaMiddleware from '@redux-saga/core';
import { configureStore } from '@reduxjs/toolkit';
// import { authenticateSaga } from '../app/saga/authenticate.saga';
import rootReducer from './root-reducer';
import rootSaga from './rootSaga';
import { createReduxHistory, routerMiddleware } from './router/router-reducer';
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: rootReducer,
    middleware: [sagaMiddleware, routerMiddleware],
});

sagaMiddleware.run(rootSaga);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const history = createReduxHistory(store);
