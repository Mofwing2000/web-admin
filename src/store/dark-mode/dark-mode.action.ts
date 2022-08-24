import { createAction } from 'typesafe-actions';
import { DarkModeActionsType } from '../../type/display-mode';

export const toggleDarkMode = createAction(DarkModeActionsType.TOGGLE_DARK_MODE)();
