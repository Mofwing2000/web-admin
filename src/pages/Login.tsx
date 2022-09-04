import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../helpers/hooks';
import AuthState from '../models/auth';
import { LoginInput } from '../models/form';
import { loginAsync } from '../store/auth/auth.action';
import { selectAuth } from '../store/root-reducer';

const Login = () => {
    const { t } = useTranslation(['common', 'user']);
    const { userToken } = useAppSelector<AuthState>(selectAuth);
    const navigate = useNavigate();
    useEffect(() => {
        if (userToken) navigate('/');
    }, [userToken]);
    const schema = yup
        .object({
            email: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .email(`${t('common:validEmail')}`),
            password: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .min(8, `${t('common:validPasswordLength')}`),
        })
        .required();
    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: yupResolver(schema),
    });

    const [formValues, setFormValues] = useState<LoginInput>({
        email: '',
        password: '',
    });
    const onSubmit = (data: LoginInput) => {
        dispatch(loginAsync.request(data));
    };

    const handleEmailOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            email: e.target.value,
        });
    };

    const handlePasswordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            password: e.target.value,
        });
    };

    return (
        <div className="wrapper">
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-2-strong">
                            <form className="card-body p-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                                <h3 className="mb-5 text-center">{t('common:login')}</h3>
                                <div className="form-outline mb-4">
                                    <label className="form-label justify-content-start" htmlFor="typeEmailX-2">
                                        Email
                                    </label>
                                    <input
                                        {...register('email', {
                                            onChange: handleEmailOnChange,
                                        })}
                                        value={formValues.email}
                                        type="email"
                                        id="typeEmailX-2"
                                        className="form-control form-control-lg"
                                    />
                                    {errors.email && <p className="text-danger">{errors.email.message}</p>}
                                </div>

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="typePasswordX-2">
                                        {t('user:password')}
                                    </label>
                                    <input
                                        value={formValues.password}
                                        type="password"
                                        id="typePasswordX-2"
                                        className="form-control form-control-lg"
                                        {...register('password', {
                                            onChange: handlePasswordOnChange,
                                        })}
                                    />
                                    <p className="text-danger">{errors.password?.message}</p>
                                </div>
                                <div className="mb-4 text-center">
                                    <Link className="text-decoration-none text-danger" to={'/forgot-password'}>
                                        {t('common:forgotPassword')}
                                    </Link>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg btn-block text-center d-block mx-auto"
                                    type="submit"
                                >
                                    {t('common:login')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
