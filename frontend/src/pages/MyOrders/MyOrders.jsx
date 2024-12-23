import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/storeContext';
import axios from 'axios';
import { assetsAdmin } from '../../assets/assetsAdmin';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader'; // Import the loader component

const MyOrders = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false); // State to manage loading
    const navigate = useNavigate();

    const fetchOrders = async () => {
        setLoading(true); // Show loader
        try {
            const response = await axios.post(
                url + "/api/order/userorders",
                {},
                { headers: { token } }
            );
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false); // Hide loader
        }
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

    const handleBack = () => {
        navigate('/'); // Navigate back to the home page
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
        <div className='my-orders'>
            {loading && <Loader />} {/* Show loader when loading */}
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

            {data && data.length === 0 && !loading ? (
                <div className="no-orders">
                    <p>You have not placed any orders yet.</p>
                </div>
            ) : data ? (
                <div className="orders-container">
                    {data.slice().reverse().map((order, index) => {
                        return (
                            <div className="order-card" key={index}>
                                <div className="order-header">
                                    <img src={assetsAdmin.parcel_icon} alt="Order Icon" />
                                    <h3>Order #{order._id.slice(-6)}</h3> {/* Display last 6 characters of Order ID */}
                                </div>
                                <div className="order-items">
                                    <p>{order.items.map((item, index) => {
                                        return `${item.name} x ${item.quantity}${index < order.items.length - 1 ? ', ' : ''}`;
                                    })}</p>
                                </div>
                                <div className="order-details">
                                    <p><strong>Total:</strong> &#8377; {order.amount}</p>
                                    <p><strong>Items:</strong> {order.items.length}</p>
                                    <p><span>&#x25cf;</span> <b>Status: {order.status}</b></p>
                                    <p><strong>Order Date:</strong> {formatDate(order.date)}</p> {/* Show formatted date */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : !loading && (
                <div className="no-orders">
                    <p>Failed to load orders. Please try again later.</p>
                </div>
            )}

        </div>
    );
};

export default MyOrders;
