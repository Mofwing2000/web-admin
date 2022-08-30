import { createReducer, Reducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { ActionType } from 'typesafe-actions';
import { User, UserState } from '../../models/user';
import { UserActionType } from '../../type/user-actions';
import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initState: UserState = {
    user: null,
    isUserLoading: false,
    error: '',
};

const userReducer: Reducer<UserState, AnyAction> = createReducer(initState)
    .handleAction(UserActionType.FETCH_USER_START, (state: UserState) => ({
        ...state,
        isUserLoading: true,
    }))
    .handleAction(UserActionType.FETCH_USER_SUCCEED, (state: UserState, action: PayloadAction<User>) => ({
        ...state,
        isUserLoading: false,
        user: action.payload,
    }))
    .handleAction(UserActionType.FETCH_USER_FAILED, (state: UserState, action: PayloadAction<string>) => ({
        ...state,
        isUserLoading: false,
        error: action.payload,
    }))
    .handleAction(UserActionType.UPDATE_USER_START, (state: UserState) => ({
        ...state,
        isUserLoading: true,
    }))
    .handleAction(UserActionType.UPDATE_USER_SUCCEED, (state: UserState, action: PayloadAction<User>) => ({
        ...state,
        isUserLoading: false,
        user: action.payload,
    }))
    .handleAction(UserActionType.UPDATE_USER_FAILED, (state: UserState, action: PayloadAction<string>) => ({
        ...state,
        isUserLoading: false,
        error: action.payload,
    }))
    .handleAction(UserActionType.CLEAR_USER, (state: UserState) => ({
        ...state,
        isUserLoading: false,
        error: '',
        user: null,
    }));

export default userReducer;
export const selectUser = (state: RootState) => state.user;
