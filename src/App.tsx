import React, { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import DashBoard from './container/dashboard/DashBoard';
import EditUserProfile from './container/edit-user-profile/EditUserProfile';
import ProductEdit from './container/product-edit/ProductEdit';
import ProductManage from './container/product-manage/ProductManage';
import ProductProfile from './container/product-profile/ProductProfile';
import UserManagement from './container/user-manage/UserManage';
import UserProfile from './container/user-profile/UserProfile';
import { useAppSelector } from './helpers/hooks';
import MainLayout from './layout/MainLayout';
import { DisplayModeState } from './models/display-mode';
import Login from './pages/Login';
import AdminRoute from './routes/AdminRoute';
import PrivateRoute from './routes/PrivateRoute';
import { selectDarkMode } from './store/dark-mode/dark-mode.reducer';
import OrderDetail from './container/order-detail/OrderDetail';
import OrderManage from './container/order-manage/OrderManage';

import 'react-toastify/dist/ReactToastify.css';
import 'swiper/css';
import './App.scss';
import CollectionManagePanel from './container/collection-manage-panel/CollectionManagePanel';
import { CollectionAction } from './type/collection-manage';
import CollectionView from './container/collection-view/CollectionView';
import ForgotPassword from './container/ForgotPassword';
import CollectionManage from './container/collection-manage/CollectionManage';
import CollectionEdit from './container/collection-edit/CollectionEdit';

function App() {
    const { mode } = useAppSelector<any>(selectDarkMode) as DisplayModeState;
    useEffect(() => {
        const body = document.getElementsByTagName('body')[0];
        if (mode === 'dark') body.style.backgroundColor = '#262626';
        else body.style.backgroundColor = 'unset';
    }, [mode]);
    return (
        <div className="app position-relative" data-theme={mode}>
            <Suspense fallback={null}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <MainLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<ProductManage />}></Route>
                        <Route
                            path="dashboard"
                            element={
                                <AdminRoute>
                                    <DashBoard />
                                </AdminRoute>
                            }
                        ></Route>

                        <Route path="user">
                            <Route
                                index
                                element={
                                    <AdminRoute>
                                        <UserManagement />
                                    </AdminRoute>
                                }
                            ></Route>
                            <Route
                                path="view/:userId/*"
                                element={
                                    <AdminRoute>
                                        <UserProfile />
                                    </AdminRoute>
                                }
                            ></Route>
                            <Route
                                path="edit/:userId/*"
                                element={
                                    <AdminRoute>
                                        <EditUserProfile />
                                    </AdminRoute>
                                }
                            ></Route>
                        </Route>
                        <Route path="product">
                            <Route index element={<ProductManage />}></Route>
                            <Route path="view/:productId/*" element={<ProductProfile />}></Route>
                            <Route path="edit/:productId/*" element={<ProductEdit />}></Route>
                        </Route>

                        <Route path="order">
                            <Route index element={<OrderManage />}></Route>
                            <Route path="detail/:orderId" element={<OrderDetail />}></Route>
                        </Route>
                        <Route path="collection">
                            <Route index element={<CollectionManage />}></Route>
                            <Route path="edit/:collectionId" element={<CollectionEdit />}></Route>
                            <Route path="view/:collectionId" element={<CollectionView />}></Route>
                        </Route>
                    </Route>
                    <Route path="login" element={<Login />}></Route>
                    <Route path="forgot-password" element={<ForgotPassword />}></Route>
                    {/* <StaffRoute path="admin" element={<Admin />}></StaffRoute> */}
                </Routes>
            </Suspense>

            <ToastContainer />
        </div>
    );
}

export default App;
