import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './side_bar.scss';
import { useAppSelector } from '../../helpers/hooks';
import { UserState } from '../../models/user';
import { selectUser } from '../../store/user/user.reducer';
const SideBar = () => {
    const { t } = useTranslation(['sidebar']);
    const { user } = useAppSelector<UserState>(selectUser);
    return (
        <nav className="sidebar">
            <div className="sidebar__comp sidebar__general mt-3">
                <h2 className="sidebar__comp__title">{t('sidebar:general')}</h2>
                <ul className="sidebar__comp__nav">
                    <li className="sidebar__comp__nav__item">
                        <Link to="/product">
                            <i className="sidebar__comp__nav__item__icon fa-solid fa-shirt"></i>
                            <span className="sidebar__comp__nav__item__title">{t('sidebar:productManage')}</span>
                        </Link>
                    </li>
                    <li className="sidebar__comp__nav__item">
                        <Link to="/order">
                            <i className="sidebar__comp__nav__item__icon fa-solid fa-cart-shopping"></i>
                            <span className="sidebar__comp__nav__item__title">{t('sidebar:orderManage')}</span>
                        </Link>
                    </li>
                    <li className="sidebar__comp__nav__item">
                        <Link to="/collection">
                            <i className="sidebar__comp__nav__item__icon fa-solid fa-layer-group"></i>
                            <span className="sidebar__comp__nav__item__title">{t('sidebar:collection')}</span>
                        </Link>
                    </li>
                </ul>
            </div>

            {user && user.role === 'admin' && (
                <div className="sidebar__comp sidebar__general mt-3">
                    <h2 className="sidebar__comp__title">Admin</h2>
                    <ul className="sidebar__comp__nav">
                        <li className="sidebar__comp__nav__item">
                            <Link to="/user">
                                <i className="sidebar__comp__nav__item__icon fa-solid fa-user"></i>
                                <span className="sidebar__comp__nav__item__title">{t('sidebar:userManage')}</span>
                            </Link>
                        </li>

                        <li className="sidebar__comp__nav__item">
                            <Link to="/dashboard">
                                <i className="sidebar__comp__nav__item__icon fa-solid fa-chart-line"></i>
                                <span className="sidebar__comp__nav__item__title">Dashboard</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default SideBar;
