import { ShoppingCart, Price, PRIORITY_DELIVERY, ShoppingCartItem, DiscountCode, Delivery, ZERO } from ".";
import { createShoppingCart, discountOf, productOfPrice } from "./testUtils";
import sum from "./utils/sum";

/*
 * Situation initiale :
 * - tout est au même niveau d'abstraction
 * - beaucoup de mutations, autant de risques d'erreur
 */
test("Imperative style", () => {
  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    let price = 0;

    for (let index = 0; index < items.length; index++) {
      const { product, quantity } = items[index];
      price = price + product.price.value * quantity;
    }

    price = price * (1 - discountCode.discount.value / 100);

    price = price + delivery.price.value;

    return {
      value: price,
      unit: "EUR",
    };
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * Remplaçons la boucle for par un map + reduce
 */
test("Get rid of the for loop", () => {
  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    let price = items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);

    price = price * (1 - discountCode.discount.value / 100);

    price = price + delivery.price.value;

    return {
      value: price,
      unit: "EUR",
    };
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * Passage à un style déclaratif : plus de mutations
 */
test("Declarative style", () => {
  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    const subTotal = items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);

    const discountedSubTotal = subTotal * (1 - discountCode.discount.value / 100);

    const grandTotal = discountedSubTotal + delivery.price.value;

    return {
      value: grandTotal,
      unit: "EUR",
    };
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * On fait émerger des fonctions afin de monter en abstraction
 * et de faciliter la testabilité
 */
test("Writing functions", () => {
  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    const computeSubTotal = (): Price => {
      const value = items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);
      return {
        value,
        unit: "EUR",
      };
    };

    const applyDiscountCode = (price: Price): Price => {
      const value = price.value * (1 - discountCode.discount.value / 100);
      return {
        value,
        unit: "EUR",
      };
    };

    const addCostOfDelivery = (price: Price): Price => {
      const value = price.value + delivery.price.value;
      return {
        value,
        unit: "EUR",
      };
    };

    const subTotal = computeSubTotal();

    const discountedSubTotal = applyDiscountCode(subTotal);

    const grandTotal = addCostOfDelivery(discountedSubTotal);

    return grandTotal;
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * A ce stade, les fonctions pâtissent de "side causes"
 * (i.e. des variables dans leur scope qui déterminent le résultat)
 * Supprimons-les afin de rendre ces fonctions pures.
 */
test("Writing pure functions", () => {
  const computeSubTotal = (items: ShoppingCartItem[]): Price => {
    const value = items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);
    return {
      value,
      unit: "EUR",
    };
  };

  const applyDiscountCode = (discountCode: DiscountCode, price: Price): Price => {
    const value = price.value * (1 - discountCode.discount.value / 100);
    return {
      value,
      unit: "EUR",
    };
  };

  const addCostOfDelivery = (delivery: Delivery, price: Price): Price => {
    const value = price.value + delivery.price.value;
    return {
      value,
      unit: "EUR",
    };
  };

  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    const subTotal = computeSubTotal(items);
    const discountedSubTotal = applyDiscountCode(discountCode, subTotal);
    const grandTotal = addCostOfDelivery(delivery, discountedSubTotal);
    return grandTotal;
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * La signature de la fonction `computeSubTotal` n'est pas cohérente avec les 2 autres, on y remédie.
 */
test("A little bit of consistency", () => {
  const computeSubTotal = (items: ShoppingCartItem[], price: Price): Price => {
    const value = price.value + items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);
    return {
      value,
      unit: "EUR",
    };
  };

  const applyDiscountCode = (discountCode: DiscountCode, price: Price): Price => {
    const value = price.value * (1 - discountCode.discount.value / 100);
    return {
      value,
      unit: "EUR",
    };
  };

  const addCostOfDelivery = (delivery: Delivery, price: Price): Price => {
    const value = price.value + delivery.price.value;
    return {
      value,
      unit: "EUR",
    };
  };

  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    const subTotal = computeSubTotal(items, ZERO);
    const discountedSubTotal = applyDiscountCode(discountCode, subTotal);
    const grandTotal = addCostOfDelivery(delivery, discountedSubTotal);
    return grandTotal;
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * On tente de composer les fonctions pour éviter d'avoir à déclarer plein de constantes
 * Mais le résultat est strictement illisible.
 * Machine arrière !
 */
test("Composing functions", () => {
  const computeSubTotal = (items: ShoppingCartItem[], price: Price): Price => {
    const value = price.value + items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);
    return {
      value,
      unit: "EUR",
    };
  };

  const applyDiscountCode = (discountCode: DiscountCode, price: Price): Price => {
    const value = price.value * (1 - discountCode.discount.value / 100);
    return {
      value,
      unit: "EUR",
    };
  };

  const addCostOfDelivery = (delivery: Delivery, price: Price): Price => {
    const value = price.value + delivery.price.value;
    return {
      value,
      unit: "EUR",
    };
  };

  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    return addCostOfDelivery(delivery, applyDiscountCode(discountCode, computeSubTotal(items, ZERO)));
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * Mais on fait, on aime bien les tableaux, non ?
 * Ils ont une propriété intéressante : on peut mapper dessus
 */
test("Using an array as a wrapper", () => {
  const computeSubTotal = (items: ShoppingCartItem[], price: Price): Price => {
    const value = price.value + items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);
    return {
      value,
      unit: "EUR",
    };
  };

  const applyDiscountCode = (discountCode: DiscountCode, price: Price): Price => {
    const value = price.value * (1 - discountCode.discount.value / 100);
    return {
      value,
      unit: "EUR",
    };
  };

  const addCostOfDelivery = (delivery: Delivery, price: Price): Price => {
    const value = price.value + delivery.price.value;
    return {
      value,
      unit: "EUR",
    };
  };

  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    return [ZERO] //
      .map((price) => computeSubTotal(items, price))
      .map((price) => applyDiscountCode(discountCode, price))
      .map((price) => addCostOfDelivery(delivery, price))[0];
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * Un peu de curryfication pour aller vers un style point-free
 */
test("Currying", () => {
  const computeSubTotal =
    (items: ShoppingCartItem[]) =>
    (price: Price): Price => {
      const value = price.value + items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);
      return {
        value,
        unit: "EUR",
      };
    };

  const applyDiscountCode =
    (discountCode: DiscountCode) =>
    (price: Price): Price => {
      const value = price.value * (1 - discountCode.discount.value / 100);
      return {
        value,
        unit: "EUR",
      };
    };

  const addCostOfDelivery =
    (delivery: Delivery) =>
    (price: Price): Price => {
      const value = price.value + delivery.price.value;
      return {
        value,
        unit: "EUR",
      };
    };

  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    return [ZERO] //
      .map(computeSubTotal(items))
      .map(applyDiscountCode(discountCode))
      .map(addCostOfDelivery(delivery))[0];
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});

/*
 * Créons un véhicule un peu plus approprié, un functor identité.
 * Mais l'idée est bien là. D'ailleurs, les tableaux sont des functors :)
 */
test("Using a more appropriate functor", () => {
  type MappingFunction<U, V> = (u: U) => V;

  const IdentityFunctor = <U>(value: U) => ({
    map: <V>(fn: MappingFunction<U, V>) => IdentityFunctor(fn(value)),
    get: () => value,
  });

  const computeSubTotal =
    (items: ShoppingCartItem[]) =>
    (price: Price): Price => {
      const value = price.value + items.map(({ product, quantity }) => product.price.value * quantity).reduce(sum);
      return {
        value,
        unit: "EUR",
      };
    };

  const applyDiscountCode =
    (discountCode: DiscountCode) =>
    (price: Price): Price => {
      const value = price.value * (1 - discountCode.discount.value / 100);
      return {
        value,
        unit: "EUR",
      };
    };

  const addCostOfDelivery =
    (delivery: Delivery) =>
    (price: Price): Price => {
      const value = price.value + delivery.price.value;
      return {
        value,
        unit: "EUR",
      };
    };

  const computeCartPrice = ({ items, discountCode, delivery }: ShoppingCart): Price => {
    return IdentityFunctor(ZERO) //
      .map(computeSubTotal(items))
      .map(applyDiscountCode(discountCode))
      .map(addCostOfDelivery(delivery))
      .get();
  };

  const cart = createShoppingCart() //
    .withProduct(productOfPrice(35, "EUR"), 1)
    .withProduct(productOfPrice(5, "EUR"), 2)
    .withDiscountCode(discountOf(15, "%"))
    .withDelivery(PRIORITY_DELIVERY)
    .build();

  const actual = computeCartPrice(cart);

  const expected: Price = {
    value: 46.24,
    unit: "EUR",
  };
  expect(actual).toEqual(expected);
});
