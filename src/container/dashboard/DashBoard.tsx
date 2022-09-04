import { FirebaseError } from '@firebase/util';
import { collection, getDocs, onSnapshot, query, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db } from '../../config/firebase.config';
import { Order, OrderState } from '../../models/order';
import './dashboard.scss';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { useTranslation } from 'react-i18next';
import OrderTable from '../../components/order-table/OrderTable';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { selectProduct } from '../../store/product/product.reducer';
import { ProductState } from '../../models/product';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { monthLabel } from '../../constants/commons';
import { Bar } from 'react-chartjs-2';
const DashBoard = () => {
    const { t } = useTranslation(['common', 'order', 'dashBoard']);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalUser, setTotalUser] = useState<number>(0);
    const [totalOrder, setTotalOrder] = useState<number>(0);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [latestOrders, setLatestOrders] = useState<Order[]>();
    const [thisMonthOrders, setThisMonthOrders] = useState<Order[]>([]);
    const [lastMonthOrders, setLastMonthOrders] = useState<Order[]>([]);
    const [threeMonthsAgoOrders, setThreeMonthsAgoOrders] = useState<Order[]>([]);
    const [fourMonthsAgoOrders, setFourMonthsAgoOrders] = useState<Order[]>([]);
    const [fiveMonthsAgoOrders, setFiveMonthsAgoOrders] = useState<Order[]>([]);
    const [sixMonthsAgoOrders, setSixMonthsAgoOrders] = useState<Order[]>([]);
    const [tooltip, setTooltip] = useState<boolean>(false);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
    const totalOrderOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: t('dashBoard:totalOrder'),
            },
        },
    };
    const totalIncomeOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: t('dashBoard:totalIncome'),
            },
        },
    };

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const productQuery = useMemo(() => query(collection(db, 'product')), []);
    const fetchUserQuery = useMemo(() => query(collection(db, 'user')), []);
    const fetchOrderQuery = useMemo(() => query(collection(db, 'order')), []);
    const today = useMemo(() => new Date(), []);
    const thisMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth()), [today]);
    const lastMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() - 1), [today]);
    const threeMonthsAgo = useMemo(() => new Date(today.getFullYear(), today.getMonth() - 2), [today]);
    const fourMonthsAgo = useMemo(() => new Date(today.getFullYear(), today.getMonth() - 3), [today]);
    const fiveMonthsAgo = useMemo(() => new Date(today.getFullYear(), today.getMonth() - 4), [today]);
    const sixMonthsAgo = useMemo(() => new Date(today.getFullYear(), today.getMonth() - 5), [today]);

    const totalorderData = useMemo(() => {
        return {
            labels: [
                t(`common:${monthLabel[today.getMonth() - 5]}`),
                t(`common:${monthLabel[today.getMonth() - 4]}`),
                t(`common:${monthLabel[today.getMonth() - 3]}`),
                t(`common:${monthLabel[today.getMonth() - 2]}`),
                t(`common:${monthLabel[today.getMonth() - 1]}`),
                t(`common:${monthLabel[today.getMonth()]}`),
            ],
            datasets: [
                {
                    label: t('dashBoard:totalOrder'),
                    data: [
                        sixMonthsAgoOrders.length,
                        fiveMonthsAgoOrders.length,
                        fourMonthsAgoOrders.length,
                        threeMonthsAgoOrders.length,
                        lastMonthOrders.length,
                        thisMonthOrders.length,
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
            ],
        };
    }, [
        today,
        thisMonthOrders,
        lastMonthOrders,
        threeMonthsAgoOrders,
        fourMonthsAgoOrders,
        fiveMonthsAgoOrders,
        sixMonthsAgoOrders,
    ]);

    const incomeData = useMemo(() => {
        return {
            labels: [
                t(`common:${monthLabel[today.getMonth() - 5]}`),
                t(`common:${monthLabel[today.getMonth() - 4]}`),
                t(`common:${monthLabel[today.getMonth() - 3]}`),
                t(`common:${monthLabel[today.getMonth() - 2]}`),
                t(`common:${monthLabel[today.getMonth() - 1]}`),
                t(`common:${monthLabel[today.getMonth()]}`),
            ],
            datasets: [
                {
                    label: t('dashBoard:totalIncome'),
                    data: [
                        sixMonthsAgoOrders.reduce((total, cur) => total + cur.totalAmount, 0),
                        fiveMonthsAgoOrders.reduce((total, cur) => total + cur.totalAmount, 0),
                        fourMonthsAgoOrders.reduce((total, cur) => total + cur.totalAmount, 0),
                        threeMonthsAgoOrders.reduce((total, cur) => total + cur.totalAmount, 0),
                        lastMonthOrders.reduce((total, cur) => total + cur.totalAmount, 0),
                        thisMonthOrders.reduce((total, cur) => total + cur.totalAmount, 0),
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
            ],
        };
    }, [
        today,
        thisMonthOrders,
        lastMonthOrders,
        threeMonthsAgoOrders,
        fourMonthsAgoOrders,
        fiveMonthsAgoOrders,
        sixMonthsAgoOrders,
    ]);

    const totalProduct = useMemo(() => {
        return products.length;
    }, [products]);

    const calculateIncreasePercent = useCallback(
        (after: number, before: number) =>
            before === 0 ? ((after - before) * 100) / 1 : (((after - before) * 100) / before).toFixed(1),
        [],
    );

    useEffect(() => {
        setIsLoading(true);
        const fetchUser = async () => {
            try {
                const docSnap = await getDocs(fetchUserQuery);
                if (!docSnap.empty) setTotalUser(docSnap.docs.length);
                setIsLoading(false);
            } catch (error) {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        dispatch(fetchProductsAsync.request(productQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const fetchOrder = async () => {
            try {
                const docSnap = await getDocs(fetchOrderQuery);
                if (!docSnap.empty) {
                    setTotalOrder(docSnap.docs.length);

                    const totalAmount = docSnap.docs.reduce((total, current) => {
                        return total + (current.data() as Order).totalAmount;
                    }, 0);
                    setTotalIncome(totalAmount);

                    const latestOrdersData = docSnap.docs
                        .sort((a, b) =>
                            ((b.data() as Order).orderDate as unknown as Timestamp).toDate() >
                            ((a.data() as Order).orderDate as unknown as Timestamp).toDate()
                                ? 1
                                : -1,
                        )
                        .splice(0, 5);
                    setLatestOrders([...latestOrdersData.map((order) => order.data() as Order)]);

                    const thisMonthOrdersData = docSnap.docs.filter((orderData) => {
                        const order = orderData.data() as Order;
                        const orderDate = (order.orderDate as unknown as Timestamp).toDate();
                        return orderDate >= thisMonth && orderDate <= today;
                    });
                    setThisMonthOrders([...thisMonthOrdersData.map((order) => order.data() as Order)]);

                    const lastMonthOrdersData = docSnap.docs.filter((orderData) => {
                        const order = orderData.data() as Order;
                        const orderDate = (order.orderDate as unknown as Timestamp).toDate();
                        return orderDate >= lastMonth && orderDate < thisMonth;
                    });
                    setLastMonthOrders([...lastMonthOrdersData.map((order) => order.data() as Order)]);

                    const threeMonthsAgoOrdersData = docSnap.docs.filter((orderData) => {
                        const order = orderData.data() as Order;
                        const orderDate = (order.orderDate as unknown as Timestamp).toDate();
                        return orderDate >= threeMonthsAgo && orderDate < lastMonth;
                    });
                    setThreeMonthsAgoOrders([...threeMonthsAgoOrdersData.map((order) => order.data() as Order)]);

                    const fourMonthsAgoOrdersData = docSnap.docs.filter((orderData) => {
                        const order = orderData.data() as Order;
                        const orderDate = (order.orderDate as unknown as Timestamp).toDate();
                        return orderDate >= fourMonthsAgo && orderDate < threeMonthsAgo;
                    });
                    setFourMonthsAgoOrders([...fourMonthsAgoOrdersData.map((order) => order.data() as Order)]);

                    const fiveMonthsAgoOrdersData = docSnap.docs.filter((orderData) => {
                        const order = orderData.data() as Order;
                        const orderDate = (order.orderDate as unknown as Timestamp).toDate();
                        return orderDate >= fiveMonthsAgo && orderDate < fourMonthsAgo;
                    });
                    setFiveMonthsAgoOrders([...fiveMonthsAgoOrdersData.map((order) => order.data() as Order)]);

                    const sixMonthsAgoOrdersData = docSnap.docs.filter((orderData) => {
                        const order = orderData.data() as Order;
                        const orderDate = (order.orderDate as unknown as Timestamp).toDate();
                        return orderDate >= sixMonthsAgo && orderDate < fiveMonthsAgo;
                    });
                    setSixMonthsAgoOrders([...sixMonthsAgoOrdersData.map((order) => order.data() as Order)]);
                }
                setIsLoading(false);
            } catch (error) {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            }
        };

        fetchOrder();
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
                    <div className="row">
                        <h3 className="text-center mt-5">{t('dashBoard:thisMonthStatistic')}</h3>
                        <div className="col-4 d-flex flex-grow-1 align-items-center">
                            <div className="dashboard__cards__item card w-100">
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
                                                calculateIncreasePercent(
                                                    thisMonthOrders.length,
                                                    lastMonthOrders.length,
                                                ) > 0
                                                    ? 'text-success'
                                                    : 'text-danger'
                                            }`}
                                        >
                                            {calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length)}%
                                        </span>
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="mb-0">vs {t('dashBoard:lastMonth')}</p>
                                    <span
                                        className={`${
                                            calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length) > 0
                                                ? 'text-success'
                                                : 'text-danger'
                                        }`}
                                    >
                                        {calculateIncreasePercent(thisMonthOrders.length, lastMonthOrders.length) >
                                        0 ? (
                                            <i className="fa-solid fa-angle-up"></i>
                                        ) : (
                                            <i className="fa-solid fa-angle-dơn"></i>
                                        )}
                                        {thisMonthOrders.length - lastMonthOrders.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-8">
                            <Bar options={totalOrderOptions} data={totalorderData} />
                        </div>
                    </div>
                </div>
                <Bar className="mb-5" options={totalIncomeOptions} data={incomeData} />
                <div className="dashboard__latest-transaction">
                    <p className="fw-bold fs-4">{t('dashBoard:latestOrders')}</p>
                    {latestOrders && <OrderTable ordersData={latestOrders} />}
                </div>
            </div>
            {(isLoading || isProductLoading) && <LoadingModal />}
        </>
    );
};

export default memo(DashBoard);
