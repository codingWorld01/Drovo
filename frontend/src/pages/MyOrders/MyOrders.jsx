import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/storeContext";
import axios from "axios";
import { assetsAdmin } from "../../assets/assetsAdmin";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { url, token, logout } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // State to manage loading
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true); // Show skeleton
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      setData(response.data.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        if (error.response.data.message === "Token expired") {
          logout();
        }
      }
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false); // Hide skeleton
    }
  };

  const formatDate = (date) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const handleViewDetails = (orderId) => {
    navigate(`/myorders/${orderId}`); // Navigate to the details page
  };

  const handleBack = () => {
    navigate("/"); // Navigate back to the home page
  };

  const handleRefresh = () => {
    fetchOrders(); // Refresh orders by re-fetching the data
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>

      <div className="order-buttons">
        <button onClick={handleBack} className="back-button">
          <span className="arrow-left">&#8592;</span>
          <span className="back-text">Back</span>
        </button>
        <button onClick={handleRefresh} className="refresh-button">
          <img src={assetsAdmin.refresh} alt="" className="refresh-icon" />
          <span className="refresh-text">Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="skeleton-container">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton-header"></div>
              <div className="skeleton-body"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      ) : data && data.length === 0 ? (
        <div className="no-orders">
          <p>You have not placed any orders yet.</p>
        </div>
      ) : data ? (
        <div className="orders-container">
          {data
            .slice()
            .reverse()
            .map((order, index) => {
              return (
                <div className="order-card" key={index}>
                  <div className="order-header">
                    <img src={assetsAdmin.parcel_icon} alt="Order Icon" />
                    <h3>Order #{order._id.slice(-6)}</h3>{" "}
                    {/* Display last 6 characters of Order ID */}
                  </div>
                  <div className="order-items">
                    <p>
                      {order.items.map((item, index) => {
                        return `${item.name} - ${item.quantity}${index < order.items.length - 1 ? ", " : ""
                          }`;
                      })}
                    </p>
                  </div>
                  <div className="order-details">
                    <div className="order-details-row">
                      <p>
                        <strong>Total:</strong> &#8377; {order.amount}
                      </p>
                      <p>
                        <strong>Items:</strong> {order.items.length}
                      </p>
                    </div>
                    <p>
                      <span>&#x25cf;</span> <b>Status: {order.status}</b>
                    </p>
                    <p>
                      <strong>Order Date:</strong> {formatDate(order.date)}
                    </p>{" "}
                    {/* Show formatted date */}
                    <button onClick={() => handleViewDetails(order._id)}>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="no-orders">
          <p>Failed to load orders. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
