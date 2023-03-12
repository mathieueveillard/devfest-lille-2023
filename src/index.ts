export type Value<Unit> = {
  value: number;
  unit: Unit;
};

export type Price = Value<"EUR">;

export const ZERO: Price = {
  value: 0,
  unit: "EUR",
};

export type Percentage = Value<"%">;

export type Product = {
  id: string;
  price: Price;
};

export type ShoppingCartItem = {
  product: Product;
  quantity: number;
};

export type DiscountCode = {
  code: string;
  discount: Percentage;
};

export const NO_DISCOUNT_CODE: DiscountCode = {
  code: "NO_DISCOUNT_CODE",
  discount: {
    value: 0,
    unit: "%",
  },
};

export type AbstractDelivery<Type> = {
  type: Type;
  price: Price;
};

export type StandardDelivery = AbstractDelivery<"STANDARD">;

export const STANDARD_DELIVERY: StandardDelivery = {
  type: "STANDARD",
  price: {
    value: 2.99,
    unit: "EUR",
  },
};

export type PriorityDelivery = AbstractDelivery<"PRIORITY">;

export const PRIORITY_DELIVERY: PriorityDelivery = {
  type: "PRIORITY",
  price: {
    value: 7.99,
    unit: "EUR",
  },
};

export type Delivery = StandardDelivery | PriorityDelivery;

export type ShoppingCart = {
  items: ShoppingCartItem[];
  discountCode: DiscountCode;
  delivery: Delivery;
};

export const EMPTY_CART: ShoppingCart = {
  items: [],
  discountCode: NO_DISCOUNT_CODE,
  delivery: STANDARD_DELIVERY,
};
