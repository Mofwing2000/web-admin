import { FirebaseError } from '@firebase/util';
import {
    collection,
    DocumentData,
    endBefore,
    limit,
    limitToLast,
    onSnapshot,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import OrderTable from '../../components/order-table/OrderTable';
import Pagination from '../../components/pagination/Pagination';
import { db } from '../../config/firebase.config';
import { Order } from '../../models/order';
import { PageLimit, PageOrder, PageOrderSort } from '../../type/page-type';

const OrderManage = () => {
    const [ordersData, setOrdersData] = useState<Order[]>();
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData>>();
    const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData>>();
    const [curPage, setCurPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<PageLimit>(10);
    const [sortType, setSortType] = useState<PageOrderSort>('default');
    const [sortOrder, setSortOrder] = useState<PageOrder>('asc');
    const [isLoading, setIsLoading] = useState<boolean>();
    const { t } = useTranslation(['common', 'order']);
    const sortTypeValue =
        sortType === 'default' ? 'orderDate' : sortType === 'orderState' ? 'orderState' : 'totalAmount';
    const sortOrderValue = sortOrder === 'asc' ? 'asc' : 'desc';

    const handleNextPage = () => {
        setIsLoading(true);
        const filterQueryNext = query(
            collection(db, 'order'),
            limit(pageSize as number),
            orderBy(sortTypeValue, sortOrderValue),
            startAfter(lastDoc),
        );
        onSnapshot(
            filterQueryNext,
            (snapShot) => {
                let list: Array<Order> = [];
                snapShot.docs.forEach((docItem) => {
                    list.push({ ...docItem.data() } as Order);
                });
                setOrdersData(list);
                setLastDoc(snapShot.docs[snapShot.docs.length - 1]);
                setFirstDoc(snapShot.docs[0]);
                setCurPage(curPage + 1);
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                if (error instanceof FirebaseError) toast.error(error.message);
            },
        );
    };

    const handlePrevPage = () => {
        setIsLoading(true);
        const filterQueryNext = query(
            collection(db, 'order'),
            limit(pageSize as number),
            orderBy(sortTypeValue, sortOrderValue),
            endBefore(firstDoc),
            limitToLast(pageSize),
        );
        onSnapshot(
            filterQueryNext,
            (snapShot) => {
                console.log(snapShot);
                let list: Array<Order> = [];
                snapShot.docs.forEach((docItem) => {
                    list.push({ ...docItem.data() } as Order);
                });
                setFirstDoc(snapShot.docs[0]);
                setLastDoc(snapShot.docs[snapShot.docs.length - 1]);
                setOrdersData(list);
                setCurPage(curPage - 1);
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                if (error instanceof FirebaseError) toast.error(error.message);
            },
        );
    };

    useEffect(() => {
        setIsLoading(true);
        setCurPage(1);
        const filterQuery = query(
            collection(db, 'order'),
            limit(pageSize as number),
            orderBy(
                sortType === 'default' ? 'orderDate' : sortType === 'orderState' ? 'orderState' : 'totalAmount',
                sortOrder === 'asc' ? 'asc' : 'desc',
            ),
        );
        const unsub = onSnapshot(
            filterQuery,
            (snapShot) => {
                let list: Array<Order> = [];
                snapShot.docs.forEach((docItem) => {
                    list.push({ ...docItem.data() } as Order);
                });
                setLastDoc(snapShot.docs[snapShot.docs.length - 1]);
                setFirstDoc(snapShot.docs[0]);
                setOrdersData(list);
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                if (error instanceof FirebaseError) toast.error(error.message);
                console.log(error);
            },
        );
        return () => {
            unsub();
        };
    }, [pageSize, sortType, sortOrder]);

    return (
        <>
            {ordersData ? (
                <div className="order-manage">
                    <div className="order-manage__filter">
                        <div className="order-manage__filter__control d-flex gap-5 mt-5">
                            <div className="form-group">
                                <label htmlFor="pageLimit">{t('common:itemsPerPage')}:</label>
                                <select
                                    defaultValue={10}
                                    id="pageLimit"
                                    className="form-select "
                                    aria-label="pageLimit-select"
                                    onChange={(e) =>
                                        setPageSize(e.target.value === '10' ? 10 : e.target.value === '20' ? 20 : 50)
                                    }
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="sort">{t('common:sortBy')}:</label>
                                <div className="d-flex">
                                    <select
                                        defaultValue={10}
                                        id="sort"
                                        className="form-select "
                                        aria-label="sort-select"
                                        onChange={(e) =>
                                            setSortType(
                                                e.target.value === 'default'
                                                    ? 'default'
                                                    : e.target.value === 'orderState'
                                                    ? 'orderState'
                                                    : 'totalAmount',
                                            )
                                        }
                                    >
                                        <option value="default">{t('common:sortBy')}:</option>
                                        <option value="orderState">{t('order:orderState')}</option>
                                        <option value="totalAmount">{t('order:totalAmount')}</option>
                                    </select>
                                    <button
                                        className="btn btn-outline-secondary d-inline-block"
                                        onClick={() => {
                                            if (sortOrder === 'asc') {
                                                setSortOrder('desc');
                                            } else setSortOrder('asc');
                                        }}
                                    >
                                        {sortOrder === 'asc' ? (
                                            <i className="fa-solid fa-arrow-down-a-z"></i>
                                        ) : (
                                            <i className="fa-solid fa-arrow-up-a-z"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-manage__table">{ordersData && <OrderTable ordersData={ordersData} />}</div>
                    <div className="order-manage__table__pagination">
                        {ordersData && (
                            <Pagination
                                pageNumber={curPage}
                                isLastPage={ordersData!.length < pageSize ? true : false}
                                handleNext={handleNextPage}
                                handlePrev={handlePrevPage}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="order-manage__filter text-center">
                    <p>No data</p>
                </div>
            )}
            {isLoading && <LoadingModal />}
        </>
    );
};

export default OrderManage;
