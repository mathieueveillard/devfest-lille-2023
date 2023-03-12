import { Product, DiscountCode, ShoppingCart, EMPTY_CART, Delivery } from "..";

export const productOfPrice = (value: number, unit: "EUR"): Product => ({
  id: "FAKE_PRODUCT",
  price: {
    value,
    unit,
  },
});

export const discountOf = (value: number, unit: "%"): DiscountCode => ({
  code: "FAKE_DISCOUNT_CODE",
  discount: {
    value,
    unit,
  },
});

export const createShoppingCart = (cart: ShoppingCart = EMPTY_CART) => {
  const withProduct = (product: Product, quantity: number) => {
    return createShoppingCart({
      ...cart,
      items: [...cart.items, { product, quantity }],
    });
  };

  const withDiscountCode = (discountCode: DiscountCode) => {
    return createShoppingCart({
      ...cart,
      discountCode,
    });
  };

  const withDelivery = (delivery: Delivery) => {
    return createShoppingCart({
      ...cart,
      delivery,
    });
  };

  const build = (): ShoppingCart => {
    return cart;
  };

  return {
    withProduct,
    withDiscountCode,
    withDelivery,
    build,
  };
};
