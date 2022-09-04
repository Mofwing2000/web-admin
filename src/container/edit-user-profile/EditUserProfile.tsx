import React, { memo, useEffect, useState } from 'react';
import { User } from '../../models/user';
import { useParams } from 'react-router-dom';
import UserManagePanel from '../user-manage-panel/UserManagePanel';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import LoadingModal from '../../components/loading-modal/LoadingModal';

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
