import React, { memo, useEffect, useState } from 'react';
import { User } from '../../models/user';
import { useLocation, useParams } from 'react-router-dom';
import ProductManagePanel from '../product-manage-panel/ProductManagePanel';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { Collection } from '../../models/collection';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import CollectionManagePanel from '../collection-manage-panel/CollectionManagePanel';
import { CollectionAction } from '../../type/collection-manage';

const CollectionEdit = () => {
    const { collectionId } = useParams();
    const [collectionValue, setCollectionValue] = useState<Collection>();
    useEffect(() => {
        const fetch = async () => {
            const docRef = doc(db, 'collection', collectionId as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setCollectionValue(docSnap.data() as Collection);
        };
        fetch();
    }, []);
    return (
        <div className="position-relative">
            {collectionValue ? (
                <CollectionManagePanel action={CollectionAction.UPDATE} data={{ ...collectionValue } as Collection} />
            ) : (
                <LoadingModal />
            )}
        </div>
    );
};

export default memo(CollectionEdit);
