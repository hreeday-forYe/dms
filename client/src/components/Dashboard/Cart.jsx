import { Link, useNavigate } from "react-router-dom";
import { useGetDistributorProductsQuery } from "@/app/slices/productApiSlice";
import { Trash2, ShoppingBag } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "@/app/slices/cartSlice";
import { ScrollArea } from "../ui/scroll-area";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

const Cart = () => {
  // Hooks and state management
  const nav = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  // API calls
  const { data: productsData, refetch: refetchProducts } =
    useGetDistributorProductsQuery();
  const products = productsData?.products || [];

  // Derived values
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  // Helper functions
  const getProductStock = (_id) => {
    const product = products.find((p) => p._id === _id);
    return product ? product.quantity : 0;
  };

  // Event handlers
  const handleRemoveItem = (_id) => {
    try {
      dispatch(removeFromCart({ _id }));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const handleQuantityChange = async (
    _id,
    changeType,
    currentQuantity,
    stock
  ) => {
    try {
      let newQuantity = currentQuantity;

      if (changeType === "increment") {
        newQuantity = Math.min(currentQuantity + 1, stock);
      } else if (changeType === "decrement") {
        newQuantity = Math.max(1, currentQuantity - 1);
      } else if (changeType === "set") {
        newQuantity = Math.max(1, Math.min(currentQuantity, stock));
      }

      dispatch(updateQuantity({ _id, quantity: newQuantity }));
      refetchProducts();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const handleInputChange = (_id, e, stock) => {
    try {
      const value = e.target.value;

      if (value === "") {
        dispatch(updateQuantity({ _id, quantity: "" }));
        return;
      }

      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        const validatedQuantity = Math.max(1, Math.min(numValue, stock));
        dispatch(updateQuantity({ _id, quantity: validatedQuantity }));
      }
    } catch (error) {
      console.error("Failed to handle input change:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const handleInputBlur = (_id, currentValue, stock) => {
    try {
      let finalQuantity = 1;

      if (currentValue !== "" && currentValue >= 1) {
        finalQuantity = Math.min(currentValue, stock);
      }

      dispatch(updateQuantity({ _id, quantity: finalQuantity }));
    } catch (error) {
      console.error("Failed to handle input blur:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const handleClearCart = () => {
    try {
      console.log("Attempting to clear cart");
      dispatch(clearCart());
      console.log("Cart cleared in Redux");
      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart. Please try again.");
    }
  };

  // Render empty cart state
  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  // Main render
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Your Shopping Cart
        </h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <CartItemList
              cartItems={cartItems}
              getProductStock={getProductStock}
              handleQuantityChange={handleQuantityChange}
              handleInputChange={handleInputChange}
              handleInputBlur={handleInputBlur}
              handleRemoveItem={handleRemoveItem}
            />
          </div>

          <CartSummary
            totalPrice={totalPrice}
            cartItems={cartItems}
            getProductStock={getProductStock}
            handleClearCart={handleClearCart}
            onCheckout={() => nav("../checkout")}
          />
        </div>
      </div>
    </ScrollArea>
  );
};

// Sub-components for better organization
const EmptyCart = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Your cart is empty
      </h2>
      <p className="text-gray-600 mb-6">
        Looks like you haven't added any products to your cart yet.
      </p>
      <Link
        to="../"
        className="inline-block bg-[#1E3A8A] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1E3A8A]/90 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  </div>
);

const CartItemList = ({
  cartItems,
  getProductStock,
  handleQuantityChange,
  handleInputChange,
  handleInputBlur,
  handleRemoveItem,
}) => (
  <div className="flow-root">
    <ul className="-my-6 divide-y divide-gray-200">
      {cartItems.map((item) => {
        const productStock = getProductStock(item._id);
        const isOutOfStock = productStock <= 0;

        return (
          <CartItem
            key={item._id}
            item={item}
            productStock={productStock}
            isOutOfStock={isOutOfStock}
            handleQuantityChange={handleQuantityChange}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
            handleRemoveItem={handleRemoveItem}
          />
        );
      })}
    </ul>
  </div>
);

const CartItem = ({
  item,
  productStock,
  isOutOfStock,
  handleQuantityChange,
  handleInputChange,
  handleInputBlur,
  handleRemoveItem,
}) => (
  <li className="py-6 flex">
    <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
      <img
        src={item.images[0]?.url}
        alt={item.name}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="ml-4 flex-1 flex flex-col">
      <div>
        <div className="flex justify-between text-base font-medium text-gray-900">
          <h3>{item.name}</h3>
          <p className="ml-4">
            ${(item.price * (item.quantity || 1)).toFixed(2)}
          </p>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          ${item.price.toFixed(2)} each
        </p>
        <p
          className={`mt-1 text-sm ${
            isOutOfStock ? "text-red-500" : "text-gray-500"
          }`}
        >
          {isOutOfStock ? "Out of stock" : `${productStock} available in stock`}
        </p>
      </div>

      <QuantityControls
        item={item}
        productStock={productStock}
        isOutOfStock={isOutOfStock}
        handleQuantityChange={handleQuantityChange}
        handleInputChange={handleInputChange}
        handleInputBlur={handleInputBlur}
        handleRemoveItem={handleRemoveItem}
      />
    </div>
  </li>
);

const QuantityControls = ({
  item,
  productStock,
  isOutOfStock,
  handleQuantityChange,
  handleRemoveItem,
}) => {
  const [inputValue, setInputValue] = React.useState(item.quantity || 1);

  // Update local state when item quantity changes from outside
  React.useEffect(() => {
    setInputValue(item.quantity || 1);
  }, [item.quantity]);

  const handleChange = (e) => {
    const value = e.target.value;

    // Allow empty string temporarily (for backspace/delete)
    if (value === "") {
      setInputValue("");
      return;
    }

    // Only allow positive integers
    if (/^[1-9]\d*$/.test(value)) {
      const numValue = parseInt(value, 10);
      const validatedValue = Math.min(numValue, productStock);
      setInputValue(validatedValue);
      dispatch(updateQuantity({ _id: item._id, quantity: validatedValue }));
    }
  };

  const handleBlur = () => {
    // If empty or invalid, reset to 1
    if (inputValue === "" || inputValue < 1) {
      const finalValue = 1;
      setInputValue(finalValue);
      dispatch(updateQuantity({ _id: item._id, quantity: finalValue }));
    } else {
      // Ensure it doesn't exceed stock
      const finalValue = Math.min(inputValue, productStock);
      setInputValue(finalValue);
      dispatch(updateQuantity({ _id: item._id, quantity: finalValue }));
    }
  };

  return (
    <div className="flex-1 flex items-end justify-between text-sm">
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          onClick={() => {
            const newQuantity = Math.max(1, (item.quantity || 1) - 1);
            dispatch(updateQuantity({ _id: item._id, quantity: newQuantity }));
          }}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={(item.quantity || 1) <= 1 || isOutOfStock}
        >
          -
        </button>

        <input
          type="number"
          min="1"
          max={productStock}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-16 px-2 py-1 text-center border-x border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          disabled={isOutOfStock}
        />

        <button
          onClick={() => {
            const newQuantity = Math.min(
              productStock,
              (item.quantity || 1) + 1
            );
            dispatch(updateQuantity({ _id: item._id, quantity: newQuantity }));
          }}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={(item.quantity || 1) >= productStock || isOutOfStock}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => handleRemoveItem(item._id)}
        className="font-medium text-[#1E3A8A]/90 hover:text-indigo-500 flex items-center"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Remove
      </button>
    </div>
  );
};

const CartSummary = ({
  totalPrice,
  cartItems,
  getProductStock,
  handleClearCart,
  onCheckout,
}) => (
  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
    <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
      <p>Subtotal</p>
      <p>${totalPrice.toFixed(2)}</p>
    </div>
    <div className="flex justify-between">
      <button
        onClick={handleClearCart}
        className="text-sm font-medium text-[#1E3A8A]/90 hover:text-indigo-500 flex items-center"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Clear Cart
      </button>
      <button
        type="button"
        onClick={onCheckout}
        className="bg-[#1E3A8A]/90 text-white px-6 py-3 rounded-md font-medium hover:bg-[#1E3A8A]/90 transition-colors"
        disabled={cartItems.some((item) => getProductStock(item._id) <= 0)}
      >
        Checkout
      </button>
    </div>
  </div>
);

export default Cart;
