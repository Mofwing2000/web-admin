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
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import LoadingModal from '../../../../components/loading-modal/LoadingModal';
import Pagination from '../../../../components/pagination/Pagination';
import { db } from '../../../../config/firebase.config';
import { Bottom, ProductType, Top } from '../../../../models/product';
import { PageLimit, PageOrder, PageProductSort } from '../../../../type/page-type';
import { ProductAction } from '../../../../type/product-manage';
import ProductManagePanel from '../product-manage-panel/ProductManagePanel';
import './product-management.scss';

const ProductManage = () => {
    const { t } = useTranslation(['common', 'product']);
    const [tooltip, setTooltip] = useState<boolean>(true);
    const [productsData, setProductsData] = useState<(Top | Bottom)[]>();
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData>>();
    const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData>>();
    const [curPage, setCurPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<PageLimit>(10);
    const [sortType, setSortType] = useState<PageProductSort>('default');
    const [sortOrder, setSortOrder] = useState<PageOrder>('asc');
    const [isEditing, setIsEditing] = useState<Boolean>(false);
    const [addType, setAddtype] = useState<ProductAction>('add-top');
    const [editingItem, setEditingItem] = useState<null | string>(null);
    const sortTypeValue = sortType === 'default' ? 'id' : sortType === 'name' ? 'name' : 'price';
    const sortOrderValue = sortOrder === 'asc' ? 'asc' : 'desc';
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const handleProductDelete = async () => {
        if (editingItem) await deleteDoc(doc(db, 'product', editingItem));
        toast.success(`${t('common:deleteProductSucceed')}`);
        setEditingItem(null);
    };

    const handleView = (data: Top | Bottom) => {
        const productNameUrl = data.name.toLowerCase().replace(' ', '-');
        navigate(`/product/view/${data.id}/${productNameUrl}`);
    };

    const handleNextPage = () => {
        setIsLoading(true);
        const filterQueryNext = query(
            collection(db, 'product'),
            limit(pageSize as number),
            orderBy(sortTypeValue, sortOrderValue),
            startAfter(lastDoc),
        );
        onSnapshot(
            filterQueryNext,
            (snapShot) => {
                let list: Array<Top | Bottom> = [];

                snapShot.docs.forEach((docItem) => {
                    list.push({ ...docItem.data() } as Top | Bottom);
                });
                setProductsData(list);
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
            collection(db, 'product'),
            limit(pageSize as number),
            orderBy(sortTypeValue, sortOrderValue),
            endBefore(firstDoc),
            limitToLast(pageSize),
        );
        onSnapshot(
            filterQueryNext,
            (snapShot) => {
                let list: Array<Top | Bottom> = [];
                snapShot.docs.forEach((docItem) => {
                    list.push({ ...docItem.data() } as Top | Bottom);
                });
                setFirstDoc(snapShot.docs[0]);
                setLastDoc(snapShot.docs[snapShot.docs.length - 1]);
                setProductsData(list);
                setCurPage(curPage - 1);
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                if (error instanceof FirebaseError) toast.error(error.message);
            },
        );
    };
    console.log('render');
    useEffect(() => {
        setCurPage(1);
        setIsLoading(true);
        const filterQuery = query(
            collection(db, 'product'),
            limit(pageSize as number),
            orderBy(
                sortType === 'default' ? 'id' : sortType === 'name' ? 'name' : 'price',
                sortOrder === 'asc' ? 'asc' : 'desc',
            ),
        );
        const unsub = onSnapshot(
            filterQuery,
            (snapShot) => {
                let list: Array<Top | Bottom> = [];
                snapShot.docs.forEach((docItem) => {
                    list.push({ ...docItem.data() } as Top | Bottom);
                });
                setLastDoc(snapShot.docs[snapShot.docs.length - 1]);
                setFirstDoc(snapShot.docs[0]);
                setProductsData(list);
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                if (error instanceof FirebaseError) toast.error(error.message);
            },
        );
        return () => {
            unsub();
        };
    }, [pageSize, sortType, sortOrder]);
    return (
        <div className="product-manage-container">
            <div className="product-manage-container__add position-relative">
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
                        className="product-manage-container__add__close fa-solid fa-xmark position-absolute top-0 end-0 fs-3 text-danger"
                        onClick={() => setIsEditing(false)}
                    ></i>
                )}
            </div>
            <div className="product-manage-container__filter">
                <div className="product-manage-container__filter__control d-flex gap-5 mt-5">
                    <div className="form-group">
                        <label htmlFor="pageLimit">{t('common:itemsPerPage')}</label>
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
                        <label htmlFor="sort">{t('common:sortBy')}</label>
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
                                            : e.target.value === 'name'
                                            ? 'name'
                                            : 'price',
                                    )
                                }
                            >
                                <option value="default">{t('common:sortBy')}</option>
                                <option value="name">{t('product:name')}</option>
                                <option value="price">{t('product:price')}</option>
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
                <div className="product-manage-container__table table-responsive-sm">
                    <table className="table table-bordered mt-3">
                        <thead className="product-manage-container__table__head">
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
                        <tbody className="product-manage-container__table__body">
                            {productsData &&
                                productsData.map((data, index) => (
                                    <tr key={index} className="product-manage-container__table__body__row d-flex">
                                        <td className="product-manage-container__table__body__row__data product-image-container col-1 d-inline-block text-truncate">
                                            <div
                                                className="product-manage-container__table__body__row__data__img"
                                                style={{ backgroundImage: `url(${data.photoUrls[0]})` }}
                                            ></div>
                                        </td>
                                        <td
                                            className={`product-manage-container__table__body__row__data col-3 d-inline-block text-truncate`}
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

                                        <td className="product-manage-container__table__body__row__data col-1 d-inline-block text-truncate">
                                            {data.productType}
                                        </td>
                                        <td className="product-manage-container__table__body__row__data col-1 d-inline-block text-truncate">
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
                                        <td className="product-manage-container__table__body__row__data col-1 d-inline-block text-truncate">
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
                                        <td className="product-manage-container__table__body__row__data col-1 d-inline-block text-truncate">
                                            {data.quantity}
                                        </td>
                                        <td className="product-manage-container__table__body__row__data col-1 d-inline-block text-truncate">
                                            {data.price}$
                                        </td>
                                        <td className="product-manage-container__table__body__row__data col-1 d-inline-block text-truncate">
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
                                        <td className="product-manage-container__table__body__row__data col-2 d-inline-block text-truncate">
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
                <div className="product-manage-container__table__pagination">
                    {productsData && (
                        <Pagination
                            pageNumber={curPage}
                            isLastPage={productsData!.length < pageSize ? true : false}
                            handleNext={handleNextPage}
                            handlePrev={handlePrevPage}
                        />
                    )}
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
            {isLoading && <LoadingModal />}
        </div>
    );
};

export default ProductManage;
