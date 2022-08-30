import { DocumentData, Query } from 'firebase/firestore';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { User } from '../../models/user';
import { UserActionType } from '../../type/user-actions';

export const fetchUsersAsync = createAsyncAction(
    UserActionType.FETCH_USERS_LIST_START,
    UserActionType.FETCH_USERS_LIST_SUCCEED,
    UserActionType.FETCH_USERS_LIST_FAILED,
)<Query<DocumentData>, Array<User>, string>();

export const updateUsersAsync = createAsyncAction(
    UserActionType.UPDATE_USERS_LIST_START,
    UserActionType.UPDATE_USERS_LIST_SUCCEED,
    UserActionType.UPDATE_USERS_LIST_FAILED,
)<User, Array<User>, string>();

export const deleteUsersAsync = createAsyncAction(
    UserActionType.DELETE_USERS_LIST_START,
    UserActionType.DELETE_USERS_LIST_SUCCEED,
    UserActionType.DELETE_USERS_LIST_FAILED,
)<string, Array<User>, string>();

export const addUsersAsync = createAsyncAction(
    UserActionType.ADD_USERS_LIST_START,
    UserActionType.ADD_USERS_LIST_SUCCEED,
    UserActionType.ADD_USERS_LIST_FAILED,
)<User, Array<User>, string>();

export const clearUsers = createAction(UserActionType.CLEAR_USERS)();
