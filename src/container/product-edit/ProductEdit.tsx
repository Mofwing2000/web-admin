import { doc, getDoc } from 'firebase/firestore';
import React, { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { db } from '../../config/firebase.config';
import { Bottom, Top } from '../../models/product';
import ProductManagePanel from '../product-manage-panel/ProductManagePanel';

const ProductEdit = () => {
    const { productId } = useParams();
    const [productValue, setProductValue] = useState<Top | Bottom>();

    useEffect(() => {
        const fetch = async () => {
            const docRef = doc(db, 'product', productId as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setProductValue(docSnap.data() as Top | Bottom);
        };
        fetch();
    }, []);

    return (
        <div className="position-relative">
            {productValue ? (
                <ProductManagePanel type="update" data={{ ...productValue } as Top | Bottom} />
            ) : (
                <LoadingModal />
            )}
        </div>
    );
};

export default memo(ProductEdit);
