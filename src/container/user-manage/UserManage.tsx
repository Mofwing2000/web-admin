import { collection, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import Pagination from '../../components/pagination/Pagination';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { User, UsersState } from '../../models/user';
import { clearUsers, deleteUsersAsync, fetchUsersAsync } from '../../store/users/users.action';
import { selectUsers } from '../../store/users/users.reducer';
import { PageLimit, PageOrder, PageUserSort } from '../../type/page-type';
import UserManagePanel from '../user-manage-panel/UserManagePanel';

import './user-manage.scss';

const UserManage = () => {
    const { users, isUserLoading } = useAppSelector<UsersState>(selectUsers);
    const [pageSize, setPageSize] = useState<PageLimit>(10);
    const [sortType, setSortType] = useState<PageUserSort>('id');
    const [sortOrder, setSortOrder] = useState<PageOrder>('asc');
    const [isEditing, setIsEditing] = useState<Boolean>(false);
    const [editingItem, setEditingItem] = useState<null | string>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [itemOffset, setItemOffset] = useState<number>(0);
    const [tooltip, setTooltip] = useState<boolean>(false);
    const { t } = useTranslation(['common', 'user']);
    const [currentFilteredUsers, setCurrentFilteredUsers] = useState<User[]>([]);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [searchValue, setSearchValue] = useState<string>();
    const searchResultRef = useRef<HTMLUListElement>(null);

    const handleUserDelete = useCallback(async () => {
        if (editingItem) dispatch(deleteUsersAsync.request(editingItem));
        // try {
        //     await deleteDoc(doc(db, 'user', editingItem));
        //     setIsLoading(false);
        //     toast.success(t('common:deleteProductSucceed'));
        // } catch (error) {
        //     setIsLoading(false);
        //     if (error instanceof FirebaseError) toast.error(error.message);
        // }
        setEditingItem(null);
    }, [editingItem]);

    const handlePageClick = useCallback(
        (event: { selected: number }) => {
            if (users) {
                const newOffset = (event.selected * pageSize) % users.length;
                setItemOffset(newOffset);
            }
            setCurrentPage(event.selected);
        },
        [users],
    );

    useEffect(() => {
        if (users) {
            const endOffset = itemOffset + pageSize;
            setCurrentFilteredUsers(users.slice(itemOffset, endOffset));
            setPageCount(Math.ceil(users.length / pageSize));
        }
    }, [itemOffset, users, pageSize]);

    const handleView = useCallback((data: User) => {
        navigate(`/user/view/${data.id}`);
    }, []);

    useEffect(() => {
        const filterQuery = query(collection(db, 'user'), orderBy(sortType, sortOrder));
        dispatch(fetchUsersAsync.request(filterQuery));
        return () => {
            dispatch(clearUsers());
        };
    }, [pageSize, sortType, sortOrder]);
    return (
        <div className="user-manage">
            <div className="row d-flex justify-content-end">
                <div className="col-xl-3 col-4">
                    <div className="user-manage__search input-group position-relative">
                        <input
                            type="search"
                            className="form-control"
                            aria-describedby="search"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => {
                                searchResultRef.current!.style.display = 'flex';
                            }}
                            onBlur={() => {
                                searchResultRef.current!.style.display = 'none';
                            }}
                        />
                        <span className="input-group-text">
                            <i className="fa fa-search" id="search"></i>
                        </span>
                        <ul
                            className="user-manage__search__list position-absolute light-bg w-100 justify-content-center align-items-center flex-column"
                            ref={searchResultRef}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {useMemo(
                                () =>
                                    searchValue &&
                                    users &&
                                    users
                                        .filter(
                                            (user) =>
                                                user.firstName &&
                                                user.lastName &&
                                                (user.firstName + ' ' + user.lastName)
                                                    .toLowerCase()
                                                    .includes(searchValue.toLowerCase()),
                                        )
                                        .slice(0, 5)
                                        .map((user, index) => (
                                            <li key={index} className="user-manage__search__list__item row p-3 w-100">
                                                <div className="col-3">
                                                    <div
                                                        className="user-manage__search__list__item__image"
                                                        style={{ backgroundImage: `url(${user.photoUrl})` }}
                                                    ></div>
                                                </div>

                                                <div className="user-manage__search__list__item__content col-9 d-flex justify-content-between">
                                                    <Link to={`view/${user.id}`} replace={true}>
                                                        <p className="fw-bold">{user.firstName + '' + user.lastName}</p>
                                                    </Link>
                                                </div>
                                            </li>
                                        )),
                                [users, searchValue],
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="user-manage__add position-relative">
                {isEditing ? (
                    <UserManagePanel type="add" />
                ) : (
                    <button
                        className="btn btn-success"
                        onClick={() => {
                            setIsEditing(true);
                        }}
                    >
                        {t('user:addUser')}
                    </button>
                )}
                {isEditing && (
                    <i
                        className="user-manage__add__close fa-solid fa-xmark position-absolute top-0 end-0 fs-3 text-danger"
                        onClick={() => setIsEditing(false)}
                    ></i>
                )}
            </div>
            <div className="user-manage__filter">
                <div className="user-manage__filter__control d-flex gap-5 mt-5">
                    <div className="form-group">
                        <label htmlFor="pageLimit">{t('common:itemsPerPage')}</label>
                        <select
                            defaultValue={10}
                            id="pageLimit"
                            className="form-select "
                            aria-label="pageLimit-select"
                            onChange={(e) =>
                                setPageSize(e.target.value === '10' ? 10 : e.target.value === '20' ? 20 : 50)
                            }
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sort">{t('common:sortBy')}</label>
                        <div className="d-flex">
                            <select
                                defaultValue={10}
                                id="sort"
                                className="form-select "
                                aria-label="sort-select"
                                onChange={(e) =>
                                    setSortType(
                                        e.target.value === 'id'
                                            ? 'id'
                                            : e.target.value === 'address'
                                            ? 'address'
                                            : 'role',
                                    )
                                }
                            >
                                <option value="default">{t('common:sortBy')}</option>
                                <option value="address">{t('user:address')}</option>
                                <option value="role">{t('user:role')}</option>
                            </select>
                            <button
                                className="btn btn-outline-secondary d-inline-block"
                                onClick={() => {
                                    if (sortOrder === 'asc') {
                                        setSortOrder('desc');
                                    } else setSortOrder('asc');
                                }}
                            >
                                {sortOrder === 'asc' ? (
                                    <i className="fa-solid fa-arrow-down-a-z"></i>
                                ) : (
                                    <i className="fa-solid fa-arrow-up-a-z"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="user-manage__table table-responsive-sm">
                <table className="user-manage__table table table-bordered mt-3">
                    <thead className="user-manage__table__head">
                        <tr className="d-flex">
                            <th scope="col" className="col-1 d-inline-block text-truncate">
                                {t('user:user')}
                            </th>
                            <th scope="col" className="col-2 d-inline-block text-truncate">
                                {t('user:name')}
                            </th>
                            <th scope="col" className="col-3 d-inline-block text-truncate">
                                Email
                            </th>
                            <th scope="col" className="col-1 d-inline-block text-truncate">
                                {t('user:phoneNumber')}
                            </th>
                            <th scope="col" className="col-2 d-inline-block text-truncate">
                                {t('user:address')}
                            </th>
                            <th scope="col" className="col-1 d-inline-block text-truncate">
                                {t('user:role')}
                            </th>
                            <th scope="col" className="col-2 d-inline-block text-truncate">
                                {t('common:action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="user-manage__table__body">
                        {useMemo(
                            () =>
                                currentFilteredUsers &&
                                currentFilteredUsers!.map((userData, index) => (
                                    <tr className="user-manage__table__body__row d-flex" key={index}>
                                        <td className="user-manage__table__body__row__data user-image col-1 d-inlne-block text-truncate">
                                            <div
                                                className="user-manage__table__body__row__data__img"
                                                style={{ backgroundImage: `url(${userData.photoUrl})` }}
                                            ></div>
                                        </td>
                                        <td className="product-manage__table__body__row__data col-2 d-inline-block text-truncate">
                                            <span
                                                data-tip
                                                data-for={userData.id + 'name'}
                                                onMouseEnter={() => setTooltip(true)}
                                                onMouseLeave={() => setTooltip(false)}
                                            >
                                                {userData.firstName + ' ' + userData.lastName}
                                            </span>
                                            {tooltip && (
                                                <ReactTooltip id={userData.id + 'name'} effect="float">
                                                    <span>{userData.firstName + ' ' + userData.lastName}</span>
                                                </ReactTooltip>
                                            )}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-3 d-inline-block text-truncate">
                                            <span
                                                data-tip
                                                data-for={userData.id + 'email'}
                                                onMouseEnter={() => setTooltip(true)}
                                                onMouseLeave={() => setTooltip(false)}
                                            >
                                                {userData.email}
                                            </span>
                                            {tooltip && (
                                                <ReactTooltip id={userData.id + 'email'} effect="float">
                                                    <span>{userData.email}</span>
                                                </ReactTooltip>
                                            )}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                            <span
                                                data-tip
                                                data-for={userData.id + 'phone'}
                                                onMouseEnter={() => setTooltip(true)}
                                                onMouseLeave={() => setTooltip(false)}
                                            >
                                                {userData.phoneNumber}
                                            </span>
                                            {tooltip && (
                                                <ReactTooltip id={userData.id + 'phone'} effect="float">
                                                    <span>{userData.phoneNumber}</span>
                                                </ReactTooltip>
                                            )}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-2 d-inline-block text-truncate">
                                            <span
                                                data-tip
                                                data-for={userData.id + 'address'}
                                                onMouseEnter={() => setTooltip(true)}
                                                onMouseLeave={() => setTooltip(false)}
                                            >
                                                {userData.address}
                                            </span>
                                            {tooltip && (
                                                <ReactTooltip id={userData.id + 'address'} effect="float">
                                                    <span>{userData.address}</span>
                                                </ReactTooltip>
                                            )}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-1 d-inline-block text-truncate">
                                            {t(`user:${userData.role}`)}
                                        </td>
                                        <td className="product-manage__table__body__row__data col-2 d-inline-block text-truncate">
                                            <div>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleView(userData)}
                                                >
                                                    {t('common:view')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#confirmModal"
                                                    onClick={() => {
                                                        setEditingItem(userData.id);
                                                    }}
                                                >
                                                    {t('common:delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )),
                            [currentFilteredUsers],
                        )}
                    </tbody>
                </table>
            </div>
            <div className="user-manage__table__pagination">
                {currentFilteredUsers && (
                    <Pagination onPageChange={handlePageClick} pageCount={pageCount} curPage={currentPage} />
                )}
            </div>
            <div className="modal" id="confirmModal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">{t('common:confirmAction')}</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body">{t('common:actionConfirmQuest')}</div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={() => setEditingItem(null)}
                            >
                                {t('common:cancel')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                data-bs-dismiss="modal"
                                onClick={() => handleUserDelete()}
                            >
                                {t('common:delete')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isUserLoading && <LoadingModal />}
        </div>
    );
};

export default UserManage;
