import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../helpers/hooks';
import AuthState from '../models/auth';
import { UserState } from '../models/user';
import { selectAuth } from '../store/root-reducer';

import { selectUser } from '../store/user/user.reducer';

interface IProps {
    children: JSX.Element;
}

const AdminRoute = (props: IProps) => {
    const { userToken } = useAppSelector<AuthState>(selectAuth);
    const { user } = useAppSelector<UserState>(selectUser);
    if (userToken !== null && user !== null) {
        if (user.role === 'admin') return props.children;
        else return <Navigate to={'/'}></Navigate>;
    } else return <Navigate to={'/login'}></Navigate>;
};
export default AdminRoute;
