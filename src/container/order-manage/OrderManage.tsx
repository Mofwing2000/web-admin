import { collection, orderBy, query } from 'firebase/firestore';
import React, { memo, useCallback, useEffect, useState } from 'react';
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

    return (
        <>
            {currentFilteredOrder ? (
                <div className="order-manage">
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
