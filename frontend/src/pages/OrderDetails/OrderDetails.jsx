import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/storeContext";
import Loader from "../../components/Loader/Loader";
import './OrderDetails.css';
import { assetsUser } from "../../assets/assetsUser";
import toast from "react-hot-toast";

const OrderDetails = () => {
    const { id } = useParams();
    const { url } = useContext(StoreContext);
    const [order, setOrder] = useState(null);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ name: "", email: "", rating: 0, message: "" });
    const [submitStatus, setSubmitStatus] = useState("");

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                let token = localStorage.getItem("token");
                const response = await axios.get(`${url}/api/order/${id}`, {
                    headers: { token }
                });
                setOrder(response.data.order);
                setShop(response.data.shop);
            } catch (error) {
                console.error("Error fetching order details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFeedback({ ...feedback, [name]: value });
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let token = localStorage.getItem("token");
            const response = await axios.post(
                `${url}/api/order/feedback`,
                { ...feedback, shopEmail: shop.email },
                { headers: { token } }
            );
            setSubmitStatus(response.data.message);
            toast.success(response.data.message);
            setFeedback({ name: "", email: "", rating: 0, message: "" });
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setSubmitStatus("Error submitting feedback.");
            toast.error(error.data.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!order) {
        return <div>Order not found</div>;
    }

    // Define the stages based on order status
    const stages = ["Food Processing", "Out for delivery", "Delivered"];
    const currentStageIndex = stages.indexOf(order.status);

    return (
        <div className="order-details-page">
            <h2>Order Details</h2>
            <p>
                <strong>Order ID:</strong> {order._id}
            </p>
            <p>
                <strong>Order Date:</strong> {new Date(order.date).toLocaleString()}
            </p>
            <p>
                <strong>Total Amount:</strong> &#8377; {order.amount}
            </p>
            <p>
                <strong>Delivery Charge:</strong> &#8377; {order.deliveryCharge}
            </p>

            {/* Progress Bar */}
            <h3>Order Status</h3>
            <div className="progress-container">
                <div
                    className="progress-bar"
                    style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
                >
                    {/* Food Processing Stage */}
                    {currentStageIndex >= 0 && (
                        <div className="progress-stage">
                            <span className={`stage ${currentStageIndex >= 0 ? "active" : ""}`}>
                                Food Processing
                            </span>
                        </div>
                    )}

                    {/* Out for Delivery Stage */}
                    {currentStageIndex >= 1 && (
                        <div className="progress-stage">
                            <span className={`stage ${currentStageIndex >= 1 ? "active" : ""}`}>
                                Out for Delivery
                            </span>
                        </div>
                    )}

                    {/* Delivered Stage */}
                    {currentStageIndex >= 2 && (
                        <div className="progress-stage">
                            <span className={`stage ${currentStageIndex >= 2 ? "active" : ""}`}>
                                Delivered
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <h3>Shop Details</h3>
            {shop ? (
                <div className="shop-details-container">
                    <div className="shop-image-column">
                        <img
                            src={`${shop.shopImage}`}
                            alt={shop.name}
                            className="shop-image"
                        />
                    </div>
                    <div className="shop-info-column">
                        <p>
                            <strong>Shop Name:</strong> {shop.name}
                        </p>
                        <p>
                            <strong>Shop Address:</strong> {shop.shopAddress.address}
                        </p>
                        <div className="contact-links-row">
                            <a href={`tel:${shop.phone}`} className="contact-link">
                                <img src={assetsUser.phone} alt="Call Now" className="icon" />
                                Call Now
                            </a>
                            <a href={`mailto:${shop.email}`} className="contact-link">
                                <img src={assetsUser.email} alt="Contact via Email" className="icon" />
                                Contact via Email
                            </a>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${shop.shopAddress.latitude},${shop.shopAddress.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-link"
                            >
                                <img src={assetsUser.direction} alt="Get Directions" className="icon" />
                                Get Directions
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <p>Shop details not available</p>
            )}

            <h3>Items</h3>
            <ul>
                {order.items.map((item, index) => (
                    <li key={index}>
                        {item.name} - {item.quantity}
                    </li>
                ))}
            </ul>

            {/* Feedback Form */}
            <h3>Feedback</h3>
            <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={feedback.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Your Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={feedback.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="rating">Rating (1-5)</label>
                    <div className="rating-slider-container">
                        <input
                            type="range"
                            id="rating"
                            name="rating"
                            value={feedback.rating}
                            onChange={handleInputChange}
                            min="1"
                            max="5"
                            step="1"
                            required
                            className="rating-slider"
                        />
                        <div className="rating-value">Rating: {feedback.rating}</div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        placeholder="Write your feedback here..."
                        value={feedback.message}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Submit Feedback</button>
            </form>

            {submitStatus && <p>{submitStatus}</p>}

        </div>
    );
};

export default OrderDetails;
