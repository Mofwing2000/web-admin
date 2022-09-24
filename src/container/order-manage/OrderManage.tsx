import { collection, orderBy, query } from 'firebase/firestore';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import OrderFilterBar from '../../components/order-filter-bar/OrderFilterBar';
import OrderTable from '../../components/order-table/OrderTable';
import Pagination from '../../components/pagination/Pagination';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { Order, OrdersState } from '../../models/order';
import { clearOrders, fetchOrdersAsync } from '../../store/order/order.action';
import { selectOrders } from '../../store/order/order.reducer';
import { PageLimit, PageOrder, PageOrderSort } from '../../type/page-type';

import './order-manage.scss';
const OrderManage = () => {
    const { orders, isOrdersLoading } = useAppSelector<OrdersState>(selectOrders);
    const [pageSize, setPageSize] = useState<PageLimit>(10);
    const [sortType, setSortType] = useState<PageOrderSort>('orderDate');
    const [sortOrder, setSortOrder] = useState<PageOrder>('asc');
    const [pageCount, setPageCount] = useState<number>(0);
    const [itemOffset, setItemOffset] = useState<number>(0);
    const [currentFilteredOrder, setCurrentFilteredOrder] = useState<Order[]>([]);
    const dispatch = useAppDispatch();
    const [currentPage, setCurrentPage] = useState<number>(0);

    const orderQuery = query(collection(db, 'order'));

    const [searchValue, setSearchValue] = useState<string>('');
    const searchResultRef = useRef<HTMLUListElement>(null);

    const handlePageClick = useCallback(
        (event: { selected: number }) => {
            if (orders) {
                const newOffset = (event.selected * pageSize) % orders.length;
                setItemOffset(newOffset);
            }
            setCurrentPage(event.selected);
        },
        [orders],
    );

    useEffect(() => {
        if (orders) {
            const endOffset = itemOffset + pageSize;
            setCurrentFilteredOrder(orders.slice(itemOffset, endOffset));
            setPageCount(Math.ceil(orders.length / pageSize));
        }
    }, [itemOffset, orders, pageSize]);

    useEffect(() => {
        const filterQuery = query(collection(db, 'order'), orderBy(sortType, sortOrder));
        dispatch(fetchOrdersAsync.request(filterQuery));
        return () => {
            dispatch(clearOrders());
        };
    }, [pageSize, sortType, sortOrder]);

    useEffect(() => {
        dispatch(fetchOrdersAsync.request(orderQuery));

        return () => {
            dispatch(clearOrders());
        };
    }, []);

    return (
        <>
            {currentFilteredOrder ? (
                <div className="order-manage">
                    <div className="row d-flex justify-content-end">
                        <div className="col-xl-3 col-4">
                            <div className="order-manage__search input-group position-relative">
                                <input
                                    type="search"
                                    className="form-control"
                                    aria-describedby="search"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onFocus={() => {
                                        searchResultRef.current!.style.display = 'flex';
                                    }}
                                    onBlur={() => {
                                        searchResultRef.current!.style.display = 'none';
                                    }}
                                />
                                <span className="input-group-text">
                                    <i className="fa fa-search" id="search"></i>
                                </span>
                                <ul
                                    className="order-manage__search__list position-absolute light-bg w-100 justify-content-center align-items-center flex-column"
                                    ref={searchResultRef}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    {useMemo(
                                        () =>
                                            searchValue &&
                                            orders &&
                                            orders
                                                .filter(
                                                    (order) =>
                                                        order.id &&
                                                        order.id.toLowerCase().includes(searchValue.toLowerCase()),
                                                )
                                                .slice(0, 5)
                                                .map((order, index) => (
                                                    <li
                                                        key={index}
                                                        className="order-manage__search__list__item p-3 w-100"
                                                    >
                                                        <div className="order-manage__search__list__item__content d-flex justify-content-between">
                                                            <Link to={`detail/${order.id}`} replace={true}>
                                                                <p className="m-0 fw-bold">{order.id}</p>
                                                            </Link>
                                                        </div>
                                                    </li>
                                                )),
                                        [orders, searchValue],
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="order-manage__filter">
                        <div className="order-manage__filter__control d-flex gap-5 mt-5">
                            <OrderFilterBar
                                pageSize={pageSize}
                                sortType={sortType}
                                sortOrder={sortOrder}
                                setPageSize={setPageSize}
                                setSortType={setSortType}
                                setSortOrder={setSortOrder}
                                setPage={handlePageClick}
                            />
                        </div>
                    </div>
                    <div className="order-manage__table">
                        {currentFilteredOrder && <OrderTable ordersData={currentFilteredOrder} />}
                    </div>
                    <div className="order-manage__table__pagination">
                        {orders && (
                            <Pagination onPageChange={handlePageClick} pageCount={pageCount} curPage={currentPage} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="order-manage__filter text-center">
                    <p>No data</p>
                </div>
            )}
            {isOrdersLoading && <LoadingModal />}
        </>
    );
};

export default memo(OrderManage);
