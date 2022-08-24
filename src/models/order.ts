import { Color, Size } from './product';

export interface Order {
    id: string;
    userId: string;
    orderedProducts: Array<OrderdItem>;
    shippingAddress: string;
    paymentMethod: PaymentMethod;
    shippingType: ShippingType;
    orderState: OrderState;
    note: string;
    orderDate: Date;
    totalAmount: number;
    shippingDate?: Date;
    receivingDate?: Date;
    trackingNumber?: string;
}

export enum ShippingClass {
    'ECONOMY' = 'economy',
    'FIRST_CLASS' = 'first-class',
}
export type ShippingType =
    | { shippingClass: ShippingClass.ECONOMY; price: 5 }
    | { shippingClass: ShippingClass.FIRST_CLASS; price: 10 };

export enum PaymentMethod {
    'COD' = 'cod',
    'CREDIT_CARD' = 'credit-card',
}

export enum OrderState {
    'PENDING' = 'pending',
    'SHIPPED' = 'shipped',
    'DELIVERED' = 'delivered',
    'CANCELED' = 'canceled',
}

export interface OrderdItem {
    id: string;
    quantity: number;
    color: Color;
    size: Size;
}
