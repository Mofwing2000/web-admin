export default interface AuthState {
    isAuthLoading: boolean;
    error: string | null;
    userToken: string | null;
}
