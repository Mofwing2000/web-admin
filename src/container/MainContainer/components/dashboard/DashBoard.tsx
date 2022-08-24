import { FirebaseError } from '@firebase/util';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db } from '../../../../config/firebase.config';
import { Order, OrderState } from '../../../../models/order';
import './dashboard.scss';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import LoadingModal from '../../../../components/loading-modal/LoadingModal';
import { useTranslation } from 'react-i18next';
import OrderTable from '../../../../components/order-table/OrderTable';
const DashBoard = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalUser, setTotalUser] = useState<number>(0);
    const [totalProduct, setTotalProduct] = useState<number>(0);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [latestOrders, setLatestOrders] = useState<Order[]>();
    const [thisMonthOrders, setThisMonthOrders] = useState<Order[]>([]);
    const [lastMonthOrders, setLastMonthOrders] = useState<Order[]>([]);
    const [tooltip, setTooltip] = useState<boolean>(false);
    const { t } = useTranslation(['dashBoard']);
    const navigate = useNavigate();

    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth());
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);

    const calculateIncreasePercent = (after: number, before: number) =>
        before === 0 ? ((after - before) * 100) / 1 : ((after - before) * 100) / before;

    const handleView = (data: Order) => {
        navigate(`/order/detail/${data.id}`);
    };
    useEffect(() => {
        setIsLoading(true);
        const fetchQuery = query(collection(db, 'user'));
        const unsub = onSnapshot(
            fetchQuery,
            (snapShot) => {
                setTotalUser(snapShot.docs.length);
                setIsLoading(false);
            },
            (error) => {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            },
        );
        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const fetchQuery = query(collection(db, 'product'));
        const unsub = onSnapshot(
            fetchQuery,
            (snapShot) => {
                setTotalProduct(snapShot.docs.length);
                setIsLoading(false);
            },
            (error) => {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            },
        );
        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const fetchQuery = query(collection(db, 'order'));
        const unsub = onSnapshot(
            fetchQuery,
            (snapShot) => {
                setTotalOrder(snapShot.docs.length);

                const totalAmount = snapShot.docs.reduce((total, current) => {
                    return total + (current.data() as Order).totalAmount;
                }, 0);
                setTotalIncome(totalAmount);

                const latestOrdersData = snapShot.docs
                    .sort((a, b) =>
                        ((b.data() as Order).orderDate as unknown as Timestamp).toDate() >
                        ((a.data() as Order).orderDate as unknown as Timestamp).toDate()
                            ? 1
                            : -1,
                    )
                    .splice(0, 5);
                setLatestOrders([...latestOrdersData.map((order) => order.data() as Order)]);

                const thisMonthOrdersData = snapShot.docs.filter((orderData) => {
                    const order = orderData.data() as Order;
                    const orderDate = (order.orderDate as unknown as Timestamp).toDate();
                    return orderDate >= thisMonth && orderDate <= today;
                });
                setThisMonthOrders([...thisMonthOrdersData.map((order) => order.data() as Order)]);

                const lastMonthOrdersData = snapShot.docs.filter((orderData) => {
                    const order = orderData.data() as Order;
                    const orderDate = (order.orderDate as unknown as Timestamp).toDate();
                    return orderDate >= lastMonth && orderDate < thisMonth;
                });
                setLastMonthOrders([...lastMonthOrdersData.map((order) => order.data() as Order)]);

                setIsLoading(false);
            },
            (error) => {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            },
        );
        return () => {
            unsub();
        };
    }, []);

    return (
        <>
            <div className="dashboard ">
                <div className="dashboard__cards row gy-2 mb-5">
                    <div className="col-xl-3 col-lg-6">
                        <div className="dashboard__cards__item dashboard__cards__item__user card ">
                            <h5 className="dashboard__cards__item__title fw-bold mb-3 text-uppercase">
                                {t('dashBoard:totalUser')}
                            </h5>
                            <p className="dashboard__cards__item__count fs-5 text-white">{totalUser}</p>
                            <div className="d-flex justify-content-between text-white">
                                <Link to="/user">{t('dashBoard:viewUsersList')}</Link>
                                <i className="fa-solid fa-user"></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6">
                        <div className="dashboard__cards__item dashboard__cards__item__product card ">
                            <h5 className="dashboard__cards__item__title fw-bold mb-3 text-uppercase">
                                {t('dashBoard:totalProduct')}
                            </h5>
                            <p className="dashboard__cards__item__count fs-5 ">{totalProduct}</p>
                            <div className="d-flex justify-content-between">
                                <Link to="/product">{t('dashBoard:viewProductsList')}</Link>
                                <i className="fa-solid fa-shirt"></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6">
                        <div className="dashboard__cards__item dashboard__cards__item__order card ">
                            <h5 className="dashboard__cards__item__title fw-bold mb-3 text-uppercase">
                                {t('dashBoard:totalOrder')}
                            </h5>
                            <p className="dashboard__cards__item__count fs-5 ">{totalOrder}</p>
                            <div className="d-flex justify-content-between">
                                <Link to="/order">{t('dashBoard:viewOrdersList')}</Link>
                                <i className="fa-solid fa-cart-shopping"></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6">
                        <div className="dashboard__cards__item dashboard__cards__item__income card ">
                            <h5 className="dashboard__cards__item__title fw-bold mb-3 text-uppercase">
                                {t('dashBoard:totalIncome')}
                            </h5>
                            <p className="dashboard__cards__item__count fs-5 ">{totalIncome}$</p>
                            <div className="d-flex justify-content-between">
                                <Link to="/order">{t('dashBoard:viewOrdersList')}</Link>
                                <i className="fa-solid fa-wallet"></i>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-center mt-5">{t('dashBoard:thisMonthStatistic')}</h3>
                    <div className="col-4">
                        <div className="dashboard__cards__item card">
                            <h5 className="dashboard__cards__item__title fw-bold mb-3 text-uppercase">
                                {t('dashBoard:totalOrder')}
                            </h5>
                            <div>
                                <p className="dashboard__cards__item__sub-title text-center ">
                                    {t('dashBoard:totalOrderThisMonth')}
                                </p>
                                <p className="dashboard__cards__item__count fs-1 text-center h2 position-relative">
                                    {thisMonthOrders.length}
                                    <span
                                        className={`dashboard__cards__item__count__percent position-absolute ${
                                            calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length) > 0
                                                ? 'text-success'
                                                : 'text-danger'
                                        }`}
                                    >
                                        {calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length) > 0
                                            ? '+' +
                                              calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length)
                                            : '-' +
                                              calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length)}
                                        %
                                    </span>
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="mb-0">{t('dashBoard:lastMonth')}</p>
                                <span
                                    className={`${
                                        calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length) > 0
                                            ? 'text-success'
                                            : 'text-danger'
                                    }`}
                                >
                                    {calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length) > 0 ? (
                                        <i className="fa-solid fa-angle-up"></i>
                                    ) : (
                                        <i className="fa-solid fa-angle-dơn"></i>
                                    )}
                                    {thisMonthOrders.length - lastMonthOrders.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="dashboard__latest-transaction">
                    <p className="fw-bold fs-4">{t('dashBoard:latestOrders')}</p>
                    {latestOrders && <OrderTable ordersData={latestOrders} />}
                </div>
            </div>
            {isLoading && <LoadingModal />}
        </>
    );
};

export default DashBoard;
