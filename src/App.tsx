import './App.scss';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import MainLayout from './layout/MainLayout';
import DashBoard from './container/MainContainer/components/DashBoard';
import UserManagement from './container/MainContainer/components/UserManagement';
import ProductManagement from './container/MainContainer/components/ProductManagement';
import Profile from './container/MainContainer/components/Profile';
function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<DashBoard />}></Route>
                <Route path="dashboard" element={<DashBoard />}></Route>
                <Route path="profile/:userId" element={<Profile />}></Route>
                <Route path="user-manage" element={<UserManagement />}></Route>
                <Route
                    path="product-manage"
                    element={
                        <AdminRoute>
                            <ProductManagement />
                        </AdminRoute>
                    }
                ></Route>

                <Route path="shop2" element={<Login />}></Route>
                <Route path="shop3" element={<Login />}></Route>
            </Route>
            <Route path="login" element={<Login />}></Route>
            {/* <StaffRoute path="admin" element={<Admin />}></StaffRoute> */}
        </Routes>
    );
}

export default App;
