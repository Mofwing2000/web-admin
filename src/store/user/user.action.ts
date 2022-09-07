import { DocumentData, DocumentReference } from 'firebase/firestore';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { User } from '../../models/user';
import { UserActionType } from '../../type/user-actions';

export const fetchUserAsync = createAsyncAction(
    UserActionType.FETCH_USER_START,
    UserActionType.FETCH_USER_SUCCEED,
    UserActionType.FETCH_USER_FAILED,
)<DocumentReference<DocumentData>, User, string>();

export const updateUserAsync = createAsyncAction(
    UserActionType.UPDATE_USER_START,
    UserActionType.UPDATE_USER_SUCCEED,
    UserActionType.UPDATE_USER_FAILED,
)<User, User, string>();

export const clearUser = createAction(UserActionType.CLEAR_USER)();
