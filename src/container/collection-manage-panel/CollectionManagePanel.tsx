import { collection, query } from 'firebase/firestore';
import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db, storage } from '../../config/firebase.config';
import { Top, Bottom, ProductState } from '../../models/product';
import ReactTooltip from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import cuid from 'cuid';
import { DEFAULT_COLLECTION_PHOTO_URL as defaultCollectionBanner } from '../../constants/commons';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { FirebaseError } from '@firebase/util';
import { toast } from 'react-toastify';
import { Collection } from '../../models/collection';
import { CollectionAction } from '../../type/collection-manage';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { selectProduct } from '../../store/product/product.reducer';
import { fetchProductsAsync } from '../../store/product/product.action';
import { addCollectionAsync, updateColllectionAsync } from '../../store/collection/collection.action';

import './collection-manage-panel.scss';

interface IProps {
    action: CollectionAction;
    data?: Collection;
}
interface FormValue {
    title: string;
    description: string;
}

const CollectionManagePanel: FC<IProps> = (props) => {
    const { action, data } = props;
    const defaultCollection: Collection = {
        id: '',
        title: '',
        description: '',
        collectionBanner: defaultCollectionBanner,
        productsList: [],
        createdAt: new Date(Date.now()),
    };
    const collectionData: Collection = useMemo(() => {
        if (data) return { ...data };
        else return { ...defaultCollection };
    }, [data]);

    const [collectionValue, setCollectionValue] = useState<Collection>(collectionData);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [editingItem, setEditingItem] = useState<Top | Bottom>();
    const [banner, setBanner] = useState<File>();
    const [tooltip, setTooltip] = useState<boolean>(false);
    const { t } = useTranslation(['product', 'common']);
    const searchResultRef = useRef<HTMLUListElement>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const productQuery = useMemo(() => query(collection(db, 'product')), []);

    const schema = yup
        .object({
            title: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`),
            description: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`),
        })
        .required();

    const defaultFormValue = useMemo(() => {
        return {
            title: collectionData.title,
            description: collectionData.description,
        };
    }, [collectionData]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValue>({
        resolver: yupResolver(schema),
        defaultValues: { ...defaultFormValue },
    });

    const collectionProductValue = useMemo(() => {
        if (products) return products.filter((product) => collectionValue.productsList.includes(product.id));
    }, [collectionValue.productsList, products]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionValue((prev) => {
            return {
                ...prev,
                title: e.target.value,
            };
        });
    }, []);

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionValue((prev) => {
            return {
                ...prev,
                description: e.target.value,
            };
        });
    }, []);

    const isFileImage = useCallback((file: File) => {
        return file && file.type.split('/')[0] === 'image';
    }, []);

    const handleProductToggle = useCallback(
        (product: Top | Bottom) => {
            if (collectionValue.productsList?.includes(product.id)) {
                const index = collectionValue.productsList.findIndex((element) => element === product.id);
                const newArr = [...collectionValue.productsList];
                newArr.splice(index, 1);
                if (index != -1)
                    setCollectionValue((prev) => {
                        return { ...prev, productsList: [...newArr] };
                    });
            } else {
                setCollectionValue((prev) => {
                    return { ...prev, productsList: [...collectionValue.productsList, product.id] };
                });
            }
        },
        [collectionValue],
    );
    const handleProductDelete = useCallback(() => {
        if (editingItem) {
            const index = collectionValue.productsList.findIndex((element) => element === editingItem.id);
            const newArr = [...collectionValue.productsList];
            newArr.splice(index, 1);
            if (index != -1) setCollectionValue({ ...collectionValue, productsList: [...newArr] });
        }
        setEditingItem(undefined);
    }, [editingItem, collectionValue]);
    const handleView = useCallback((product: Top | Bottom) => {
        const productNameUrl = product.name.toLowerCase().replace(' ', '-');
        navigate(`/product/view/${product.id}/${productNameUrl}`);
    }, []);
    const uploadBanner = useCallback(async () => {
        if (banner) {
            setIsLoading(true);
            const bannerFileName = cuid() + banner.name;
            const storageRef = ref(storage, `userPhotos/${bannerFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, banner);
            uploadTask.on(
                'state_changed',
                () => {},
                (error) => {
                    setIsLoading(false);
                    if (error instanceof FirebaseError) toast(error.message);
                },
                async () => {
                    await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setCollectionValue((prev) => {
                            return {
                                ...prev,
                                collectionBanner: downloadURL,
                            };
                        });
                    });
                    setIsLoading(false);
                },
            );
        }
    }, [banner]);

    const addCollection = useCallback(async () => {
        try {
            const id = cuid();
            dispatch(
                addCollectionAsync.request({
                    ...collectionValue,
                    id: id,
                    description: collectionValue.description.replace('\\n', '\n'),
                    createdAt: new Date(Date.now()),
                }),
            );
            // await setDoc(doc(db, 'collection', id), {
            //     ...collectionValue,
            //     id: id,
            //     description: collectionValue.description.replace('\\n', '\n'),
            //     createdAt: new Date(Date.now()),
            // });
            setIsLoading(false);
            setBanner(undefined);
            setCollectionValue({ ...defaultCollection });
            reset({ ...defaultFormValue });
            setSearchValue('');
        } catch (error) {
            setIsLoading(false);
            if (error instanceof FirebaseError) toast(error.message);
        }
    }, [collectionValue]);

    const updateCollection = useCallback(async () => {
        dispatch(
            updateColllectionAsync.request({
                ...collectionValue,
            }),
        );
        setIsLoading(false);
    }, [collectionValue]);

    const onSubmit = useCallback(async () => {
        setIsLoading(true);
        if (collectionValue.productsList.length < 1) {
            toast.error(`${t('common:requireAProduct')}`);
            setIsLoading(false);
            return;
        }

        if (action === CollectionAction.ADD) await addCollection();
        else if (action === CollectionAction.UPDATE) await updateCollection();
    }, [collectionValue]);

    useEffect(() => {
        dispatch(fetchProductsAsync.request(productQuery));
    }, []);

    useEffect(() => {
        uploadBanner();
    }, [banner]);

    return (
        <>
            <div className="collection">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div
                        className="collection__banner position-relative mb-5"
                        style={{
                            backgroundImage: `url(${collectionValue.collectionBanner})`,
                        }}
                    >
                        <div className="collection__banner__upload text-danger form-group position-absolute h-100 w-100 d-flex align-items-center justify-content-center">
                            <label htmlFor="upload">
                                <i className="fa-solid fa-upload fs-1"></i>
                            </label>
                            <input
                                type="file"
                                className="form-control d-none"
                                id="upload"
                                onChange={(e) => isFileImage(e.target.files![0]) && setBanner(e.target.files![0])}
                                aria-describedby="upload"
                            />
                        </div>
                    </div>
                    <div className="collection__input d-flex align-items-center flex-column">
                        <div className="form-group col-12 col-xl-8 mb-3">
                            <label htmlFor="title">{t('common:collectionTitle')}</label>
                            <input
                                {...register('title', {
                                    onChange: handleTitleChange,
                                })}
                                value={collectionValue.title}
                                type="title"
                                className="form-control"
                                id="title"
                                aria-describedby="title"
                                placeholder="Summer collection 2022"
                            />
                            {<p className="text-danger">{errors.title?.message}</p>}
                        </div>
                        <div className=" col-12 col-xl-8">
                            <textarea
                                {...register('description', {
                                    onChange: handleDescriptionChange,
                                })}
                                value={collectionValue.description}
                                name="description"
                                className="form-control d-block collection__input__textarea"
                                placeholder={t('common:description')}
                                id="product-desc"
                            ></textarea>
                            {<p className="text-danger">{errors.description?.message}</p>}
                        </div>
                    </div>
                    <div className="collection__products d-flex align-items-center flex-column mt-5">
                        <div className="col-12 col-xl-8 ">
                            <div className="collection__products__search input-group position-relative">
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
                                    className="collection__products__search__list position-absolute light-bg justify-content-center align-items-center flex-column"
                                    ref={searchResultRef}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    {searchValue &&
                                        products &&
                                        products
                                            .filter(
                                                (product) =>
                                                    product.name &&
                                                    product.name.toLowerCase().includes(searchValue.toLowerCase()),
                                            )
                                            .slice(0, 10)
                                            .map((product, index) => (
                                                <li
                                                    key={index}
                                                    className="collection__products__search__list__item row p-3 w-100"
                                                >
                                                    <div className="col-2 col-xl-1">
                                                        <div
                                                            className="collection__products__search__list__item__image"
                                                            style={{ backgroundImage: `url(${product.photoUrls[0]})` }}
                                                        ></div>
                                                    </div>

                                                    <div className="collection__products__search__list__item__content col-10 col-xl-11 d-flex justify-content-between">
                                                        <p className="fw-bold">{product.name}</p>
                                                        <input
                                                            type="checkbox"
                                                            value={product.id}
                                                            defaultChecked={collectionValue.productsList!.includes(
                                                                product.id,
                                                            )}
                                                            onClick={() => {
                                                                handleProductToggle(product);
                                                            }}
                                                        />
                                                    </div>
                                                </li>
                                            ))}
                                </ul>
                            </div>
                        </div>
                        <div className="collection__products__table table-responsive-lg col-12">
                            <table className="table table-bordered mt-3">
                                <thead className="order-table__head">
                                    <tr className="d-flex">
                                        <th scope="col" className="col-2 d-inline-block text-truncate">
                                            {t('product:product')}
                                        </th>
                                        <th scope="col" className="col-8 d-inline-block text-truncate">
                                            {t('product:name')}
                                        </th>
                                        <th scope="col" className="col-2 d-inline-block text-truncate">
                                            {t('common:action')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {useMemo(() => {
                                        if (collectionProductValue && collectionProductValue?.length)
                                            return collectionProductValue.map((product, index) => (
                                                <tr key={index} className="d-flex">
                                                    <td className="collection__products__table__img-container col-2 d-inline-block text-truncate">
                                                        <div
                                                            className="collection__products__table__img-container__content"
                                                            style={{ backgroundImage: `url(${product.photoUrls[0]})` }}
                                                        ></div>
                                                    </td>
                                                    <td className={` col-8 d-inline-block text-truncate`}>
                                                        <span
                                                            data-tip
                                                            data-for={product.id + 'name'}
                                                            onMouseEnter={() => setTooltip(true)}
                                                            onMouseLeave={() => setTooltip(false)}
                                                        >
                                                            {product.name}
                                                        </span>
                                                        {tooltip && (
                                                            <ReactTooltip id={product.id + 'name'} effect="float">
                                                                <span>{product.name}</span>
                                                            </ReactTooltip>
                                                        )}
                                                    </td>
                                                    <td className="col-2 d-inline-block text-truncate">
                                                        <div className="d-flex  align-items-center gap-2">
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => handleView(product)}
                                                            >
                                                                {t('common:view')}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#collectionPanelconfirmModal"
                                                                onClick={() => {
                                                                    setEditingItem(product);
                                                                }}
                                                            >
                                                                {t('common:delete')}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ));
                                    }, [collectionProductValue])}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="collection__buttons d-flex justify-content-center align-items-center gap-3">
                        <button disabled={isLoading || isLoading} className="btn btn-lg btn-primary " type="submit">
                            {t('common:confirm')}
                        </button>

                        <button
                            disabled={isLoading || isLoading}
                            className="btn btn-lg btn-secondary "
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('../../../collection');
                            }}
                        >
                            {t('common:cancel')}
                        </button>
                    </div>
                </form>
                <div className="modal" id="collectionPanelconfirmModal">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">{t('common:actionConfirm')}</h4>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>

                            <div className="modal-body">{t('common:confirmActionQuest')}</div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-dismiss="modal"
                                    onClick={() => setEditingItem(undefined)}
                                >
                                    {t('common:cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    data-bs-dismiss="modal"
                                    onClick={() => handleProductDelete()}
                                >
                                    {t('common:delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {(isLoading || isProductLoading) && <LoadingModal />}
        </>
    );
};

export default memo(CollectionManagePanel);
