import { collection, doc, onSnapshot, query, setDoc, updateDoc } from 'firebase/firestore';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db, storage } from '../../../../config/firebase.config';
import { Top, Bottom } from '../../../../models/product';
import ReactTooltip from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import './collection-manage-panel.scss';
import cuid from 'cuid';
import { DEFAULT_COLLECTION_PHOTO_URL as defaultCollectionBanner } from '../../../../constants/commons';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { FirebaseError } from '@firebase/util';
import { toast } from 'react-toastify';
import { Collection } from '../../../../models/collection';
import { CollectionAction } from '../../../../type/collection-manage';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingModal from '../../../../components/loading-modal/LoadingModal';
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
    }, []);

    const [collectionValue, setCollectionValue] = useState<Collection>(collectionData);
    const [productsList, setProductsList] = useState<(Top | Bottom)[]>();
    // const [collectionValue.productsList, setcollectionValue.productsList] = useState<(Top | Bottom)[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [editingItem, setEditingItem] = useState<Top | Bottom>();
    const [banner, setBanner] = useState<File>();
    const [tooltip, setTooltip] = useState<boolean>(false);
    const { t } = useTranslation(['product', 'common']);
    const searchResultRef = useRef<HTMLUListElement>(null);
    const navigate = useNavigate();

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

    const defaultFormValue = {
        title: collectionData.title,
        description: collectionData.description,
    };

    const {
        register,
        handleSubmit,
        reset,
        formState,
        formState: { errors, isSubmitSuccessful },
    } = useForm<FormValue>({
        resolver: yupResolver(schema),
        defaultValues: { ...defaultFormValue },
    });

    const collectionProductValue = useMemo(() => {
        if (productsList) return productsList.filter((product) => collectionValue.productsList.includes(product.id));
    }, [collectionValue.productsList]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionValue({
            ...collectionValue,
            title: e.target.value,
        });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionValue({
            ...collectionValue,
            description: e.target.value,
        });
    };
    // console.log(collectionValue);
    function isFileImage(file: File) {
        return file && file.type.split('/')[0] === 'image';
    }

    const handleProductToggle = (product: Top | Bottom) => {
        if (collectionValue.productsList?.includes(product.id)) {
            const index = collectionValue.productsList.findIndex(
                (element) => JSON.stringify(element) === JSON.stringify(product),
            );
            const newArr = [...collectionValue.productsList];
            newArr.splice(index, 1);
            if (index != -1) setCollectionValue({ ...collectionValue, productsList: [...newArr] });
        } else {
            setCollectionValue({ ...collectionValue, productsList: [...collectionValue.productsList, product.id] });
        }
    };
    const handleProductDelete = () => {
        if (editingItem) {
            const index = collectionValue.productsList.findIndex(
                (element) => JSON.stringify(element) === JSON.stringify(editingItem),
            );
            const newArr = [...collectionValue.productsList];
            newArr.splice(index, 1);
            if (index != -1) setCollectionValue({ ...collectionValue, productsList: [...newArr] });
        }
        setEditingItem(undefined);
    };
    const handleView = (product: Top | Bottom) => {
        const productNameUrl = product.name.toLowerCase().replace(' ', '-');
        navigate(`/product/view/${product.id}/${productNameUrl}`);
    };
    const uploadBanner = async () => {
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
    };

    const addCollection = async () => {
        try {
            const id = cuid();
            await setDoc(doc(db, 'collection', id), {
                ...collectionValue,
                id: id,
                description: collectionValue.description.replace('\\n', '\n'),
                createdAt: new Date(Date.now()),
            });
            setIsLoading(false);
            toast.success(`${t('common:updateCollectionSucceed')}`);
            setBanner(undefined);
            setCollectionValue({ ...defaultCollection });
            reset({ ...defaultFormValue });
            setSearchValue('');
        } catch (error) {
            setIsLoading(false);
            if (error instanceof FirebaseError) toast(error.message);
        }
    };

    const updateCollection = async () => {
        try {
            await updateDoc(doc(db, 'collection', data!.id), {
                ...collectionValue,
            });
            setIsLoading(false);
            toast.success(`${t('common:updateCollectionSucceed')}`);
        } catch (error) {
            setIsLoading(false);
            if (error instanceof FirebaseError) toast(error.message);
        }
    };

    const onSubmit = async () => {
        setIsLoading(true);
        if (collectionValue.productsList.length < 1) {
            toast.error(`${t('common:requireAProduct')}`);
            setIsLoading(false);
            return;
        }
        if (action === CollectionAction.ADD) await addCollection();
        else if (action === CollectionAction.UPDATE) await updateCollection();
    };

    useEffect(() => {
        const productQuery = query(collection(db, 'product'));
        const unsub = onSnapshot(productQuery, (snapShot) => {
            let list: Array<Top | Bottom> = [];
            snapShot.docs.forEach((docItem) => {
                list.push({ ...docItem.data() } as Top | Bottom);
            });
            setProductsList(list);
        });

        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        uploadBanner();
    }, [banner]);

    console.log(collectionValue);

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
                            {<p>{errors.title?.message}</p>}
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
                            {<p>{errors.description?.message}</p>}
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
                                        productsList &&
                                        productsList
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
                                    {collectionProductValue &&
                                        collectionProductValue.map((product, index) => (
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
                                                            data-bs-target="#confirmModal"
                                                            onClick={() => {
                                                                setEditingItem(product);
                                                            }}
                                                        >
                                                            {t('common:delete')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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
                            type="submit"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(-1);
                            }}
                        >
                            {t('common:cancel')}
                        </button>
                    </div>
                </form>
                <div className="modal" id="confirmModal">
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
            {isLoading && <LoadingModal />}
        </>
    );
};

export default CollectionManagePanel;
