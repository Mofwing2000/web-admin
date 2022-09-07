import { createAction, createAsyncAction } from 'typesafe-actions';
import { LoginInput } from '../../models/form';
import { AuthActionsType } from '../../type/auth';

export const loginAsync = createAsyncAction(
    AuthActionsType.LOGIN_START,
    AuthActionsType.LOGIN_START_SUCCEED,
    AuthActionsType.LOGIN_START_FAIL,
)<LoginInput, { token: string }, string>();

export const logout = createAction(AuthActionsType.LOGOUT)();
