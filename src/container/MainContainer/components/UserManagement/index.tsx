import React, { useEffect } from 'react';
import { UserDataFirebase } from '../../../../models/user';
import { useState } from 'react';
import { collection, deleteDoc, doc, getDocs, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../../../config/firebase.config';
import { PageLimit, PageSort } from '../../../../type/PageType';
import UserManagePanel from '../UserManagePanel';
import './user_management.scss';
import { useNavigate } from 'react-router-dom';
// const queries = [query(collection(db, 'user'))];

const UserManagement = () => {
    const [usersData, setUsersData] = useState<UserDataFirebase[]>();
    // const [curPage, setCurPage] = useState<Number>();
    // const [pageSize, setPageSize] = useState<PageLimit>();
    // const [sortType, setSortType] = useState<PageSort>();
    const [isEditing, setIsEditing] = useState<Boolean>(false);
    const [editingItem, setEditingItem] = useState<null | string>(null);
    const navigate = useNavigate();
    const handleUserDelete = async () => {
        if (editingItem) await deleteDoc(doc(db, 'user', editingItem));
        setEditingItem(null);
    };

    const handleView = (data: UserDataFirebase) => {
        navigate(`/profile/${data.id}`, { state: { ...data } });
    };

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, 'user'),
            (snapShot) => {
                let list: Array<UserDataFirebase> = [];
                snapShot.docs.forEach((docItem) => {
                    list.push({ id: docItem.id, ...docItem.data() } as UserDataFirebase);
                });
                setUsersData(list);
            },
            (error) => {
                console.log(error);
            },
        );
        return () => {
            unsub();
        };
    }, []);
    return (
        <div className="user-manage-container">
            <div className="user-manage-container__main-content position-relative">
                {isEditing ? (
                    <UserManagePanel type="add" />
                ) : (
                    <button
                        className="btn btn-success"
                        onClick={() => {
                            setIsEditing(true);
                        }}
                    >
                        Add user
                    </button>
                )}
                {isEditing && (
                    <i
                        className="user-manage-container__main-content__close fa-solid fa-xmark position-absolute top-0 end-0 fs-3 text-danger"
                        onClick={() => setIsEditing(false)}
                    ></i>
                )}
            </div>
            <div className="table-responsive-sm">
                <table className="table table-striped ">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone number</th>
                            <th scope="col">Address</th>
                            <th scope="col">Role</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersData?.map((userData, index) => (
                            <tr key={index}>
                                <td>{userData.id}</td>
                                <td>{userData.firstName + ' ' + userData.lastName}</td>
                                <td>{userData.email}</td>
                                <td>{userData.phoneNumber}</td>
                                <td>{userData.address}</td>
                                <td>{userData.role}</td>
                                <td>
                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                        <button className="btn btn-primary" onClick={() => handleView(userData)}>
                                            View
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
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="modal" id="confirmModal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Confirm action</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body">Do you want to do this?</div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={() => setEditingItem(null)}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                data-bs-dismiss="modal"
                                onClick={() => handleUserDelete()}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
