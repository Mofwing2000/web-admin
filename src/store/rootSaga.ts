import { all } from '@redux-saga/core/effects';
import { authenticateSaga } from './auth/auth.saga';
import { collectionSaga } from './collection/collection.saga';
import { orderSaga } from './order/order.saga';
import { productSaga } from './product/product.saga';
import { userSaga } from './user/user.saga';
import { usersSaga } from './users/users.saga';

export default function* rootSaga() {
    yield all([authenticateSaga(), collectionSaga(), productSaga(), userSaga(), usersSaga(), orderSaga()]);
}
