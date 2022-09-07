import { FirebaseError } from '@firebase/util';
import { yupResolver } from '@hookform/resolvers/yup';
import cuid from 'cuid';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import auth, { storage } from '../../config/firebase.config';
import { DEFAULT_USER_PHOTO_URL as defaultPhotoUrl } from '../../constants/commons';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { User, UsersState } from '../../models/user';
import { addUsersAsync, updateUsersAsync } from '../../store/users/users.action';
import { selectUsers } from '../../store/users/users.reducer';

import './user-manage-panel.scss';

interface IProps {
    type: 'add' | 'update';
    data?: User;
}

interface FormValue {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber: string;
    address: string;
}

const UserManagePanel = (props: IProps) => {
    const { t } = useTranslation(['common', 'user']);
    const schema = yup
        .object({
            email: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .email(`${t('common:validEmail')}`),
            firstName: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .matches(/^[a-zA-Z ]+$/, `${t('common:noNumberAllow')}`),
            lastName: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .matches(/^[a-zA-Z ]+$/, `${t('common:noNumberAllow')}`),
            password: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .min(8, `${t('common:validPasswordLength')}`),
            phoneNumber: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .matches(
                    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
                    `${t('common:validPhoneNumber')}`,
                ),
            address: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`),
        })
        .required();

    const [avatar, setAvatar] = useState<File>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { isUserLoading } = useAppSelector<UsersState>(selectUsers);
    const dispatch = useAppDispatch();
    const defaultUser: User = {
        id: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        photoUrl: defaultPhotoUrl,
        address: '',
        role: 'customer',
        createdAt: new Date(),
    };
    const navigate = useNavigate();
    const user: User = props.data
        ? {
              ...props.data,
          }
        : { ...defaultUser };
    const defaultFormValue = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        phoneNumber: user.phoneNumber,
        address: user.address,
    };
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValue>({
        resolver: yupResolver(schema),
        defaultValues: { ...defaultFormValue },
    });
    const [userFormValue, setUserFormValue] = useState<User>(user);

    const isFileImage = useCallback((file: File) => {
        return file && file.type.split('/')[0] === 'image';
    }, []);
    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue((prev) => {
            return {
                ...prev,
                email: e.target.value,
            };
        });
    }, []);

    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue((prev) => {
            return {
                ...prev,
                password: e.target.value,
            };
        });
    }, []);

    const handleFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue((prev) => {
            return {
                ...prev,
                firstName: e.target.value,
            };
        });
    }, []);

    const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue((prev) => {
            return {
                ...prev,
                lastName: e.target.value,
            };
        });
    }, []);

    const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue((prev) => {
            return {
                ...prev,
                phoneNumber: e.target.value,
            };
        });
    }, []);

    const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue((prev) => {
            return {
                ...prev,
                address: e.target.value,
            };
        });
    }, []);

    const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserFormValue((prev) => {
            return {
                ...prev,
                role: e.target.value === 'customer' ? 'customer' : e.target.value === 'staff' ? 'staff' : 'admin',
            };
        });
    }, []);

    const uploadAvatar = useCallback(async () => {
        if (avatar) {
            setIsLoading(true);
            const avatarFileName = cuid() + avatar.name;
            const storageRef = ref(storage, `userPhotos/${avatarFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, avatar);
            uploadTask.on(
                'state_changed',
                () => {},
                (error) => {
                    setIsLoading(false);
                    if (error instanceof FirebaseError) toast(error.message);
                },
                async () => {
                    await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setUserFormValue((prev) => {
                            return {
                                ...prev,
                                photoUrl: downloadURL,
                            };
                        });
                    });
                    setIsLoading(false);
                },
            );
        }
    }, [avatar]);

    const addUser = useCallback(async () => {
        const result = await createUserWithEmailAndPassword(auth, userFormValue.email, userFormValue.password);
        dispatch(
            addUsersAsync.request({
                ...userFormValue,
                id: result.user.uid,
            }),
        );
        setAvatar(undefined);
        setUserFormValue({ ...defaultUser });
        reset({ ...defaultFormValue });
    }, [userFormValue]);

    const updateUser = useCallback(async () => {
        dispatch(
            updateUsersAsync.request({
                ...userFormValue,
            }),
        );
    }, [userFormValue]);
    const onSubmit = useCallback(async () => {
        setIsLoading(true);
        if (props.type === 'add') {
            await addUser();
            toast.success('common:addUserSucceed');
            setIsLoading(false);
            navigate('/user');
        } else if (props.type === 'update') {
            await updateUser();
            toast.success('common:updateUserSucceed');
            setIsLoading(false);
            navigate('/user');
        }
    }, [props.type, userFormValue]);

    useEffect(() => {
        uploadAvatar();
    }, [avatar]);

    return (
        <>
            <div className="manage-user card">
                <form className="manage-user__form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="manage-user__form__upload">
                        <div
                            className="manage-user__form__upload__img overflow-hidden d-flex justify-content-center align-items-center"
                            style={{
                                backgroundImage: `url(${userFormValue.photoUrl || user.photoUrl || defaultPhotoUrl})`,
                            }}
                        ></div>
                        <div className="manage-user__form__upload__control ">
                            <div className="manage-user__form__upload__control__btn text-danger form-group">
                                <label htmlFor="upload">
                                    <i className="fa-solid fa-upload"></i>
                                </label>
                                <input
                                    type="file"
                                    className="form-control d-none"
                                    id="upload"
                                    onChange={(e) => isFileImage(e.target.files![0]) && setAvatar(e.target.files![0])}
                                    aria-describedby="upload"
                                />
                            </div>
                            <button className="manage-user__form__upload__control__btn text-danger ">
                                <i className="fa-solid fa-user-pen"></i>
                            </button>
                        </div>
                    </div>
                    <div className="manage-user__form__upload row d-flex">
                        <div className="form-group col-6">
                            <label htmlFor="email">Email:</label>
                            <input
                                {...register('email', {
                                    onChange: handleEmailChange,
                                })}
                                type="email"
                                className="form-control"
                                id="email"
                                // defaultValue={user.email}
                                disabled={props.type === 'update'}
                                value={userFormValue.email}
                                aria-describedby="email"
                                placeholder="abc@gmail.com"
                            />
                            {<p className="text-danger">{errors.email?.message}</p>}
                        </div>
                        <div className="form-group col-6">
                            <label htmlFor="password">{t('user:password')}:</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                // defaultValue={user.password}
                                value={userFormValue.password}
                                aria-describedby="password"
                                {...register('password', {
                                    onChange: handlePasswordChange,
                                })}
                                placeholder="8 characters at least"
                            />
                            <p className="text-danger">{errors.password?.message}</p>
                        </div>
                        <div className="form-group col-6">
                            <label htmlFor="firstName">{t('user:firstName')}:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="firstName"
                                // defaultValue={user.firstName}
                                value={userFormValue.firstName}
                                aria-describedby="fist name"
                                placeholder="John"
                                {...register('firstName', {
                                    onChange: handleFirstNameChange,
                                })}
                            />
                            {<p className="text-danger">{errors.firstName?.message}</p>}
                        </div>
                        <div className="form-group col-6">
                            <label htmlFor="lastName">{t('user:lastName')}:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="lastName"
                                // defaultValue={user.lastName}
                                value={userFormValue.lastName}
                                aria-describedby="last name"
                                placeholder="Wick"
                                {...register('lastName', {
                                    onChange: handleLastNameChange,
                                })}
                            />
                            {<p className="text-danger">{errors.lastName?.message}</p>}
                        </div>
                        <div className="form-group col-6">
                            <label htmlFor="phone">{t('user:phoneNumber')}:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="phone"
                                // defaultValue={user.phoneNumber}
                                value={userFormValue.phoneNumber}
                                aria-describedby="phone number"
                                placeholder="0921341215"
                                {...register('phoneNumber', {
                                    onChange: handlePhoneNumberChange,
                                })}
                            />
                            <p className="text-danger">{errors.phoneNumber?.message}</p>
                        </div>
                        <div className="form-group col-6">
                            <label htmlFor="address">{t('user:address')}:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="address"
                                // defaultValue={user.address}
                                value={userFormValue.address}
                                aria-describedby="address"
                                placeholder="Hanoi"
                                {...register('address', {
                                    onChange: handleAddressChange,
                                })}
                            />
                            <p className="text-danger">{errors.address?.message}</p>
                        </div>
                        <div className="form-group col-6">
                            <label htmlFor="role">{t('user:role')}:</label>
                            <select
                                id="role"
                                className="form-select col-6"
                                aria-label="role-select"
                                // defaultValue={user.role || 'customer'}
                                value={userFormValue.role}
                                // {...register('role', {
                                //     ,
                                // })}
                                onChange={handleRoleChange}
                            >
                                <option value="customer">{t('user:customer')}</option>
                                <option value="staff">{t('user:staff')}</option>
                                <option value="admin">{t('user:admin')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="manage-user__form__buttons d-flex mt-5 justify-content-center align-items-center gap-3">
                        <button disabled={isLoading || isUserLoading} className="btn btn-lg btn-primary " type="submit">
                            {t('common:confirm')}
                        </button>
                        {props.type === 'update' && (
                            <button
                                disabled={isLoading || isUserLoading}
                                className="btn btn-lg btn-secondary "
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(-1);
                                }}
                            >
                                {t('common:cancel')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
            {(isLoading || isUserLoading) && <LoadingModal />}
        </>
    );
};

export default UserManagePanel;
