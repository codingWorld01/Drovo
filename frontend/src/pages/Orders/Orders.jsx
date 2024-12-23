import React, { useEffect, useState } from 'react';
import './Orders.css';
import { toast } from "react-hot-toast";
import axios from "axios";
import { assetsAdmin } from "../../assets/assetsAdmin";
import Loader from "../../components/Loader/Loader"; // Import your loader component

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

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
      toast.error("Error fetching orders");
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

  useEffect(() => {
    fetchAllOrders();
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
                        {item.name} x {item.quantity}
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
    </div>
  );
};

export default Orders;
