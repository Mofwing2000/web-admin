import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import auth, { storage, db } from '../../../../config/firebase.config';
import cuid from 'cuid';
import * as yup from 'yup';
import { UserManageFormValues } from '../../../../models/form';
import { UserDataFirebase, User } from '../../../../models/user';
import { DEFAULT_USER_PHOTO_URL as defaultPhotoUrl } from '../../../../constants/commons';
import './user_management.scss';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface IProps {
    type: 'add' | 'update';
    data?: UserDataFirebase;
}

const schema = yup
    .object({
        email: yup.string().trim().required('This field is required!').email('Please enter a valid email!'),
        firstName: yup
            .string()
            .trim()
            .required('This field is required!')
            .matches(/^[a-zA-Z ]+$/, "Name mustn't contain numbers"),
        lastName: yup
            .string()
            .trim()
            .required('This field is required!')
            .matches(/^[a-zA-Z ]+$/, "Name mustn't contain numbers"),
        password: yup
            .string()
            .trim()
            .required('This field is required!')
            .min(8, 'Password must have at least 8 characters!'),
        phoneNumber: yup
            .string()
            .trim()
            .required('This field is required!')
            .matches(
                /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
            ),
        address: yup.string().trim().required('This field is required!'),
    })
    .required();

const UserManagePanel = (props: IProps) => {
    const [avatar, setAvatar] = useState<File>();
    const [formLoading, setFormLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const navigate = useNavigate();
    const user: User = props.data
        ? {
              ...props.data,
          }
        : {
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              phoneNumber: '',
              photoUrl: defaultPhotoUrl,
              address: '',
              role: 'customer',
          };
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserManageFormValues>({
        resolver: yupResolver(schema),
    });
    const [userManageFormValues, setUserManageFormValues] = useState<UserManageFormValues>(user);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            email: e.target.value,
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            password: e.target.value,
        });
    };

    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            firstName: e.target.value,
        });
    };

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            lastName: e.target.value,
        });
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            phoneNumber: e.target.value,
        });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            address: e.target.value,
        });
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            role: e.target.value === 'customer' ? 'customer' : e.target.value === 'staff' ? 'staff' : 'admin',
        });
    };

    const uploadAvatar = async () => {
        if (avatar) {
            setImageLoading(true);
            const avatarFileName = cuid() + avatar.name;
            const storageRef = ref(storage, `userPhotos/${avatarFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, avatar);
            uploadTask.on(
                'state_changed',
                () => {},
                (error) => {
                    setImageLoading(false);
                    console.log(error);
                },
                async () => {
                    setImageLoading(false);
                    await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setUserManageFormValues((prev) => {
                            return {
                                ...prev,
                                photoUrl: downloadURL,
                            };
                        });
                    });
                },
            );
        }
    };

    const addUser = async () => {
        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                userManageFormValues.email,
                userManageFormValues.password,
            );

            await setDoc(doc(db, 'user', result.user.uid), {
                ...userManageFormValues,
            });
            setFormLoading(false);
        } catch (error) {
            setFormLoading(false);
            console.log(error);
        }
    };

    useEffect(() => {
        setUserManageFormValues({ ...user });
    }, [props]);

    console.log(user);

    const updateUser = async () => {
        try {
            await updateDoc(doc(db, 'user', props.data!.id), {
                ...userManageFormValues,
            });
            setFormLoading(false);
        } catch (error) {
            setFormLoading(false);
            console.log(error);
        }
    };

    const onSubmit = async () => {
        setFormLoading(true);
        if (props.type === 'add') {
            await addUser();
            setAvatar(undefined);
            setUserManageFormValues({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                photoUrl: defaultPhotoUrl,
                address: '',
                role: 'customer',
            });
        } else if (props.type === 'update') {
            await updateUser();
        }
    };

    useEffect(() => {
        uploadAvatar();
    }, [avatar]);

    return (
        <div className="manage-user card">
            <form className="manage-user__form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="manage-user__form__upload">
                    <div
                        className="manage-user__form__upload__img overflow-hidden d-flex justify-content-center align-items-center"
                        style={{
                            backgroundImage: `url(${
                                userManageFormValues.photoUrl || user.photoUrl || defaultPhotoUrl
                            })`,
                        }}
                    >
                        {imageLoading && (
                            <div
                                className="manage-user__form__upload__img__loading text-primary spinner-border spinner-border-lg position-absolute "
                                role="status"
                            >
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}
                    </div>
                    <div className="manage-user__form__upload__control ">
                        <div className="manage-user__form__upload__control__btn text-danger form-group">
                            <label htmlFor="upload">
                                <i className="fa-solid fa-upload"></i>
                            </label>
                            <input
                                type="file"
                                className="form-control d-none"
                                id="upload"
                                onChange={(e) => setAvatar(e.target.files![0])}
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
                            value={userManageFormValues.email}
                            aria-describedby="email"
                            placeholder="abc@gmail.com"
                        />
                        {<p>{errors.email?.message}</p>}
                    </div>
                    <div className="form-group col-6">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            // defaultValue={user.password}
                            value={userManageFormValues.password}
                            aria-describedby="password"
                            {...register('password', {
                                onChange: handlePasswordChange,
                            })}
                            placeholder="8 characters at least"
                        />
                        <p>{errors.password?.message}</p>
                    </div>
                    <div className="form-group col-6">
                        <label htmlFor="firstName">First name:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            // defaultValue={user.firstName}
                            value={userManageFormValues.firstName}
                            aria-describedby="fist name"
                            placeholder="John"
                            {...register('firstName', {
                                onChange: handleFirstNameChange,
                            })}
                        />
                        {<p>{errors.firstName?.message}</p>}
                    </div>
                    <div className="form-group col-6">
                        <label htmlFor="lastName">Last name:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            // defaultValue={user.lastName}
                            value={userManageFormValues.lastName}
                            aria-describedby="last name"
                            placeholder="Wick"
                            {...register('lastName', {
                                onChange: handleLastNameChange,
                            })}
                        />
                        {<p>{errors.lastName?.message}</p>}
                    </div>
                    <div className="form-group col-6">
                        <label htmlFor="phone">Phone number:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="phone"
                            // defaultValue={user.phoneNumber}
                            value={userManageFormValues.phoneNumber}
                            aria-describedby="phone number"
                            placeholder="0921341215"
                            {...register('phoneNumber', {
                                onChange: handlePhoneNumberChange,
                            })}
                        />
                        <p>{errors.phoneNumber?.message}</p>
                    </div>
                    <div className="form-group col-6">
                        <label htmlFor="address">Address:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="address"
                            // defaultValue={user.address}
                            value={userManageFormValues.address}
                            aria-describedby="address"
                            placeholder="Hanoi"
                            {...register('address', {
                                onChange: handleAddressChange,
                            })}
                        />
                        <p>{errors.address?.message}</p>
                    </div>
                    <div className="form-group col-6">
                        <label htmlFor="role">Role:</label>
                        <select
                            id="role"
                            className="form-select col-6"
                            aria-label="role-select"
                            // defaultValue={user.role || 'customer'}
                            value={userManageFormValues.role || 'customer'}
                            {...register('role', {
                                onChange: handleRoleChange,
                            })}
                        >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="manage-user__form__buttons d-flex mt-5 justify-content-center align-items-center gap-3">
                    <button disabled={imageLoading || formLoading} className="btn btn-lg btn-primary " type="submit">
                        Confirm
                        {formLoading && (
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}
                    </button>
                    {props.type === 'update' && (
                        <button
                            disabled={imageLoading || formLoading}
                            className="btn btn-lg btn-secondary "
                            type="submit"
                            onClick={() => navigate(-1)}
                        >
                            Close
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UserManagePanel;
