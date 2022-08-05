import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { logout } from '../../store/auth/auth.action';

const Home = () => {
    const nav = useNavigate();
    const dispatch = useAppDispatch();
    const handleOnClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        dispatch(logout());
    };
    return (
        <div>
            <button
                onClick={() => {
                    nav('/login');
                }}
            >
                asdf
            </button>
            <button onClick={handleOnClick}>logout</button>
            Homesdfasfasdfasdfasdfasdfasdf
        </div>
    );
};

export default Home;
