import { collection, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { db } from '../../config/firebase.config';
import { firebaseDateFormatDateOnly } from '../../helpers/common';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { Collection, CollectionState } from '../../models/collection';
import {
    clearCollection,
    deleteColllectionAsync,
    fetchColllectionsAsync,
} from '../../store/collection/collection.action';
import { selectCollection } from '../../store/collection/collection.reducer';
import './collection-manage.scss';
import '../../sass/common.scss';
import CollectionManagePanel from '../collection-manage-panel/CollectionManagePanel';
import { CollectionAction } from '../../type/collection-manage';

const CollectionManage = () => {
    const { t } = useTranslation(['common', 'collection']);
    const { collections, isCollectionLoading } = useAppSelector<CollectionState>(selectCollection);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const collectionQuery = query(collection(db, 'collection'));
    const [tooltip, setTooltip] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<null | string>(null);
    const [isEditing, setIsEditing] = useState<Boolean>(false);

    const handleView = (data: Collection) => {
        navigate(`/collection/view/${data.id}`);
    };

    const handleCollectionDelete = useCallback(async () => {
        console.log('delete');
        console.log(editingItem);
        if (editingItem) {
            console.log(editingItem);
            dispatch(deleteColllectionAsync.request(editingItem));
            console.log('delete');
        }
        setEditingItem(null);
    }, [editingItem]);

    useEffect(() => {
        dispatch(fetchColllectionsAsync.request(collectionQuery));
    }, []);

    console.log(editingItem);

    // if (collections) console.log(collections);
    return (
        <>
            {collections ? (
                <div className="collection-manage mb-5 ">
                    <div className="product-manage__add position-relative">
                        {isEditing ? (
                            <CollectionManagePanel action={CollectionAction.ADD} />
                        ) : (
                            <div className="gap-3 d-flex">
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        setIsEditing(true);
                                    }}
                                >
                                    {t('collection:addCollection')}
                                </button>
                            </div>
                        )}
                        {isEditing && (
                            <i
                                className="collection-manage__add__close fa-solid fa-xmark position-absolute top-0 end-0 fs-3 text-danger"
                                onClick={() => setIsEditing(false)}
                            ></i>
                        )}
                    </div>

                    <div className="collection-manage__table table-responsive-xl">
                        <table className="collection-manage__table table table-bordered mt-3">
                            <thead className="collection-manage__table__head">
                                <tr className="d-flex">
                                    <th scope="col" className="col-2 d-inline-block text-truncate">
                                        {t('collection:collection')}
                                    </th>
                                    <th scope="col" className="col-5 d-inline-block text-truncate">
                                        {t('collection:name')}
                                    </th>
                                    <th scope="col" className="col-2 d-inline-block text-truncate">
                                        {t('collection:createdAt')}
                                    </th>
                                    <th scope="col" className="col-1 d-inline-block text-truncate">
                                        {t('collection:quantity')}
                                    </th>
                                    <th scope="col" className="col-2 d-inline-block text-truncate">
                                        {t('collection:action')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="collection-manage__table__body">
                                {collections &&
                                    collections!.map((colletionData, index) => (
                                        <tr className="collection-manage__table__body d-flex" key={index}>
                                            <td className="collection-manage__table__body__data col-2 d-inlne-block text-truncate">
                                                <div
                                                    className="collection-manage__table__body__data__img"
                                                    style={{
                                                        backgroundImage: `url(${colletionData.collectionBanner})`,
                                                    }}
                                                ></div>
                                            </td>
                                            <td className="product-manage__table__body__data col-5 d-inline-block text-truncate">
                                                <span
                                                    data-tip
                                                    data-for={colletionData.id + 'name'}
                                                    onMouseEnter={() => setTooltip(true)}
                                                    onMouseLeave={() => setTooltip(false)}
                                                >
                                                    {colletionData.title}
                                                </span>
                                                {tooltip && (
                                                    <ReactTooltip id={colletionData.id + 'name'} effect="float">
                                                        <span>{colletionData.description}</span>
                                                    </ReactTooltip>
                                                )}
                                            </td>
                                            <td className="product-manage__table__body__data col-2 d-inline-block text-truncate">
                                                <span
                                                    data-tip
                                                    data-for={colletionData.id + 'createdAt'}
                                                    onMouseEnter={() => setTooltip(true)}
                                                    onMouseLeave={() => setTooltip(false)}
                                                >
                                                    {firebaseDateFormatDateOnly(colletionData.createdAt)}
                                                </span>
                                                {tooltip && (
                                                    <ReactTooltip id={colletionData.id + 'createdAt'} effect="float">
                                                        <span>
                                                            {firebaseDateFormatDateOnly(colletionData.createdAt)}
                                                        </span>
                                                    </ReactTooltip>
                                                )}
                                            </td>
                                            <td className="product-manage__table__body__data col-1 d-inline-block text-truncate">
                                                <span
                                                    data-tip
                                                    data-for={colletionData.id + 'quantity'}
                                                    onMouseEnter={() => setTooltip(true)}
                                                    onMouseLeave={() => setTooltip(false)}
                                                >
                                                    {colletionData.productsList.length}
                                                </span>
                                                {tooltip && (
                                                    <ReactTooltip id={colletionData.id + 'quantity'} effect="float">
                                                        <span>{colletionData.productsList.length}</span>
                                                    </ReactTooltip>
                                                )}
                                            </td>
                                            <td className="product-manage__table__body__data col-2 d-inline-block text-truncate">
                                                <div>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleView(colletionData)}
                                                    >
                                                        {t('common:view')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#confirmModal"
                                                        onClick={() => {
                                                            setEditingItem(colletionData.id);
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
                    {
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
                                            onClick={() => {
                                                handleCollectionDelete();
                                            }}
                                        >
                                            {t('common:delete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            ) : (
                !isCollectionLoading && (
                    <div className="empty-content-container">
                        {' '}
                        <p className="text-center">{t('common:noData')}</p>
                    </div>
                )
            )}
            {isCollectionLoading && <LoadingModal />}
        </>
    );
};

export default CollectionManage;
