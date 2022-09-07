import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { createReducer, Reducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { AuthActionsType } from '../../type/auth';

const initialState: AuthState = {
    isAuthLoading: false,
    error: null,
    userToken: null,
};

const authReducer: Reducer<AuthState, AnyAction> = createReducer(initialState)
    .handleAction(AuthActionsType.LOGIN_START, (state: AuthState) => ({ ...state, isLoading: true }))
    .handleAction(
        AuthActionsType.LOGIN_START_SUCCEED,
        (state: AuthState, action: PayloadAction<{ token: string }>) => ({
            ...state,
            isLoading: false,
            userToken: action.payload.token,
        }),
    )
    .handleAction(AuthActionsType.LOGIN_START_FAIL, (state: AuthState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(AuthActionsType.LOGOUT, (state: AuthState) => ({
        ...state,
        isLoading: false,
        userToken: null,
        error: null,
    }));

export default authReducer;
