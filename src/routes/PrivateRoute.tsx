import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../helpers/hooks';
import AuthState from '../models/auth';
import { UserState } from '../models/user';
import { logout } from '../store/auth/auth.action';
import { selectAuth } from '../store/root-reducer';
import { selectUser } from '../store/user/user.reducer';

interface IProps {
    children: JSX.Element;
}

const PrivateRoute = (props: IProps) => {
    const dispatch = useAppDispatch();
    const { userToken } = useAppSelector<AuthState>(selectAuth);
    const { user } = useAppSelector<UserState>(selectUser);
    const { t } = useTranslation(['common']);
    if (userToken !== null && user !== null) {
        if (user.role === 'admin' || user.role === 'staff') return props.children;
        else {
            dispatch(logout());
            toast.error(t('common:noPermission'));
            return <Navigate to={'/login'}></Navigate>;
        }
    } else return <Navigate to={'/login'}></Navigate>;
};
export default PrivateRoute;
