import { AnyAction } from 'redux';
import { createReducer, Reducer } from 'typesafe-actions';
import { DisplayModeState } from '../../models/display-mode';
import { DarkModeActionsType, DisplayMode } from '../../type/display-mode';
import { RootState } from '../store';

const initialState: DisplayModeState = {
    mode: 'light',
};

const darkModeReducer: Reducer<DisplayModeState, AnyAction> = createReducer(initialState).handleAction(
    DarkModeActionsType.TOGGLE_DARK_MODE,
    (state: DisplayModeState) => ({ ...state, mode: state.mode === 'light' ? 'dark' : 'light' }),
);

export default darkModeReducer;
export const selectDarkMode = (state: RootState) => state.darkMode;
