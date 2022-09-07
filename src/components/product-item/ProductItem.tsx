import React, { FC, memo, useMemo } from 'react';
import { Product } from '../../models/product';
import './product-item.scss';
import { DEFAULT_PRODUCT_PHOTO_URL as defaultPhotoImg } from '../../constants/commons';
import { Link } from 'react-router-dom';

interface IProps {
    product: Product;
}

const ProductCard: FC<IProps> = (props) => {
    const { product } = props;
    const colorsBar = useMemo(
        () =>
            product && (
                <div className="product-item__content__color me-5">
                    {product.color.map(
                        (color) =>
                            color.isAvailable && (
                                <span className="product-item__content__color__item " key={color.colorName}>
                                    <i
                                        className="fa-solid fa-circle"
                                        style={{ color: `${color.colorName.toLowerCase()}` }}
                                    ></i>
                                </span>
                            ),
                    )}
                </div>
            ),
        [product],
    );
    return (
        <div className="product-item mb-5 position-relative">
            <div className="product-item__pic">
                <Link to={`/product/view/${product.id}/${product.name.toLowerCase().replace(' ', '-')}`}>
                    <div
                        className="product-item__pic__photo"
                        // style={{ backgroundImage: `url(${product.photoUrls[0]}), url(${defaultPhotoImg})` }}
                    >
                        <img
                            className="w-100 h-100"
                            src={`${product.photoUrls[0]}`}
                            alt="product-item"
                            onError={({ currentTarget }) => {
                                if (currentTarget?.src) {
                                    currentTarget.src = defaultPhotoImg;
                                }
                            }}
                        />
                    </div>
                </Link>
            </div>
            <div className="product-item__content d-block">
                <Link to={`/product/view/${product.id}/${product.name.toLowerCase().replace(' ', '-')}`}>
                    <p className="product-item__content__name product-item__content__text  text-truncate">
                        {product.name}
                    </p>
                </Link>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="product-item__content__text fs-5 d-flex align-items-center m-0">${product.price}</p>
                    <>{colorsBar}</>
                </div>
            </div>
        </div>
    );
};

export default memo(ProductCard);
