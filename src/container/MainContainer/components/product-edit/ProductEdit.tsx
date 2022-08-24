import React, { useEffect, useState } from 'react';
import { User } from '../../../../models/user';
import { useLocation, useParams } from 'react-router-dom';
import ProductManagePanel from '../product-manage-panel/ProductManagePanel';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase.config';
import { Bottom, Top } from '../../../../models/product';
import LoadingModal from '../../../../components/loading-modal/LoadingModal';

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

export default ProductEdit;
