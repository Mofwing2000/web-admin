import React, { useEffect, useState } from 'react';
import { User, UserDataFirebase } from '../../../../models/user';
import { useLocation, useParams } from 'react-router-dom';
import UserManagePanel from '../UserManagePanel';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase.config';

const Profile = () => {
    const { state } = useLocation();
    const { userId } = useParams();
    const [val, setVal] = useState<User | null>(null);
    useEffect(() => {
        const fetch = async () => {
            const docRef = doc(db, 'user', userId as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setVal(docSnap.data() as User);
        };
        fetch();
    }, []);
    return (
        <div>
            {val ? (
                <UserManagePanel type="update" data={{ ...val, id: userId } as UserDataFirebase} />
            ) : (
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            )}
        </div>
    );
};

export default Profile;
