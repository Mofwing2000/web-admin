import { createReducer, Reducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { ActionType } from 'typesafe-actions';
import { User, UsersState } from '../../models/user';
import { UserActionType } from '../../type/user-actions';
import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initState: UsersState = {
    users: null,
    isUserLoading: false,
    error: '',
};

const usersReducer: Reducer<UsersState, AnyAction> = createReducer(initState)
    .handleAction(UserActionType.FETCH_USERS_LIST_START, (state: UsersState) => ({
        ...state,
        isUserLoading: true,
    }))
    .handleAction(UserActionType.FETCH_USERS_LIST_SUCCEED, (state: UsersState, action: PayloadAction<User>) => ({
        ...state,
        isUserLoading: false,
        users: action.payload,
    }))
    .handleAction(UserActionType.FETCH_USERS_LIST_FAILED, (state: UsersState, action: PayloadAction<string>) => ({
        ...state,
        isUserLoading: false,
        error: action.payload,
    }))
    .handleAction(UserActionType.UPDATE_USERS_LIST_START, (state: UsersState) => ({
        ...state,
        isUserLoading: true,
    }))
    .handleAction(UserActionType.UPDATE_USERS_LIST_SUCCEED, (state: UsersState, action: PayloadAction<User>) => ({
        ...state,
        isUserLoading: false,
        users: action.payload,
    }))
    .handleAction(UserActionType.UPDATE_USERS_LIST_FAILED, (state: UsersState, action: PayloadAction<string>) => ({
        ...state,
        isUserLoading: false,
        error: action.payload,
    }))
    .handleAction(UserActionType.DELETE_USERS_LIST_START, (state: UsersState) => ({
        ...state,
        isUserLoading: true,
    }))
    .handleAction(UserActionType.DELETE_USERS_LIST_SUCCEED, (state: UsersState, action: PayloadAction<User>) => ({
        ...state,
        isUserLoading: false,
        users: action.payload,
    }))
    .handleAction(UserActionType.DELETE_USERS_LIST_FAILED, (state: UsersState, action: PayloadAction<string>) => ({
        ...state,
        isUserLoading: false,
        error: action.payload,
    }))
    .handleAction(UserActionType.ADD_USERS_LIST_START, (state: UsersState) => ({
        ...state,
        isUserLoading: true,
    }))
    .handleAction(UserActionType.ADD_USERS_LIST_SUCCEED, (state: UsersState, action: PayloadAction<User>) => ({
        ...state,
        isUserLoading: false,
        users: action.payload,
    }))
    .handleAction(UserActionType.ADD_USERS_LIST_FAILED, (state: UsersState, action: PayloadAction<string>) => ({
        ...state,
        isUserLoading: false,
        error: action.payload,
    }))
    .handleAction(UserActionType.CLEAR_USERS, (state: UsersState) => ({
        ...state,
        isUserLoading: false,
        error: '',
        users: null,
    }));

export default usersReducer;
export const selectUsers = (state: RootState) => state.users;
