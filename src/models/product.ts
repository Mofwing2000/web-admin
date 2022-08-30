export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    size: [
        { sizeName: 'XS'; isAvailable: boolean },
        { sizeName: 'S'; isAvailable: boolean },
        { sizeName: 'M'; isAvailable: boolean },
        { sizeName: 'L'; isAvailable: boolean },
        { sizeName: 'XL'; isAvailable: boolean },
        { sizeName: '2XL'; isAvailable: boolean },
        { sizeName: '3XL'; isAvailable: boolean },
        { sizeName: '4XL'; isAvailable: boolean },
        { sizeName: '5XL'; isAvailable: boolean },
    ];
    color: [
        { colorName: Color.WHITE; isAvailable: boolean },
        { colorName: Color.BLACK; isAvailable: boolean },
        { colorName: Color.RED; isAvailable: boolean },
        { colorName: Color.NAVY; isAvailable: boolean },
        { colorName: Color.YELLOW; isAvailable: boolean },
        { colorName: Color.PINK; isAvailable: boolean },
        { colorName: Color.BROWN; isAvailable: boolean },
        { colorName: Color.BLUE; isAvailable: boolean },
        { colorName: Color.GRAY; isAvailable: boolean },
    ];
    quantity: number;
    photoUrls: Array<string>;
    productType: ProductType;
    createdAt: Date;
    updatedAt: Date;
}

export enum ProductType {
    'BOTTOM' = 'bottom',
    'TOP' = 'top',
}

export interface ProductSize {}

export interface Top extends Product {
    category: [
        { categoryName: TopCategory.TOP; isCategory: true },
        { categoryName: TopCategory.T_SHIRT; isCategory: boolean },
        { categoryName: TopCategory.SWEAT_SHIRT; isCategory: boolean },
        { categoryName: TopCategory.JACKET; isCategory: boolean },
        { categoryName: TopCategory.HOODIE; isCategory: boolean },
    ];
}

export interface Bottom extends Product {
    category: [
        { categoryName: BottomCategory.BOTTOM; isCategory: true },
        { categoryName: BottomCategory.PANTS; isCategory: boolean },
        { categoryName: BottomCategory.SHORTS; isCategory: boolean },
        { categoryName: BottomCategory.JEANS; isCategory: boolean },
    ];
}

export enum Color {
    'WHITE' = 'white',
    'BLACK' = 'black',
    'RED' = 'red',
    'NAVY' = 'navy',
    'YELLOW' = 'yellow',
    'PINK' = 'pink',
    'BROWN' = 'brown',
    'BLUE' = 'blue',
    'GRAY' = 'gray',
}

export enum TopCategory {
    'TOP' = 'top',
    'T_SHIRT' = 't-shirt',
    'SWEAT_SHIRT' = 'sweat-shirt',
    'JACKET' = 'jacket',
    'HOODIE' = 'hoodie',
}

export enum BottomCategory {
    'BOTTOM' = 'bottom',
    'PANTS' = 'pants',
    'SHORTS' = 'short',
    'JEANS' = 'jeans',
}

export interface ProductState {
    isProductLoading: boolean;
    products: Array<Top | Bottom>;
    error: string;
}

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL';
