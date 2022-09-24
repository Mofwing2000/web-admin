import { FirebaseError } from '@firebase/util';
import { collection, doc, getDoc, limit, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { OrdersState } from '../../models/order';
import { User, UserState } from '../../models/user';
import { clearOrders, fetchOrdersAsync } from '../../store/order/order.action';
import { selectOrders } from '../../store/order/order.reducer';
import { selectUser } from '../../store/user/user.reducer';
import OrderTable from '../../components/order-table/OrderTable';
import './user-profile.scss';
const UserProfile = () => {
    const { t } = useTranslation(['common', 'user']);
    const { orders, isOrdersLoading } = useAppSelector<OrdersState>(selectOrders);
    const { userId } = useParams();
    const { user, isUserLoading } = useAppSelector<UserState>(selectUser);
    const [userData, setUserData] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const orderQuery = useMemo(() => {
        if (user)
            return query(
                collection(db, 'order'),
                where('userId', '==', userId),
                orderBy('orderDate', 'desc'),
                limit(5),
            );
    }, [user, userId]);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            const docRef = doc(db, 'user', userId as string);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setUserData(docSnap.data() as User);
                setIsLoading(false);
            } catch (error) {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            }
        };
        fetch();
    }, [userId]);
    useEffect(() => {
        if (user) if (user.id !== userId && user.role !== 'admin') navigate(-1);
    }, [user, userId]);

    useEffect(() => {
        if (orderQuery) dispatch(fetchOrdersAsync.request(orderQuery));

        return () => {
            dispatch(clearOrders());
        };
    }, [orderQuery]);
    console.log(orders);

    return (
        <>
            {userData && user ? (
                <div className="user-profile">
                    <div className="user-profile__info row gx-5">
                        <div className="user-profile__info__avatar col-6">
                            <div
                                className="user-profile__info__avatar__item"
                                style={{ backgroundImage: `url(${userData.photoUrl})` }}
                            ></div>
                        </div>
                        <div className="user-profile__info__detail col-6">
                            <div className="user-profile__info__detail__first-name">
                                <span className="info-label">{t('user:firstName')}: </span>
                                {userData.firstName}
                            </div>
                            <div className="user-profile__info__detail__last-name">
                                <span className="info-label">{t('user:lastName')}: </span>
                                {userData.lastName}
                            </div>
                            <div className="user-profile__info__detail__email">
                                <span className="info-label">Email: </span>
                                {userData.email}
                            </div>
                            <div className="user-profile__info__detail__phone-number">
                                <span className="info-label">{t('user:phoneNumber')}: </span>
                                {userData.phoneNumber}
                            </div>
                            <div className="user-profile__info__detail__address">
                                <span className="info-label">{t('user:address')}: </span>
                                {userData.address}
                            </div>
                            <div className="user-profile__info__detail__role">
                                <span className="info-label">{t('user:role')}: </span>
                                {t(`user:${userData.role}`)}
                            </div>
                        </div>
                    </div>
                    <div className="user-profile__navigate mt-5 d-flex d-flex justify-content-center align-items-center gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                navigate(`/user/edit/${userData.id}`);
                            }}
                        >
                            {t('common:edit')}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                navigate(-1);
                            }}
                        >
                            {t('common:close')}
                        </button>
                    </div>
                    <div className="user-profile__order mt-5">
                        <h4>{t('common:latestOrders')}</h4>
                        {orders && <OrderTable ordersData={orders} />}
                    </div>
                </div>
            ) : (
                <div className="user-profile text-center">
                    <p>{t('common:noData')}</p>
                </div>
            )}
            {(isLoading || isUserLoading || isOrdersLoading) && <LoadingModal />}
        </>
    );
};

export default UserProfile;
