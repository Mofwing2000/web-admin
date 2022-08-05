import React, { useEffect } from 'react';
import User from '../../../../models/user';
import { useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../../config/firebase.config';
import { PageLimit, PageSort } from '../../../../type/PageType';
import UserManagePanel from '../UserManagePanel';
const queries = [query(collection(db, 'user'))];

const UserManagement = () => {
    const [usersData, setUsersData] = useState<any[]>();
    const [curPage, setCurPage] = useState<Number>();
    const [pageSize, setPageSize] = useState<PageLimit>();
    const [sortType, setSortType] = useState<PageSort>();
    const [isAdding, setIsAdding] = useState<Boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            let list: Array<any> = [];
            try {
                const querySnapshot = await getDocs(collection(db, 'user'));
                querySnapshot.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setUsersData(list);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, []);
    return (
        <div>
            {isAdding ? (
                <UserManagePanel type="add" />
            ) : (
                <button
                    className="btn btn-success"
                    onClick={() => {
                        setIsAdding(true);
                    }}
                >
                    Add user
                </button>
            )}

            <table
                className="table table-striped"
                data-show-columns="true"
                data-search="true"
                data-show-toggle="true"
                data-pagination="true"
                data-url="json/data1.json"
                data-resizable="true"
            >
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
                                <div>
                                    <button className="btn btn-primary">View</button>
                                    <button className="btn btn-danger">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
