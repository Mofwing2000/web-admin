import React, { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import DashBoard from './container/MainContainer/components/dashboard/DashBoard';
import EditUserProfile from './container/MainContainer/components/edit-user-profile/EditUserProfile';
import ProductEdit from './container/MainContainer/components/product-edit/ProductEdit';
import ProductManage from './container/MainContainer/components/product-manage/ProductManage';
import ProductProfile from './container/MainContainer/components/product-profile/ProductProfile';
import UserManagement from './container/MainContainer/components/user-manage/UserManage';
import UserProfile from './container/MainContainer/components/user-profile/UserProfile';
import { useAppSelector } from './helpers/hooks';
import MainLayout from './layout/MainLayout';
import { DisplayModeState } from './models/display-mode';
import Login from './pages/Login';
import AdminRoute from './routes/AdminRoute';
import PrivateRoute from './routes/PrivateRoute';
import { selectDarkMode } from './store/dark-mode/dark-mode.reducer';
import OrderDetail from './container/MainContainer/components/order-detail/OrderDetail';
import OrderManage from './container/MainContainer/components/order-manage/OrderManage';

import 'react-toastify/dist/ReactToastify.css';
import 'swiper/css';
import './App.scss';
import CollectionManagePanel from './container/MainContainer/components/collection-manage-panel/CollectionManagePanel';
import { CollectionAction } from './type/collection-manage';
import CollectionView from './container/MainContainer/components/collection-view/CollectionView';

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
                        <Route index element={<DashBoard />}></Route>
                        <Route path="dashboard" element={<DashBoard />}></Route>

                        <Route path="user">
                            <Route
                                index
                                element={
                                    <AdminRoute>
                                        <UserManagement />
                                    </AdminRoute>
                                }
                            ></Route>
                            <Route path="view/:userId/*" element={<UserProfile />}></Route>
                            <Route path="edit/:userId/*" element={<EditUserProfile />}></Route>
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
                            <Route index element={<CollectionManagePanel action={CollectionAction.ADD} />}></Route>
                            <Route path="view/:collectionId" element={<CollectionView />}></Route>
                        </Route>
                    </Route>
                    <Route path="login" element={<Login />}></Route>
                    {/* <StaffRoute path="admin" element={<Admin />}></StaffRoute> */}
                </Routes>
            </Suspense>

            <ToastContainer />
        </div>
    );
}

export default App;