import { FirebaseError } from '@firebase/util';
import {
    collection,
    deleteDoc,
    doc,
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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import Pagination from '../../components/pagination/Pagination';
import ProductFilterBar from '../../components/product-filter-bar/ProductFilterBar';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { Bottom, ProductState, ProductType, Top } from '../../models/product';
import { fetchOrdersAsync } from '../../store/order/order.action';
import { clearProducts, deleteProductAsync, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { PageLimit, PageOrder, PageProductSort } from '../../type/page-type';
import { ProductAction } from '../../type/product-manage';
import ProductManagePanel from '../product-manage-panel/ProductManagePanel';
import './product-management.scss';

const ProductManage = () => {
    const { t } = useTranslation(['common', 'product']);
    const [tooltip, setTooltip] = useState<boolean>(true);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const [pageSize, setPageSize] = useState<PageLimit>(10);
    const [sortType, setSortType] = useState<PageProductSort>('id');
    const [sortOrder, setSortOrder] = useState<PageOrder>('asc');
    const [pageCount, setPageCount] = useState<number>(0);
    const [itemOffset, setItemOffset] = useState<number>(0);
    const [currentFilteredProduct, setCurrentFilteredProduct] = useState<(Top | Bottom)[]>([]);
    const [isEditing, setIsEditing] = useState<Boolean>(false);
    const [addType, setAddtype] = useState<ProductAction>('add-top');
    const [editingItem, setEditingItem] = useState<null | string>(null);
    const [searchValue, setSearchValue] = useState<string>();
    const searchResultRef = useRef<HTMLUListElement>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const filterQuery = useMemo(
        () => query(collection(db, 'product'), orderBy(sortType, sortOrder)),
        [sortType, sortOrder],
    );
    const handleProductDelete = async () => {
        if (editingItem) {
            dispatch(deleteProductAsync.request(editingItem));
        }
        setEditingItem(null);
    };

    const handleView = (data: Top | Bottom) => {
        const productNameUrl = data.name.toLowerCase().replace(' ', '-');
        navigate(`/product/view/${data.id}/${productNameUrl}`);
    };

    const handlePageClick = (event: { selected: number }) => {
        if (products) {
            const newOffset = (event.selected * pageSize) % products.length;
            setItemOffset(newOffset);
        }
    };

    useEffect(() => {
        if (products.length) {
            const endOffset = itemOffset + pageSize;
            console.log(products);

            setCurrentFilteredProduct(products.slice(itemOffset, endOffset));
            setPageCount(Math.ceil(products.length / pageSize));
        }
    }, [itemOffset, products, pageSize]);

    useEffect(() => {
        dispatch(fetchProductsAsync.request(filterQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, [pageSize, filterQuery]);
    return (
        <div className="product-manage">
            <div className="product-manage__add position-relative">
                <div className="row d-flex justify-content-end">
                    <div className="col-xl-4 col-6">
                        <div className="product-manage__search input-group position-relative">
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
                                className="product-manage__search__list position-absolute light-bg w-100 justify-content-center align-items-center flex-column"
                                ref={searchResultRef}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {searchValue &&
                                    products &&
                                    products
                                        .filter(
                                            (product) =>
                                                product.name &&
                                                product.name.toLowerCase().includes(searchValue.toLowerCase()),
                                        )
                                        .slice(0, 5)
                                        .map((product, index) => (
                                            <li
                                                key={index}
                                                className="product-manage__search__list__item row p-3 w-100"
                                            >
                                                <div className="col-3">
                                                    <div
                                                        className="product-manage__search__list__item__image"
                                                        style={{ backgroundImage: `url(${product.photoUrls[0]})` }}
                                                    ></div>
                                                </div>

                                                <div className="product-manage__search__list__item__content col-9 d-flex justify-content-between">
                                                    <p className="fw-bold">{product.name}</p>
                                                </div>
                                            </li>
                                        ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {isEditing ? (
                    <ProductManagePanel type={addType} />
                ) : (
                    <div className="gap-3 d-flex">
                        <button
                            className="btn btn-success"
                            onClick={() => {
                                setIsEditing(true);
                                setAddtype('add-top');
                            }}
                        >
                            {t('product:addTop')}
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => {
                                setIsEditing(true);
                                setAddtype('add-bottom');
                            }}
                        >
                            {t('product:addBottom')}
                        </button>
                    </div>
                )}
                {isEditing && (
                    <i
                        className="product-manage__add__close fa-solid fa-xmark position-absolute top-0 end-0 fs-3 text-danger"
                        onClick={() => setIsEditing(false)}
                    ></i>
                )}
            </div>
            <div className="product-manage__filter">
                <div className="product-manage__filter__control d-flex gap-5 mt-5">
                    <ProductFilterBar
                        pageSize={pageSize}
                        sortType={sortType}
                        sortOrder={sortOrder}
                        setPageSize={setPageSize}
                        setSortType={setSortType}
                        setSortOrder={setSortOrder}
                    />
                </div>
                <div className="product-manage__table table-responsive-sm">
                    <table className="table table-bordered mt-3">
                        <thead className="product-manage__table__head">
                            <tr className="d-flex">
                                <th scope="col" className="col-1 d-inline-block text-truncate">
                                    {t('product:product')}
                                </th>
                                <th scope="col" className="col-3 d-inline-block text-truncate">
                                    {t('product:name')}
                                </th>
                                <th scope="col" className="col-1 d-inline-block text-truncate">
                                    {t('product:type')}
                                </th>
                                <th scope="col" className="col-1 d-inline-block text-truncate">
                                    {t('product:size')}
                                </th>
                                <th scope="col" className="col-1 d-inline-block text-truncate">
                                    {t('product:color')}
                                </th>
                                <th scope="col" className="col-1 d-inline-block text-truncate">
                                    {t('product:quantity')}
                                </th>
                                <th scope="col" className="col-1 d-inline-block text-truncate">
                                    {t('product:price')}
                                </th>
                                <th scope="col" className="col-1 d-inline-block text-truncate">
                                    {t('product:category')}
                                </th>
                                <th scope="col" className="col-2 d-inline-block text-truncate">
                                    {t('common:action')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="product-manage__table__body">
                            {currentFilteredProduct &&
                                currentFilteredProduct.map((data, index) => (
                                    <tr key={index} className="product-manage__table__body__row d-flex">
                                        <td className="product-manage__table__body__row__data product-image-container col-1 d-inline-block text-truncate">
                                            <div
                                                className="product-manage__table__body__row__data__img"
                                                style={{ backgroundImage: `url(${data.photoUrls[0]})` }}
                                            ></div>
                                        </td>
                                        <td
                                            className={`product-manage__table__body__row__data col-3 d-inline-block text-truncate`}
                                        >
                                            <span
                                                data-tip
                                                data-for={data.id + 'name'}
                                                onMouseEnter={() => setTooltip(true)}
                                                onMouseLeave={() => setTooltip(false)}
                                            >
                                                {data.name}
                                            </span>
                                            {tooltip && (
                                                <ReactTooltip id={data.id + 'name'} effect="float">
                                                    <span>{data.name}</span>
                                                </ReactTooltip>
                                            )}
                                        </td>

                                        <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                            {data.productType}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                            <span
                                                data-tip
                                                data-for={data.id + 'size'}
                                                onMouseEnter={() => setTooltip(true)}
                                                onMouseLeave={() => setTooltip(false)}
                                            >
                                                {data.size &&
                                                    data.size.filter((item) => item.isAvailable === true).length +
                                                        ' ' +
                                                        t('product:sizeS')}
                                            </span>
                                            {tooltip && (
                                                <ReactTooltip id={data.id + 'size'} effect="float">
                                                    <span>
                                                        {data.size &&
                                                            data.size.reduce(
                                                                (prev, cur) =>
                                                                    cur.isAvailable
                                                                        ? prev +
                                                                          `${prev === '' ? '' : ', '}` +
                                                                          cur.sizeName
                                                                        : prev,
                                                                '',
                                                            )}
                                                    </span>
                                                </ReactTooltip>
                                            )}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                            <span
                                                data-tip
                                                data-for={data.id + 'color'}
                                                onMouseEnter={() => setTooltip(true)}
                                                onMouseLeave={() => setTooltip(false)}
                                            >
                                                {data.color &&
                                                    data.color.filter((item) => item.isAvailable === true).length +
                                                        ' ' +
                                                        t('product:colorS')}
                                            </span>
                                            {tooltip && (
                                                <ReactTooltip id={data.id + 'color'} effect="float">
                                                    <span>
                                                        {data.color &&
                                                            data.color.reduce(
                                                                (prev, cur) =>
                                                                    cur.isAvailable
                                                                        ? prev +
                                                                          `${prev === '' ? '' : ', '}` +
                                                                          t(`product:${cur.colorName}`)
                                                                        : prev,
                                                                '',
                                                            )}
                                                    </span>
                                                </ReactTooltip>
                                            )}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                            {data.quantity}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                            {data.price}$
                                        </td>
                                        <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                            <span
                                                data-tip
                                                data-for={data.id + 'category'}
                                                onMouseEnter={() => setTooltip(true)}
                                                onMouseLeave={() => setTooltip(false)}
                                            >
                                                {data.category &&
                                                    (data.productType === ProductType.TOP
                                                        ? (data as Top).category.filter(
                                                              (item) => item.isCategory === true,
                                                          ).length +
                                                          ' ' +
                                                          t('product:categoryS')
                                                        : (data as Bottom).category.filter(
                                                              (item) => item.isCategory === true,
                                                          ).length +
                                                          ' ' +
                                                          t('product:categoryS'))}
                                            </span>
                                            {tooltip && (
                                                <ReactTooltip id={data.id + 'category'} effect="float">
                                                    <span>
                                                        {data.category &&
                                                            (data.productType === ProductType.TOP
                                                                ? (data as Top).category.reduce(
                                                                      (prev, cur) =>
                                                                          cur.isCategory
                                                                              ? prev +
                                                                                `${prev === '' ? '' : ', '}` +
                                                                                t(`product:${cur.categoryName}`)
                                                                              : prev,
                                                                      '',
                                                                  )
                                                                : (data as Bottom).category.reduce(
                                                                      (prev, cur) =>
                                                                          cur.isCategory
                                                                              ? prev +
                                                                                `${prev === '' ? '' : ', '}` +
                                                                                t(`product:${cur.categoryName}`)
                                                                              : prev,
                                                                      '',
                                                                  ))}
                                                    </span>
                                                </ReactTooltip>
                                            )}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-2 d-inline-block text-truncate">
                                            <div className="d-flex  align-items-center gap-2">
                                                <button className="btn btn-primary" onClick={() => handleView(data)}>
                                                    {t('common:view')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#confirmModal"
                                                    onClick={() => {
                                                        setEditingItem(data.id);
                                                    }}
                                                >
                                                    {t('common:delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <div className="product-manage__table__pagination">
                    {currentFilteredProduct && <Pagination onPageChange={handlePageClick} pageCount={pageCount} />}
                </div>
            </div>
            <div className="modal" id="confirmModal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">{t('common:actionConfirm')}</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body">{t('common:confirmActionQuest')}</div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={() => setEditingItem(null)}
                            >
                                {t('common:cancel')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                data-bs-dismiss="modal"
                                onClick={() => handleProductDelete()}
                            >
                                {t('common:delete')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isProductLoading && <LoadingModal />}
        </div>
    );
};

export default ProductManage;
