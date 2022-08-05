import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer/Footer';
import { useAppSelector } from '../helpers/hooks';
import { selectAuth } from '../store/rootReducer';
import SideBar from '../components/SideBar';
import './main_layout.scss';
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

            {/* <Routes>
                <Route path="/dashboard" element={<DashBoard />}></Route>
                <Route path="/user" element={<User />}></Route>
            </Routes> */}
        </>
    );
};

export default MainLayout;
