import React, { useContext, useEffect, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/storeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios'; // Or use fetch

const Cart = () => {
  const { cartItems, food_list, removeFromCart, addToCart, getTotalCartAmount, url, token, shopId, deleteFromCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const [shopDetails, setShopDetails] = useState(null);

  // Fetch shop details when the component mounts
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        if (shopId) {
          const response = await axios.get(`${url}/api/shops/${shopId}`);  // Adjust URL as needed
          if (response.data.success) {
            setShopDetails(response.data.data.shop);  // Store shop details
          }
        }
      } catch (error) {
        console.log("fetchshopDetails function in cart.jsx: ", error);
      }
    };

    if (shopId) {
      fetchShopDetails();
    }
  }, [shopId]);

  const isEligibleForCheckout = getTotalCartAmount() >= 60;

  const handleCheckout = () => {
    if (!token) {
      toast.error("Please log in to proceed to checkout.");
      return;
    }

    if (!isEligibleForCheckout) {
      toast.error("Minimum purchase of ₹60 is required to checkout.");
      return;
    }

    navigate('/order');
  };

  // Check if there are any items in the cart for this shop
  const hasItemsInCart = Object.keys(cartItems[shopId] || {}).some(itemId => cartItems[shopId][itemId] > 0);

  return (
    <div className="cart-container">
      <div className="cart">
        {shopDetails && hasItemsInCart && (
          <div className="cart-shop-name">
            <h2>{shopDetails.name}</h2>
          </div>
        )}

        <div className="cart-items">
          <div className="cart-items-title">
            <p>Item</p>
            <p>Name</p>
            <p>Price</p>
            <p>Qty</p>
            <p>Total</p>
            <p></p>
          </div>
          {food_list.map((item, index) => {
            const itemQuantity = cartItems[shopId]?.[item._id] || 0;

            if (itemQuantity > 0) {
              return (
                <div key={index} className="cart-item">
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>&#8377;{item.price}</p>
                  <p>
                    <button onClick={() => removeFromCart(item._id, shopId)} className="quantity-btn">-</button>
                    {itemQuantity}
                    <button onClick={() => addToCart(item._id, shopId)} className="quantity-btn">+</button>
                  </p>
                  <p>&#8377;{item.price * itemQuantity}</p>
                  <span onClick={() => deleteFromCart(item._id, shopId)} className="remove-cross">×</span>
                </div>
              );
            }
            return null;
          })}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            <p className="total-amount">Total: &#8377;{getTotalCartAmount()}</p>
          </div>

          <div className="promo-code">
            <input type="text" placeholder="Promo code" className="promo-input" />
            <button className="promo-btn">Apply</button>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={!isEligibleForCheckout}
          className={`checkout-btn ${isEligibleForCheckout ? 'active' : 'disabled'}`}
        >
          Proceed to Checkout
        </button>

        {!isEligibleForCheckout && (
          <p className="min-purchase-msg">
            Minimum purchase of ₹60 required to checkout.
          </p>
        )}
      </div>
    </div>
  );
};

export default Cart;
