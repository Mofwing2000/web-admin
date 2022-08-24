import { createReducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { AuthActionsType } from '../../type/auth';

const initialState: AuthState = {
    isLogged: false,
    isLoading: false,
    error: null,
    currentUser: null,
    userToken: null,
};

interface IAction {
    type: string;
    payload: any;
}

const authReducer = createReducer(initialState)
    .handleAction(AuthActionsType.LOGIN_START, (state: AuthState) => ({ ...state, isLoading: true }))
    .handleAction(AuthActionsType.LOGIN_START_SUCCEED, (state: AuthState, action: IAction) => ({
        ...state,
        isLoading: false,
        isLogged: true,
        currentUser: action.payload.user,
        userToken: action.payload.token,
    }))
    .handleAction(AuthActionsType.LOGIN_START_FAIL, (state: AuthState, action: IAction) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(AuthActionsType.LOGOUT, (state: AuthState) => ({
        ...state,
        isLoading: false,
        isLogged: false,
        currentUser: null,
        userToken: null,
        error: null,
    }));
export default authReducer;
