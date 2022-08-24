import { User } from './user';
export default interface AuthState {
    isLogged: boolean;
    isLoading: boolean;
    error: string | null;
    currentUser: User | null;
    userToken: string | null;
}
