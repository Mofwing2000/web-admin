import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { Bottom, Top } from '../../models/product';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { FreeMode, Navigation, Thumbs } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import './product-profile.scss';
import { FirebaseError } from '@firebase/util';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const ProductProfile = () => {
    const { t } = useTranslation(['common', 'product']);
    SwiperCore.use([Autoplay, Navigation, Thumbs]);
    const { productId } = useParams();
    const [productData, setProductData] = useState<Top | Bottom>();
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            const docRef = doc(db, 'product', productId as string);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setProductData(docSnap.data() as Top | Bottom);
                setIsLoading(false);
            } catch (error) {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <>
            {productData ? (
                <div className="product-profile position-relative">
                    <div className="product-profile__main row gx-5">
                        <div className="product-profile__main__gallery col-6">
                            <div className="product-profile__main__gallery__container">
                                <Swiper
                                    // loop={true}
                                    spaceBetween={10}
                                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                    modules={[FreeMode, Navigation, Thumbs]}
                                >
                                    {productData.photoUrls.map((photo, index) => (
                                        <SwiperSlide
                                            className="product-profile__main__gallery__slider__item"
                                            key={index}
                                        >
                                            <div
                                                className="product-profile__main__gallery__slider__item__container"
                                                style={{
                                                    backgroundImage: `url(${photo})`,
                                                }}
                                            ></div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            <div className="product-profile__main__gallery__slider mt-3">
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    // loop={true}
                                    spaceBetween={10}
                                    slidesPerView={4}
                                    freeMode={true}
                                    watchSlidesProgress={true}
                                    modules={[FreeMode, Navigation, Thumbs]}
                                    className="product-profile__main__gallery__slider__container"
                                >
                                    {productData.photoUrls.map((photo, index) => (
                                        <SwiperSlide
                                            className="product-profile__main__gallery__slider__item"
                                            key={index}
                                        >
                                            <div
                                                className="product-profile__main__gallery__slider__item__container"
                                                style={{
                                                    backgroundImage: `url(${photo})`,
                                                }}
                                            ></div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                        <div className="product-profile__main__info col-6">
                            <h2 className="product-profile__main__info__title">
                                {productData.name.toLocaleUpperCase()}
                            </h2>
                            <div className="product-profile__main__info__price">{productData.price + '$'}</div>
                            <div className="product-profile__main__info__quantity mt-2">
                                <span className="product-profile__main__info__quantity">{t('product:quantity')}: </span>
                                <span style={{ color: `${productData.quantity > 0 ? 'inherit' : '#e53637'}` }}>
                                    {productData.quantity > 0 ? productData.quantity : `${t('product:outOfStock')}`}
                                </span>
                            </div>
                            <div className="product-profile__main__info__color">
                                {productData.color.map(
                                    (color) =>
                                        color.isAvailable && (
                                            <span
                                                className="product-profile__main__info__color__item"
                                                key={color.colorName}
                                            >
                                                <i
                                                    className="fa-solid fa-circle"
                                                    style={{ color: `${color.colorName.toLowerCase()}` }}
                                                ></i>
                                            </span>
                                        ),
                                )}
                            </div>
                            <div className="product-profile__main__info__size d-flex gap-2">
                                {productData.size.map((size) => (
                                    <span
                                        className={`product-profile__main__info__size__item ${
                                            size.isAvailable ? 'in-stock' : 'out-stock'
                                        }`}
                                        key={size.sizeName}
                                    >
                                        {size.sizeName}
                                    </span>
                                ))}
                            </div>
                            <div className="product-profile__main__info__description">
                                <pre>
                                    <span className="product-profile__main__info__description__label">
                                        {t('common:description')}:
                                    </span>
                                    <br />
                                    {productData.description}
                                </pre>
                            </div>
                        </div>
                    </div>
                    <div className="product-profile__navigate mt-5 d-flex d-flex justify-content-center align-items-center gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                navigate(`/product/edit/${productData.id}/${productData.name}`);
                            }}
                        >
                            {t('common:edit')}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                navigate('/product');
                            }}
                        >
                            {t('common:close')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="product-profile text-center">
                    <p>{t('common:noData')}</p>
                </div>
            )}
            {isLoading && <LoadingModal />}
        </>
    );
};

export default ProductProfile;
