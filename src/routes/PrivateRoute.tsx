import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../helpers/hooks';
import AuthState from '../models/auth';
import { selectAuth } from '../store/root-reducer';

interface IProps {
    children: JSX.Element;
}

const PrivateRoute = (props: IProps) => {
    const { userToken } = useAppSelector<AuthState>(selectAuth);
    if (userToken !== null) return props.children;
    else return <Navigate to={'/login'}></Navigate>;
};
export default PrivateRoute;
