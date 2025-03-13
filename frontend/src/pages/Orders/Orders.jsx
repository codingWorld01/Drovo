import React, { useContext, useEffect, useState } from 'react';
import './Orders.css';
import { toast } from "react-hot-toast";
import axios from "axios";
import { assetsAdmin } from "../../assets/assetsAdmin";
import Loader from "../../components/Loader/Loader"; // Import your loader component
import { useNavigate } from "react-router-dom";
import { StoreContext } from '../../context/storeContext';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true); // Track if at top of page
  const navigate = useNavigate();
  const { logout } = useContext(StoreContext);

  const fetchAllOrders = async () => {
    setLoading(true); // Start loader
    try {
      let token = localStorage.getItem("token");
      const response = await axios.get(url + "/api/order/list", {
        headers: { token }
      });

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        if (error.response.data.message === 'Token expired') {
          logout();
        }
      }

      if (error.response?.data?.redirect) {
        navigate(error.response.data.redirect); // Redirect to setup or subscription page
        toast.error(error.response.data.message || "Please complete your setup or renew your subscription.");
      }
      else {
        toast.error("Error fetching orders");
      }
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value
      });
      if (response.data.success) {
        toast.success("Order status updated!");
        await fetchAllOrders();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        if (error.response.data.message === 'Token expired') {
          logout();
        }
      }
      toast.error("Error updating order status");
    }
  };

  const getDirections = (latitude, longitude) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  };

  const formatDate = (date) => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    // Check if the page is at the top or scrolled
    if (window.scrollY === 0) {
      setIsAtTop(true);  // User is at the top
    } else {
      setIsAtTop(false); // User has scrolled down
    }
  };

  useEffect(() => {
    fetchAllOrders();
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="order-page">
      <h3>Order Management</h3>
      {loading ? (
        <Loader /> // Show loader while loading
      ) : (
        <div className="order-list">
          {orders && orders.length === 0 ? ( // Handle no orders
            <p className="no-orders-message">No orders available at the moment.</p>
          ) : (
            orders.slice().reverse().map((order, index) => (
              <div key={index} className="order-item">
                <img src={assetsAdmin.parcel_icon} alt="Parcel Icon" className="parcel-icon" />
                <div className="order-details">
                  <p className="order-item-food">
                    {order.items.map((item, idx) => (
                      <span key={idx}>
                        {item.name} - {item.quantity}
                        {idx !== order.items.length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                  <p className="order-item-name">{order.address.firstName} {order.address.lastName}</p>
                  <div className="order-item-address">
                    <p>{order.address.street}, {order.address.flat}</p>
                    <p>{order.address.floor}, {order.address.landmark}</p>
                  </div>
                  <p className="order-item-phone">{order.address.phone}</p>
                  <button
                    className="direction-button"
                    onClick={() => getDirections(order.address.latitude, order.address.longitude)}
                  >
                    Get Directions
                  </button>
                </div>
                <div className="order-summary">
                  <p><strong>Items:</strong> {order.items.length}</p>
                  <p><strong>Total:</strong> &#8377;{order.amount}</p>
                  <p><strong>Delivery Charge:</strong> &#8377;{order.deliveryCharge}</p>
                  <p><strong>Date:</strong> {formatDate(order.date)}</p>
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className="order-status-select"
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Go to Top Button */}
      {!isAtTop && (
        <button className="go-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
};

export default Orders;
