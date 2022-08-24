import { FirebaseError } from '@firebase/util';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingModal from '../../../../components/loading-modal/LoadingModal';
import { db } from '../../../../config/firebase.config';
import { Collection } from '../../../../models/collection';
import { DEFAULT_COLLECTION_PHOTO_URL as defaultCollectionBanner } from '../../../../constants/commons';
const CollectionView = () => {
    const { collectionId } = useParams();
    const { t } = useTranslation(['common', 'product']);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [collectionData, setCollectionData] = useState<Collection>();
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        const docRef = doc(db, 'collection', collectionId as string);
        const unsub = onSnapshot(
            docRef,
            (document) => {
                if (document.exists()) {
                    const collection = document.data() as Collection;
                    setCollectionData(collection);
                    setIsLoading(false);
                }
            },
            (error) => {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            },
        );

        return () => {
            unsub();
        };
    }, []);

    return (
        <>
            {collectionData ? (
                <div className="collection-view">
                    <div
                        className="collection-view_banner"
                        style={{
                            backgroundImage: `url(${collectionData.collectionBanner}), url(${defaultCollectionBanner})`,
                        }}
                    >
                        <div className="col-xl-5 col-lg-7 col-md-8">
                            <div>
                                <h2>{collectionData.title}</h2>
                                <p>{collectionData.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="collection-view text-center">
                    <p>{t('common:noData')}</p>
                </div>
            )}
            {isLoading && <LoadingModal />}
        </>
    );
};

export default CollectionView;
