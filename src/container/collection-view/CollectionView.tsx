import { FirebaseError } from '@firebase/util';
import { collection, doc, getDoc, query } from 'firebase/firestore';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import ProductItem from '../../components/product-item/ProductItem';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { Collection } from '../../models/collection';
import { ProductState } from '../../models/product';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';

import './collection-view.scss';

const CollectionView = () => {
    const [collectionData, setCollectionData] = useState<Collection>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { collectionId } = useParams();
    const { t } = useTranslation(['common', 'product']);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const fetchProductQuery = useMemo(() => {
        return query(collection(db, 'product'));
    }, []);

    const collectionProducts = useMemo(() => {
        if (products && collectionData)
            return products.filter((product) => collectionData.productsList.includes(product.id));
    }, [products, collectionData]);

    const itemList = useMemo(
        () =>
            collectionProducts &&
            collectionProducts.map((product, index) => (
                <div className="col-lg-4 col-sm-6" key={index}>
                    <ProductItem product={product} />
                </div>
            )),
        [collectionProducts],
    );

    useEffect(() => {
        dispatch(fetchProductsAsync.request(fetchProductQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, [fetchProductQuery]);
    useEffect(() => {
        const fetchCollection = async () => {
            setIsLoading(true);
            try {
                const docSnap = await getDoc(doc(db, 'collection', collectionId as string));
                if (docSnap.exists()) {
                    setCollectionData(docSnap.data() as Collection);
                    setIsLoading(false);
                }
            } catch (error) {
                if (error instanceof FirebaseError) {
                    toast.error(error.message);
                    setIsLoading(false);
                }
            }
        };
        fetchCollection();
    }, []);

    return (
        <>
            {collectionData ? (
                <div className="collection-view mt-5">
                    <div
                        className="collection-view__banner mb-5"
                        style={{
                            backgroundImage: `url(${collectionData?.collectionBanner})`,
                        }}
                    ></div>
                    <div className="collection-view__products">
                        <div className="container">
                            <div className="row">
                                <div className="col-8 mx-auto ">
                                    <h3 className="text-center mb-5">{collectionData?.title}</h3>
                                    <div className="row">{itemList}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="collection-profile__navigate mt-5 d-flex d-flex justify-content-center align-items-center gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                navigate(`/collection/edit/${collectionId}`);
                            }}
                        >
                            {t('common:edit')}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                navigate(-1);
                            }}
                        >
                            {t('common:close')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="empty-content-container">
                    <p className="text-center">{t('common:noData')}</p>
                </div>
            )}
            {(isLoading || isProductLoading) && <LoadingModal />}
        </>
    );
};

export default memo(CollectionView);
