import { yupResolver } from '@hookform/resolvers/yup';
import cuid from 'cuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { storage } from '../../config/firebase.config';
import { DEFAULT_PRODUCT_PHOTO_URL as defaultPhotoUrl } from '../../constants/commons';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import {
    Bottom,
    BottomCategory,
    Color,
    Product,
    ProductState,
    ProductType,
    Top,
    TopCategory,
} from '../../models/product';
import { addProductAsync, updateProductAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { ProductAction } from '../../type/product-manage';

import './product-manage-panel.scss';

interface IProps {
    type: ProductAction;
    data?: Top | Bottom;
}

interface FormValue {
    name: string;
    description: string;
    price: number;
    quantity: number;
    size: Product['size'];
    color: Product['color'];
}

const ProductManagePanel: FC<IProps> = (props) => {
    const { t } = useTranslation(['common', 'product']);
    const dispatch = useAppDispatch();
    const { isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const schema = yup
        .object({
            name: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`),
            description: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`),
            price: yup.number().required(`${t('common:requiredMessage')}`),
            quantity: yup.number().required(`${t('common:requiredMessage')}`),
            size: yup
                .array()
                .required(`${t('common:selectOneSize')}`)
                .test(`${t('common:selectOneSize')}`, `${t('common:selectOneSize')}`, function (val) {
                    return val?.filter((item) => item.isAvailable === false).length === 0;
                })
                .min(1, `${t('common:selectOneSize')}`),
            color: yup
                .array()
                .required(`${t('common:selectOneColor')}`)
                .test(`${t('common:selectOneColor')}`, `${t('common:selectOneColor')}`, function (val) {
                    return val?.filter((item) => item.isAvailable === false).length === 0;
                })
                .min(1, `${t('common:selectOneColor')}`),
        })
        .required();

    const [productPhoto, setProductPhoto] = useState<File>();
    const [isLoading, setIsLoading] = useState(false);
    const defaultProductSize: Product['size'] = [
        { sizeName: 'XS', isAvailable: false },
        { sizeName: 'S', isAvailable: false },
        { sizeName: 'M', isAvailable: false },
        { sizeName: 'L', isAvailable: false },
        { sizeName: 'XL', isAvailable: false },
        { sizeName: '2XL', isAvailable: false },
        { sizeName: '3XL', isAvailable: false },
        { sizeName: '4XL', isAvailable: false },
        { sizeName: '5XL', isAvailable: false },
    ];
    const defaultProductColor: Product['color'] = [
        { colorName: Color.WHITE, isAvailable: false },
        { colorName: Color.BLACK, isAvailable: false },
        { colorName: Color.RED, isAvailable: false },
        { colorName: Color.NAVY, isAvailable: false },
        { colorName: Color.YELLOW, isAvailable: false },
        { colorName: Color.PINK, isAvailable: false },
        { colorName: Color.BROWN, isAvailable: false },
        { colorName: Color.BLUE, isAvailable: false },
        { colorName: Color.GRAY, isAvailable: false },
    ];
    const defaultTopCategory: Top['category'] = [
        { categoryName: TopCategory.TOP, isCategory: true },
        { categoryName: TopCategory.T_SHIRT, isCategory: false },
        { categoryName: TopCategory.SWEAT_SHIRT, isCategory: false },
        { categoryName: TopCategory.JACKET, isCategory: false },
        { categoryName: TopCategory.HOODIE, isCategory: false },
    ];
    const defaultBottomCategory: Bottom['category'] = [
        { categoryName: BottomCategory.BOTTOM, isCategory: true },
        { categoryName: BottomCategory.PANTS, isCategory: false },
        { categoryName: BottomCategory.SHORTS, isCategory: false },
        { categoryName: BottomCategory.JEANS, isCategory: false },
    ];
    const defaultTop: Top = {
        id: '',
        name: '',
        description: '',
        price: 0,
        size: defaultProductSize,
        quantity: 0,
        photoUrls: [],
        color: defaultProductColor,
        productType: ProductType.TOP,
        category: defaultTopCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const defaultBottom: Bottom = {
        id: '',
        name: '',
        description: '',
        price: 0,
        size: defaultProductSize,
        quantity: 0,
        photoUrls: [],
        color: defaultProductColor,
        productType: ProductType.TOP,
        category: defaultBottomCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const navigate = useNavigate();
    const product: Top | Bottom = useMemo(() => {
        if (props.data) {
            if (props.data!.productType === ProductType.TOP) return { ...props.data } as Top;
            else return { ...props.data } as Bottom;
        } else {
            if (props.type === 'add-top') return defaultTop;
            else return defaultBottom;
        }
    }, [props.data]);
    const defaultFormValue = {
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        size: product.size,
        color: product.color,
    };
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValue>({
        resolver: yupResolver(schema),
        defaultValues: { ...defaultFormValue },
    });
    const [productFormValue, setProductFormValue] = useState<Top | Bottom>(product);

    const isFileImage = useCallback((file: File) => {
        return file && file.type.split('/')[0] === 'image';
    }, []);

    const handleProductPhotoClick = useCallback(
        (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
            if (productFormValue.photoUrls.length > 8) {
                e.preventDefault();
                toast.warn('Photos reached limit!');
            }
        },
        [productFormValue],
    );

    const handleProductPhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFileImage(e.target.files![0])) setProductPhoto(e.target.files![0]);
    }, []);

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setProductFormValue((prev) => {
            return {
                ...prev,
                name: e.target.value,
            };
        });
    }, []);

    const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setProductFormValue((prev) => {
            return {
                ...prev,
                price: +e.target.value,
            };
        });
    }, []);

    const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setProductFormValue((prev) => {
            return {
                ...prev,
                quantity: +e.target.value,
            };
        });
    }, []);

    const handleSizeChange = useCallback((index: number) => {
        const tempProd = { ...productFormValue };
        const newSizeArr = tempProd.size;
        newSizeArr[index].isAvailable = !newSizeArr[index].isAvailable;
        setProductFormValue((prev) => {
            return {
                ...prev,
                size: [...newSizeArr],
            };
        });
    }, []);

    const handleColorChange = useCallback((index: number) => {
        const tempProd = { ...productFormValue };
        const newSizeArr = tempProd.color;
        newSizeArr[index].isAvailable = !newSizeArr[index].isAvailable;
        setProductFormValue((prev) => {
            return {
                ...prev,
                color: [...newSizeArr],
            };
        });
    }, []);

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setProductFormValue((prev) => {
            return {
                ...prev,
                description: e.target.value,
            };
        });
    }, []);

    const handleCategoryChange = useCallback(
        (index: number) => {
            if (product.productType === ProductType.TOP) {
                const tempProd = { ...productFormValue } as Top;
                const newSizeArr = tempProd.category;
                newSizeArr[index].isCategory = !newSizeArr[index].isCategory;
                setProductFormValue((prev) => {
                    return {
                        ...prev,
                        category: [...newSizeArr],
                    };
                });
            } else {
                const tempProd = { ...productFormValue } as Bottom;
                const newSizeArr = tempProd.category;
                newSizeArr[index].isCategory = !newSizeArr[index].isCategory;
                setProductFormValue((prev) => {
                    return {
                        ...prev,
                        category: [...newSizeArr],
                    };
                });
            }
        },
        [product],
    );

    const uploadproductPhoto = useCallback(async () => {
        if (productPhoto) {
            setIsLoading(true);
            const productPhotoFileName = cuid() + productPhoto.name;
            const storageRef = ref(storage, `productPhotos/${productPhotoFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, productPhoto);
            uploadTask.on(
                'state_changed',
                () => {},
                (error) => {
                    setIsLoading(false);
                    toast.error(error.message);
                },
                async () => {
                    setIsLoading(false);
                    await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setProductFormValue((prev) => {
                            return {
                                ...prev,
                                photoUrls: [...prev.photoUrls, downloadURL],
                            };
                        });
                    });
                    setProductPhoto(undefined);
                },
            );
        }
    }, [productPhoto]);

    const updateProduct = useCallback(async () => {
        dispatch(
            updateProductAsync.request({
                ...productFormValue,
                updatedAt: new Date(Date.now()),
            }),
        );
    }, [productFormValue]);

    const addProduct = useCallback(async () => {
        const id = cuid();
        dispatch(
            addProductAsync.request({
                ...productFormValue,
                id: id,
                description: productFormValue.description.replace('\\n', '\n'),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            }),
        );
        setProductPhoto(undefined);
        if (props.type === 'add-top') setProductFormValue({ ...defaultTop });
        else if (props.type === 'add-bottom') setProductFormValue({ ...defaultBottom });
        reset({ ...defaultFormValue });
    }, [productFormValue]);

    const onSubmit = useCallback(async () => {
        setIsLoading(true);
        if (productFormValue.photoUrls.length < 1) {
            toast.error(`${t('common:requireAPhoto')}`);
            setIsLoading(false);
            return;
        }
        if (props.type === 'add-top' || props.type === 'add-bottom') {
            await addProduct();
            setIsLoading(false);
            // navigate(-1);
        } else if (props.type === 'update') {
            await updateProduct();
            setIsLoading(false);
            navigate(-1);
        }
    }, [productFormValue]);

    useEffect(() => {
        uploadproductPhoto();
    }, [productPhoto]);
    return (
        <div className="manage-product card">
            <form className="manage-product__form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="manage-product__form__upload">
                    <div className="manage-product__form__upload__galery row">
                        <div className="col-6 position-relative">
                            <div
                                className="manage-product__form__upload__gallery__main"
                                style={{
                                    backgroundImage: `url(${productFormValue.photoUrls[0] || defaultPhotoUrl})`,
                                }}
                            ></div>
                        </div>
                        <div className="manage-product__form__upload__gallery__grid col-6 row position-relative">
                            {useMemo(
                                () =>
                                    productFormValue.photoUrls &&
                                    productFormValue.photoUrls.map((item, index) => (
                                        <div id={`${index}`} key={index} className="col-4 ">
                                            <div
                                                className="manage-product__form__upload__gallery__grid__item position-relative"
                                                style={{
                                                    backgroundImage: `url(${item})`,
                                                }}
                                            >
                                                <i
                                                    className="manage-product__form__upload__gallery__grid__item__close fa-solid fa-xmark position-absolute top-0 end-0 fs-5 text-danger"
                                                    onClick={() => {
                                                        const splicedArr = [...productFormValue.photoUrls];
                                                        splicedArr.splice(index, 1);
                                                        setProductFormValue((prev) => {
                                                            return {
                                                                ...prev,
                                                                photoUrls: [...splicedArr],
                                                            };
                                                        });
                                                    }}
                                                ></i>
                                            </div>
                                        </div>
                                    )),
                                [productFormValue.photoUrls],
                            )}
                        </div>
                    </div>
                    <div className="manage-product__form__upload__control mx-auto mt-4">
                        <div className="manage-product__form__upload__control__btn text-danger form-group">
                            <label htmlFor="upload">
                                <i className="fa-solid fa-upload"></i>
                            </label>
                            <input
                                type="file"
                                className="form-control d-none"
                                id="upload"
                                onClick={handleProductPhotoClick}
                                onChange={handleProductPhotoChange}
                                aria-describedby="upload"
                            />
                        </div>
                        <button className="manage-product__form__upload__control__btn text-danger ">
                            <i className="fa-solid fa-user-pen"></i>
                        </button>
                    </div>
                </div>
                <div className="manage-product__form__info row gy-4">
                    <div className="manage-product__form__info__input form-group col-8">
                        <label htmlFor="name">{t('product:name')}:</label>
                        <input
                            {...register('name', {
                                onChange: handleNameChange,
                            })}
                            type="text"
                            className="form-control"
                            id="name"
                            value={productFormValue.name}
                            aria-describedby="name"
                            placeholder="Super cool shirt"
                        />
                        {<p className="text-danger">{errors.name?.message}</p>}
                    </div>
                    <div className="manage-product__form__info__input form-group col-2 ">
                        <label htmlFor="quantity">{t('product:quantity')}:</label>
                        <input
                            {...register('quantity', {
                                onChange: handleQuantityChange,
                            })}
                            type="number"
                            className="manage-product__form__info__input__quantity form-control"
                            id="quantity"
                            value={productFormValue.quantity}
                            aria-describedby="quantity"
                        />
                        {<p className="text-danger">{errors.name?.message}</p>}
                    </div>
                    <div className="manage-product__form__info__input form-group col-2 ">
                        <label htmlFor="quantity">{t('product:price')}:</label>
                        <input
                            {...register('price', {
                                onChange: handlePriceChange,
                            })}
                            type="number"
                            className="manage-product__form__info__input__price form-control"
                            id="quantity"
                            value={productFormValue.price}
                            aria-describedby="quantity"
                        />
                        {<p className="text-danger">{errors.name?.message}</p>}
                    </div>
                    <div className="manage-product__form__info__input form-group row col-4 mx-0">
                        <label>{t('product:size')}:</label>
                        {productFormValue.size.map((item, index) => (
                            <div className="form-check col-6" key={index}>
                                <input
                                    className="form-check-input"
                                    {...register('size')}
                                    name="size"
                                    type="checkbox"
                                    defaultValue={item.sizeName}
                                    id={'size' + item.sizeName}
                                    defaultChecked={item.isAvailable}
                                    onClick={() => handleSizeChange(index)}
                                />
                                <label className="form-check-label" htmlFor={'size' + item.sizeName}>
                                    {item.sizeName}
                                </label>
                            </div>
                        ))}

                        {<p className="text-danger">{errors.size?.message}</p>}
                    </div>

                    <div className="manage-product__form__info__input form-group col-4 row mx-0">
                        <label>{t('product:color')}:</label>
                        {productFormValue.color.map((item, index) => (
                            <div className="form-check col-6" key={index}>
                                <input
                                    className="form-check-input "
                                    {...register('color')}
                                    name="color"
                                    type="checkbox"
                                    defaultValue={item.colorName}
                                    id={'color' + item.colorName}
                                    onClick={() => handleColorChange(index)}
                                    defaultChecked={item.isAvailable}
                                />
                                <label className="form-check-label" htmlFor={'color' + item.colorName}>
                                    {t(`product:${item.colorName}`)}
                                </label>
                            </div>
                        ))}

                        {<p className="text-danger">{errors.color?.message}</p>}
                    </div>

                    <div className="manage-product__form__info__input form-group row col-4 mx-0">
                        <label>{t('product:category')}:</label>
                        {productFormValue.category.map((item, index) => (
                            <div className="form-check  col-6" key={index}>
                                <input
                                    className="form-check-input"
                                    // {...register('category')}
                                    name="category"
                                    type="checkbox"
                                    defaultValue={item.categoryName}
                                    id={'category' + item.categoryName}
                                    defaultChecked={item.isCategory}
                                    onClick={() => handleCategoryChange(index)}
                                    disabled={item.categoryName === 'bottom' || item.categoryName === 'top'}
                                />
                                <label className="form-check-label" htmlFor={'category' + item.categoryName}>
                                    {t(`product:${item.categoryName}`)}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="manage-product__form__info__input form-floating">
                        <textarea
                            {...register('description', {
                                onChange: handleDescriptionChange,
                            })}
                            name="description"
                            className="form-control"
                            placeholder="Description"
                            id="product-desc"
                            value={productFormValue.description}
                            style={{ height: '400px' }}
                        ></textarea>
                        <label htmlFor="product-desc">Description</label>
                        {<p className="text-danger">{errors.description?.message}</p>}
                    </div>
                </div>
                <div className="manage-product__form__buttons d-flex mt-5 justify-content-center align-items-center gap-3">
                    <button disabled={isLoading || isProductLoading} className="btn btn-lg btn-primary " type="submit">
                        {t('common:confirm')}
                    </button>
                    {props.type === 'update' && (
                        <button
                            disabled={isLoading || isProductLoading}
                            className="btn btn-lg btn-secondary "
                            onClick={() => navigate('/product')}
                        >
                            {t('common:close')}
                        </button>
                    )}
                </div>
            </form>
            {isLoading && <LoadingModal />}
        </div>
    );
};

export default ProductManagePanel;
