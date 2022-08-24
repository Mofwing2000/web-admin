import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { useAppDispatch } from '../helpers/hooks';
import { LoginInput } from '../models/form';
import { loginAsync } from '../store/auth/auth.action';

const schema = yup
    .object({
        email: yup.string().trim().required('This field is required!').email('Please enter a valid email!'),
        password: yup
            .string()
            .trim()
            .required('This field is required!')
            .min(8, 'Password must have at least 8 characters!'),
    })
    .required();

const Login = () => {
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

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="typePasswordX-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="typePasswordX-2"
                                        className="form-control form-control-lg"
                                        {...register('password')}
                                        onChange={handlePasswordOnChange}
                                    />
                                    <p>{errors.password?.message}</p>
                                </div>

                                <div className="mb-4">
                                    <Link className="text-decoration-none text-reset" to={'/signup'}>
                                        Don&#39;t have an account?
                                    </Link>
                                </div>

                                <div className="mb-4 text-center">
                                    <Link className="text-decoration-none text-danger" to={'/forgot-password'}>
                                        Forgot password?
                                    </Link>
                                </div>

                                <button className="btn btn-primary btn-lg btn-block text-center" type="submit">
                                    Login
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
