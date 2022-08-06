import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assests/image/logo.png';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { logout } from '../../store/auth/auth.action';
import { selectAuth } from '../../store/rootReducer';
import { DEFAULT_USER_PHOTO_URL as defaultUserPhoto } from '../../constants/commons';
import './header.scss';
const Header = () => {
    const { currentUser } = useAppSelector<any>(selectAuth);
    const dispatch = useAppDispatch();
    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <header className="header">
            <nav className="header__nav">
                <div className="header__nav__logo">
                    <Link to="/">
                        <img src={Logo} alt="logo" />
                    </Link>
                </div>
                <div className="header__nav__control">
                    <i className="fa-solid fa-sun"></i>
                    <select
                        className="header__nav__control__language form-select form-select-sm"
                        aria-label="Language select"
                    >
                        <option value="1">English</option>
                        <option value="2">Tiếng Việt</option>
                    </select>
                    <div className="header__nav__control--dropdown dropdown">
                        <div
                            className="header__nav__control--dropdown__user"
                            id="dropdownUserIcon"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{
                                backgroundImage: currentUser.photoUrl
                                    ? `url(${currentUser.photoUrl})`
                                    : `url(${defaultUserPhoto}`,
                            }}
                        ></div>

                        <ul
                            className="header__nav__control--dropdown__menu dropdown-menu"
                            aria-labelledby="dropdownUserIcon"
                        >
                            <li>
                                <Link to={`profile/${currentUser.id}`}>
                                    <i className="fa-solid fa-user me-3"></i>
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className="btn btn-danger text-center d-block mx-auto"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
