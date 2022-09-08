import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLimit, PageOrder, PageOrderSort } from '../../type/page-type';

interface IProps {
    pageSize: PageLimit;
    sortType: PageOrderSort;
    sortOrder: PageOrder;
    setPageSize: React.Dispatch<React.SetStateAction<PageLimit>>;
    setSortType: React.Dispatch<React.SetStateAction<PageOrderSort>>;
    setSortOrder: React.Dispatch<React.SetStateAction<PageOrder>>;
    setPage: (event: { selected: number }) => void;
}

const OrderFilterBar: FC<IProps> = (props) => {
    const { pageSize, sortType, sortOrder, setPageSize, setSortType, setSortOrder, setPage } = props;
    const { t } = useTranslation(['common', 'order']);
    return (
        <div className="order-filter-bar mb-5">
            <div className="order-filter-bar__control d-block d-md-flex gap-5 ">
                <div className="form-group ">
                    <label htmlFor="pageLimit">{t('common:itemsPerPage')}:</label>
                    <select
                        id="pageLimit"
                        className="form-select cursor"
                        aria-label="pageLimit-select"
                        onChange={(e) => {
                            setPageSize(e.target.value === '10' ? 10 : e.target.value === '20' ? 20 : 50);
                            setPage({ selected: 0 });
                        }}
                        value={pageSize}
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
                            id="sort"
                            className="form-select cursor"
                            aria-label="sort-select"
                            onChange={(e) =>
                                setSortType(
                                    e.target.value === 'orderDate'
                                        ? 'orderDate'
                                        : e.target.value === 'orderState'
                                        ? 'orderState'
                                        : 'totalAmount',
                                )
                            }
                            value={sortType}
                        >
                            <option value="orderDate">{t('common:sortBy')}:</option>
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
    );
};

export default memo(OrderFilterBar);
