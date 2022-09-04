import React, { memo, useCallback, useState } from 'react';
import { Order, OrderState } from '../../models/order';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { firebaseDateFormat } from '../../helpers/common';
import ReactTooltip from 'react-tooltip';
interface Iprops {
    ordersData: Order[];
}

const OrderTable = (props: Iprops) => {
    const { ordersData } = props;
    const [tooltip, setTooltip] = useState<boolean>(false);
    const navigate = useNavigate();
    const { t } = useTranslation(['common', 'order']);
    const handleView = useCallback((data: Order) => {
        navigate(`/order/detail/${data.id}`);
    }, []);
    return (
        <div className="order-table table-responsive-sm">
            <table className="order-table table table-bordered mt-3">
                <thead className="order-table__head">
                    <tr className="d-flex">
                        <th scope="col" className="col-1 d-inline-block text-truncate">
                            ID
                        </th>
                        <th scope="col" className="col-3 d-inline-block text-truncate">
                            {t('order:orderDate')}
                        </th>
                        <th scope="col" className="col-3 d-inline-block text-truncate">
                            {t('order:receivingDate')}
                        </th>
                        <th scope="col" className="col-1 d-inline-block text-truncate">
                            {t('order:orderAmount')}
                        </th>
                        <th scope="col" className="col-1 d-inline-block text-truncate">
                            {t('order:orderState')}
                        </th>
                        <th scope="col" className="col-2 d-inline-block text-truncate">
                            {t('order:trackingNumber')}
                        </th>
                        <th scope="col" className="col-1 d-inline-block text-truncate">
                            {t('order:action')}
                        </th>
                    </tr>
                </thead>
                <tbody className="order-table__body">
                    {ordersData &&
                        ordersData!.map((orderData, index) => (
                            <tr className="order-table__body__row d-flex" key={index}>
                                <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                    <span
                                        data-tip
                                        data-for={orderData.id + 'id'}
                                        onMouseEnter={() => setTooltip(true)}
                                        onMouseLeave={() => setTooltip(false)}
                                    >
                                        {orderData.id}
                                    </span>
                                    {tooltip && (
                                        <ReactTooltip id={orderData.id + 'id'} effect="float">
                                            <span>{orderData.id}</span>
                                        </ReactTooltip>
                                    )}
                                </td>
                                <td className="product-manage__table__body__row__data col-3 d-inline-block text-truncate">
                                    <span
                                        data-tip
                                        data-for={orderData.id + 'orderDate'}
                                        onMouseEnter={() => setTooltip(true)}
                                        onMouseLeave={() => setTooltip(false)}
                                    >
                                        {firebaseDateFormat(orderData.orderDate)}
                                    </span>
                                    {tooltip && (
                                        <ReactTooltip id={orderData.id + 'orderDate'} effect="float">
                                            <span>{firebaseDateFormat(orderData.orderDate)}</span>
                                        </ReactTooltip>
                                    )}
                                </td>
                                <td className="product-manage__table__body__row__data col-3 d-inline-block text-truncate">
                                    <span
                                        data-tip
                                        data-for={orderData.id + 'receivingDate'}
                                        onMouseEnter={() => setTooltip(true)}
                                        onMouseLeave={() => setTooltip(false)}
                                    >
                                        {orderData.orderState === OrderState.DELIVERED &&
                                            firebaseDateFormat(orderData.receivingDate!)}
                                    </span>
                                    {tooltip && (
                                        <ReactTooltip id={orderData.id + 'receivingDate'} effect="float">
                                            <span>
                                                {orderData.orderState === OrderState.DELIVERED &&
                                                    firebaseDateFormat(orderData.receivingDate!)}
                                            </span>
                                        </ReactTooltip>
                                    )}
                                </td>
                                <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                    <span
                                        data-tip
                                        data-for={orderData.id + 'totalAmount'}
                                        onMouseEnter={() => setTooltip(true)}
                                        onMouseLeave={() => setTooltip(false)}
                                    >
                                        {orderData.totalAmount}
                                    </span>
                                    {tooltip && (
                                        <ReactTooltip id={orderData.id + 'totalAmount'} effect="float">
                                            <span>{orderData.totalAmount}</span>
                                        </ReactTooltip>
                                    )}
                                </td>
                                <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                    <span
                                        className="text-capitalize"
                                        data-tip
                                        data-for={orderData.id + 'orderState'}
                                        onMouseEnter={() => setTooltip(true)}
                                        onMouseLeave={() => setTooltip(false)}
                                    >
                                        {t(`order:${orderData.orderState}`)}
                                    </span>
                                    {tooltip && (
                                        <ReactTooltip id={orderData.id + 'orderState'} effect="float">
                                            <span className="text-capitalize">
                                                {t(`order:${orderData.orderState}`)}
                                            </span>
                                        </ReactTooltip>
                                    )}
                                </td>
                                <td className="product-manage__table__body__row__data col-2 d-inline-block text-truncate">
                                    <span
                                        data-tip
                                        data-for={orderData.id + 'trackingNumber'}
                                        onMouseEnter={() => setTooltip(true)}
                                        onMouseLeave={() => setTooltip(false)}
                                    >
                                        {orderData.trackingNumber}
                                    </span>
                                    {tooltip && (
                                        <ReactTooltip id={orderData.id + 'trackingNumber'} effect="float">
                                            <span>{orderData.trackingNumber}</span>
                                        </ReactTooltip>
                                    )}
                                </td>
                                <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                        <button className="btn btn-primary" onClick={() => handleView(orderData)}>
                                            {t('common:view')}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default memo(OrderTable);
