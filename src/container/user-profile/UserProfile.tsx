import { FirebaseError } from '@firebase/util';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { db } from '../../config/firebase.config';
import { User } from '../../models/user';
import './user-profile.scss';
const UserProfile = () => {
    const { t } = useTranslation(['common', 'user']);
    const { userId } = useParams();
    const [user, setUser] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            const docRef = doc(db, 'user', userId as string);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setUser(docSnap.data() as User);
                setIsLoading(false);
            } catch (error) {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            }
        };
        fetch();
    }, []);
    return (
        <>
            {user ? (
                <div className="user-profile">
                    <div className="user-profile__info row gx-5">
                        <div className="user-profile__info__avatar col-6">
                            <div
                                className="user-profile__info__avatar__item"
                                style={{ backgroundImage: `url(${user.photoUrl})` }}
                            ></div>
                        </div>
                        <div className="user-profile__info__detail col-6">
                            <div className="user-profile__info__detail__first-name">
                                <span className="info-label">{t('user:firstName')}: </span>
                                {user.firstName}
                            </div>
                            <div className="user-profile__info__detail__last-name">
                                <span className="info-label">{t('user:lastName')}: </span>
                                {user.lastName}
                            </div>
                            <div className="user-profile__info__detail__email">
                                <span className="info-label">Email: </span>
                                {user.email}
                            </div>
                            <div className="user-profile__info__detail__phone-number">
                                <span className="info-label">{t('user:phoneNumber')}: </span>
                                {user.phoneNumber}
                            </div>
                            <div className="user-profile__info__detail__address">
                                <span className="info-label">{t('user:address')}: </span>
                                {user.address}
                            </div>
                            <div className="user-profile__info__detail__role">
                                <span className="info-label">{t('user:role')}: </span>
                                {t(`user:${user.role}`)}
                            </div>
                        </div>
                    </div>
                    <div className="user-profile__navigate mt-5 d-flex d-flex justify-content-center align-items-center gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                navigate(`/user/edit/${user.id}`);
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
                <div className="user-profile text-center">
                    <p>{t('common:noData')}</p>
                </div>
            )}
            {isLoading && <LoadingModal />}
        </>
    );
};

export default UserProfile;
