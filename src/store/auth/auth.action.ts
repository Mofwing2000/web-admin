import { createAction, createAsyncAction } from 'typesafe-actions';
import { LoginInput } from '../../models/auth';
export enum AuthActionsType {
    LOGIN_START = 'auth/LOGIN_START',
    LOGIN_START_SUCCEED = 'auth/LOGIN_START_SUCCEED',
    LOGIN_START_FAIL = 'auth/LOGIN_START_FAIL',
    LOGOUT = 'auth/LOGOUT',
}

export const loginAsync = createAsyncAction(
    AuthActionsType.LOGIN_START,
    AuthActionsType.LOGIN_START_SUCCEED,
    AuthActionsType.LOGIN_START_FAIL,
)<LoginInput, {}, string>();

export const logout = createAction(AuthActionsType.LOGOUT)();
