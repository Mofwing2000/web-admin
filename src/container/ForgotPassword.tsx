import { FirebaseError } from '@firebase/util';
import { yupResolver } from '@hookform/resolvers/yup';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import LoadingModal from '../components/loading-modal/LoadingModal';
import auth from '../config/firebase.config';
import { useAppDispatch } from '../helpers/hooks';
import { ForgotPasswordInput } from '../models/form';

const ForgotPassword = () => {
    const { t } = useTranslation(['common', 'user']);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const schema = yup
        .object({
            email: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .email(`${t('common:validEmail')}`),
        })
        .required();
    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordInput>({
        resolver: yupResolver(schema),
    });

    const [formValues, setFormValues] = useState<ForgotPasswordInput>({
        email: '',
    });
    const onSubmit = async (data: ForgotPasswordInput) => {
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, data.email);
            setIsLoading(false);
            toast.success(t('common:confirmEmailSent'));
        } catch (error) {
            if (error instanceof FirebaseError) {
                setIsLoading(false);
                toast.error(error.message);
            }
        }
    };

    const handleEmailOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            email: e.target.value,
        });
    };

    return (
        <div className="wrapper">
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-2-strong">
                            <form className="card-body p-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                                <h3 className="mb-5 text-center">Sign in</h3>
                                <div className="form-outline mb-4">
                                    <label className="form-label justify-content-start" htmlFor="typeEmailX-2">
                                        Email
                                    </label>
                                    <input
                                        defaultValue={formValues.email}
                                        type="email"
                                        id="typeEmailX-2"
                                        className="form-control form-control-lg"
                                        {...register('email')}
                                        onChange={handleEmailOnChange}
                                    />
                                    {errors.email && <p>{errors.email.message}</p>}
                                </div>

                                <button
                                    className="btn btn-primary btn-lg btn-block text-center d-block mx-auto"
                                    type="submit"
                                >
                                    {t('common:confirm')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {isLoading && <LoadingModal />}
        </div>
    );
};

export default ForgotPassword;
