import i18next from 'i18next';
import React, { memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Logo from '../../assets/image/logo.png';
import { DEFAULT_USER_PHOTO_URL as defaultUserPhoto } from '../../constants/commons';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { UserState } from '../../models/user';
import { logout } from '../../store/auth/auth.action';
import { toggleDarkMode } from '../../store/dark-mode/dark-mode.action';
import { selectUser } from '../../store/user/user.reducer';

import './header.scss';

const Header = () => {
    const { user } = useAppSelector<UserState>(selectUser);
    const dispatch = useAppDispatch();
    const handleLogout = useCallback(() => {
        dispatch(logout());
        i18next.changeLanguage('en');
    }, []);

    const { i18n, t } = useTranslation(['common']);

    useEffect(() => {
        if (localStorage.getItem('i18nextLng')!.length > 2) {
            i18next.changeLanguage('en');
        }
    }, []);

    const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    }, []);

    return (
        <header className="header">
            <nav className="header__nav">
                <div className="header__nav__logo">
                    <Link to="/">
                        <img src={Logo} alt="logo" />
                    </Link>
                </div>
                <div className="header__nav__control">
                    <i className="fa-solid fa-sun" onClick={() => dispatch(toggleDarkMode())}></i>
                    <select
                        className="header__nav__control__language form-select form-select-sm"
                        aria-label="Language select"
                        onChange={handleLanguageChange}
                        value={localStorage.getItem('i18nextLng') || 'en'}
                    >
                        <option value="en">English</option>
                        <option value="vn">Tiếng Việt</option>
                    </select>
                    <div className="header__nav__control--dropdown dropdown">
                        <div
                            className="header__nav__control--dropdown__user"
                            id="dropdownUserIcon"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{
                                backgroundImage: user?.photoUrl ? `url(${user.photoUrl})` : `url(${defaultUserPhoto}`,
                            }}
                        ></div>

                        <ul
                            className="header__nav__control--dropdown__menu dropdown-menu"
                            aria-labelledby="dropdownUserIcon"
                        >
                            <li>
                                <Link to={`user/view/${user?.id}`}>
                                    <i className="fa-solid fa-user me-3"></i>
                                    {t('common:profile')}
                                </Link>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className="btn btn-danger text-center d-block mx-auto"
                                    onClick={handleLogout}
                                >
                                    {t('common:logout')}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default memo(Header);
