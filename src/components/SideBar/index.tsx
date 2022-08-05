import React from 'react';
import { Link } from 'react-router-dom';
import './side_bar.scss';
const SideBar = () => {
    return (
        <nav className="sidebar">
            <div className="sidebar__comp sidebar__general">
                <h2 className="sidebar__comp__title">Hello</h2>
                <ul className="sidebar__comp__nav">
                    <li className="sidebar__comp__nav-item">
                        <i className="sidebar__comp__nav-item__icon fa-solid fa-chart-line"></i>
                        <span className="sidebar__comp__nav-item__title">Dashboard</span>
                    </li>
                    <li className="sidebar__comp__nav-item">
                        <Link to="/user-manage">
                            <i className="sidebar__comp__nav-item__icon fa-solid fa-user"></i>
                            <span className="sidebar__comp__nav-item__title">User manage</span>
                        </Link>
                    </li>
                    <li className="sidebar__comp__nav-item">
                        <i className="sidebar__comp__nav-item__icon fa-solid fa-shirt"></i>
                        <span className="sidebar__comp__nav-item__title">Product manage</span>
                    </li>
                    <li className="sidebar__comp__nav-item">
                        <i className="sidebar__comp__nav-item__icon fa-solid fa-cart-shopping"></i>
                        <span className="sidebar__comp__nav-item__title">Order manage</span>
                    </li>
                </ul>
            </div>

            <div className="sidebar__comp sidebar__general">
                <h2 className="sidebar__comp__title">Admin</h2>
                <ul className="sidebar__comp__nav">
                    <li className="sidebar__comp__nav-item">
                        <i className="sidebar__comp__nav-item__icon fa-solid fa-user-tie"></i>
                        <span className="sidebar__comp__nav-item__title">Staffs Management</span>
                    </li>
                    <li className="sidebar__comp__nav-item">
                        <i className="sidebar__comp__nav-item__icon fa-brands fa-adversal"></i>
                        <span className="sidebar__comp__nav-item__title">Banners manage</span>
                    </li>
                    <li className="sidebar__comp__nav-item">
                        <i className="sidebar__comp__nav-item__icon fa-solid fa-layer-group"></i>
                        <span className="sidebar__comp__nav-item__title">Collections manage</span>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default SideBar;
