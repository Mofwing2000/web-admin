import { doc, getDoc } from 'firebase/firestore';
import { memo, useEffect, useState } from 'react';
import React, { useParams } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { db } from '../../config/firebase.config';
import { User } from '../../models/user';
import UserManagePanel from '../user-manage-panel/UserManagePanel';

const EditUserProfile = () => {
    const { userId } = useParams();
    const [userValue, setUserValue] = useState<User>();
    useEffect(() => {
        const fetch = async () => {
            const docRef = doc(db, 'user', userId as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setUserValue(docSnap.data() as User);
        };
        fetch();
    }, []);
    return (
        <div>{userValue ? <UserManagePanel type="update" data={{ ...userValue } as User} /> : <LoadingModal />}</div>
    );
};

export default memo(EditUserProfile);
