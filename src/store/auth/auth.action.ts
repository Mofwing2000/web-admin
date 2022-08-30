import { User } from 'firebase/auth';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { LoginInput, SignupInput } from '../../models/form';
import { AuthActionsType } from '../../type/auth';

export const loginAsync = createAsyncAction(
    AuthActionsType.LOGIN_START,
    AuthActionsType.LOGIN_START_SUCCEED,
    AuthActionsType.LOGIN_START_FAIL,
)<LoginInput, { token: string }, string>();

export const signupAsync = createAsyncAction(
    AuthActionsType.SIGNUP_START,
    AuthActionsType.SIGNUP_START_SUCCEED,
    AuthActionsType.SIGNUP_START_FAIL,
)<SignupInput, void, string>();

export const logout = createAction(AuthActionsType.LOGOUT)();
