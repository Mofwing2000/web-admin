import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import { useAppSelector } from '../helpers/hooks';
import { selectAuth } from '../store/root-reducer';
import SideBar from '../components/sidebar/SideBar';
import './main-layout.scss';
const MainLayout = () => {
    const { currentUser } = useAppSelector<any>(selectAuth);

    return (
        <>
            <Header />
            <main>
                <SideBar />
                <div className="main-content">
                    <Outlet context={currentUser} />
                </div>
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;
