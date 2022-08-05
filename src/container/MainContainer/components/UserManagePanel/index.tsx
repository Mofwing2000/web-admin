import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import auth, { storage, db } from '../../../../config/firebase.config';
import cuid from 'cuid';
import * as yup from 'yup';
import { UserManageFormValues } from '../../../../models/form';
import User from '../../../../models/user';
import { DEFAULT_USER_PHOTO_URL as defaultPhotoUrl } from '../../../../constants/commons';
import './user_management.scss';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
interface IProps {
    type: 'add' | 'update';
    data?: User;
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
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User>(() => {
        return props.data
            ? props.data
            : {
                  email: '',
                  password: '',
                  firstName: '',
                  lastName: '',
                  phoneNumber: '',
                  photoUrl: '',
                  address: '',
                  role: 'customer',
              };
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserManageFormValues>({
        resolver: yupResolver(schema),
    });

    let avatarUrl = avatar ? URL.createObjectURL(avatar) : user.photoUrl ? user.photoUrl : defaultPhotoUrl;

    const [userManageFormValues, setUserManageFormValues] = useState<UserManageFormValues>({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        photoUrl: '',
        phoneNumber: '',
        address: '',
        role: 'customer',
    });

    const handleEmailOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            email: e.target.value,
        });
    };

    const handlePasswordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            password: e.target.value,
        });
    };

    const handleFirstNameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            firstName: e.target.value,
        });
    };

    const handleLastNameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            lastName: e.target.value,
        });
    };

    const handlePhoneNumberOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            phoneNumber: e.target.value,
        });
    };

    const handleAddressOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            address: e.target.value,
        });
    };

    const handleRoleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserManageFormValues({
            ...userManageFormValues,
            role: e.target.value === 'customer' ? 'customer' : e.target.value === 'staff' ? 'staff' : 'admin',
        });
    };

    // const handleAvatarChange: React.FormEventHandler<HTMLInputElement> = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files[0];
    //     file.preview = URL.createObjectURL(file)
    //     // setAvatar(file);
    // };

    const setPhotoUrl = (photoUrl: string) => {
        setUserManageFormValues({
            ...userManageFormValues,
            photoUrl,
        });
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
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    const updateuser = () => {};

    const onSubmit = async (data: UserManageFormValues) => {
        setLoading(true);
        if (avatarUrl !== user.photoUrl && avatarUrl !== defaultPhotoUrl) {
            if (avatar) {
                const avatarFileName = cuid() + avatar.name;
                const storageRef = ref(storage, `userPhotos/${avatarFileName}`);
                const uploadTask = uploadBytesResumable(storageRef, avatar);
                uploadTask.on(
                    'state_changed',
                    () => {},
                    (error) => {
                        setLoading(false);
                        console.log(error);
                    },
                    async () => {
                        setLoading(false);
                        await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            setPhotoUrl(downloadURL);
                        });
                    },
                );
            }
        } else {
            setPhotoUrl(defaultPhotoUrl);
        }
        if (props.type === 'add') {
            await addUser();

            // setUserManageFormValues({
            //     email: '',
            //     password: '',
            //     firstName: '',
            //     lastName: '',
            //     phoneNumber: '',
            //     photoUrl: '',
            //     address: '',
            //     role: 'customer',
            // });
        }
    };
    console.log(userManageFormValues);
    // useEffect(() => {
    //     const uploadFile = () => {
    //         const fileName = cuid() + avatar?.name;
    //         console.log(fileName);
    //     };

    //     if (avatar) uploadFile();
    // }, [avatar && avatar]);

    return (
        <div className="add-user card">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="add-user__upload">
                    <div
                        className="add-user__upload__img"
                        style={{
                            backgroundImage: `url(${avatarUrl})`,
                        }}
                    ></div>
                    <div className="add-user__upload__control ">
                        <div className="add-user__upload__control__btn text-danger form-group">
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
                        <button className="add-user__upload__control__btn text-danger ">
                            <i className="fa-solid fa-user-pen"></i>
                        </button>
                    </div>
                </div>
                <div className="add-user__upload row d-flex">
                    <div className="form-group col-6">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            // defaultValue={user.email}
                            value={userManageFormValues.email}
                            aria-describedby="email"
                            placeholder="abc@gmail.com"
                            {...register('email')}
                            onChange={handleEmailOnChange}
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
                            {...register('password')}
                            onChange={handlePasswordOnChange}
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
                            {...register('firstName')}
                            onChange={handleFirstNameOnChange}
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
                            {...register('lastName')}
                            onChange={handleLastNameOnChange}
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
                            {...register('phoneNumber')}
                            onChange={handlePhoneNumberOnChange}
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
                            {...register('address')}
                            onChange={handleAddressOnChange}
                        />
                        <p>{errors.address?.message}</p>
                    </div>
                    <div className="form-group col-6">
                        <select
                            className="form-select col-6"
                            aria-label="role-select"
                            defaultValue="customer"
                            {...register('role')}
                            onChange={handleRoleOnChange}
                        >
                            <option selected={userManageFormValues.role === 'customer'} value="customer">
                                Customer
                            </option>
                            <option selected={userManageFormValues.role === 'staff'} value="staff">
                                Staff
                            </option>
                            <option selected={userManageFormValues.role === 'admin'} value="admin">
                                Admin
                            </option>
                        </select>
                    </div>
                </div>
                <button disabled={loading} className="btn btn-lg btn-success mx-auto d-block mt-5" type="submit">
                    Confirm
                    {loading && (
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    )}
                </button>
            </form>
        </div>
    );
};

export default UserManagePanel;
