import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/storeContext";
import './OrderDetails.css';
import { assetsUser } from "../../assets/assetsUser";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, Truck, Clock, Star } from "lucide-react";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { url } = useContext(StoreContext);
    const [order, setOrder] = useState(null);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ name: "", email: "", rating: 0, message: "" });
    const [submitStatus, setSubmitStatus] = useState("");
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

    const handleRatingClick = (rating) => {
        setFeedback({ ...feedback, rating });
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            let token = localStorage.getItem("token");
            const response = await axios.post(
                `${url}/api/order/feedback`,
                { ...feedback, shopEmail: shop.email },
                { headers: { token } }
            );
            setSubmitStatus(response.data.message);
            toast.success(response.data.message);
            setFeedback({ name: "", email: "", rating: 0, message: "" });
            setFeedbackSubmitted(true);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setSubmitStatus("Error submitting feedback.");
            toast.error(error.response?.data?.message || "Error submitting feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackClick = () => {
        navigate('/myorders');
    };

    // Skeleton Component
    const OrderDetailsSkeleton = () => (
        <div className="order-details-page">
            <div className="skeleton-header">
                <div className="skeleton skeleton-back-button"></div>
            </div>
            <div className="skeleton skeleton-title"></div>
            
            {/* Order Summary Skeleton */}
            <div className="skeleton-card">
                <div className="skeleton skeleton-order-header"></div>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line"></div>
            </div>

            {/* Progress Skeleton */}
            <div className="skeleton skeleton-section-title"></div>
            <div className="skeleton-progress">
                <div className="skeleton skeleton-progress-step"></div>
                <div className="skeleton skeleton-progress-step"></div>
                <div className="skeleton skeleton-progress-step"></div>
            </div>

            {/* Shop Details Skeleton */}
            <div className="skeleton skeleton-section-title"></div>
            <div className="skeleton-shop-details">
                <div className="skeleton skeleton-shop-image"></div>
                <div className="skeleton-shop-info">
                    <div className="skeleton skeleton-shop-name"></div>
                    <div className="skeleton skeleton-shop-address"></div>
                    <div className="skeleton skeleton-shop-contacts"></div>
                </div>
            </div>

            {/* Items Skeleton */}
            <div className="skeleton skeleton-section-title"></div>
            <div className="skeleton-items">
                <div className="skeleton skeleton-item"></div>
                <div className="skeleton skeleton-item"></div>
                <div className="skeleton skeleton-item"></div>
            </div>
        </div>
    );

    if (loading) {
        return <OrderDetailsSkeleton />;
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
            <div className="order-details-header">
                <button className="back-button" onClick={handleBackClick}>
                    <ArrowLeft size={20} />
                    <span>Back to Orders</span>
                </button>

            </div>

            <div className="order-summary-card">
                <div className="order-summary-header">
                    <div className="order-id">Order #{order._id.slice(-6)}</div>
                    <div className="order-date">{new Date(order.date).toLocaleString()}</div>
                </div>
                <div className="order-summary-content">
                    <div className="order-summary-row">
                        <div className="order-summary-label">Items Total</div>
                        <div className="order-summary-value">₹{order.amount - order.deliveryCharge}</div>
                    </div>
                    <div className="order-summary-row">
                        <div className="order-summary-label">Delivery Charge</div>
                        <div className="order-summary-value">₹{order.deliveryCharge}</div>
                    </div>
                    <div className="order-total">
                        <div className="order-total-label">Total Amount</div>
                        <div className="order-total-value">₹{order.amount}</div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <h3>Order Status</h3>
            <div className="progress-container">
                <div className="progress-tracker">
                    <div className={`progress-step ${currentStageIndex >= 0 ? 'active' : ''}`}>
                        <div className="step-icon">
                            {currentStageIndex >= 0 ? <Clock size={24} /> : <div className="step-number">1</div>}
                        </div>
                        <div className="step-label">Food Processing</div>
                    </div>

                    <div className="progress-line"></div>

                    <div className={`progress-step ${currentStageIndex >= 1 ? 'active' : ''}`}>
                        <div className="step-icon">
                            {currentStageIndex >= 1 ? <Truck size={24} /> : <div className="step-number">2</div>}
                        </div>
                        <div className="step-label">Out for Delivery</div>
                    </div>

                    <div className="progress-line"></div>

                    <div className={`progress-step ${currentStageIndex >= 2 ? 'active' : ''}`}>
                        <div className="step-icon">
                            {currentStageIndex >= 2 ? <CheckCircle size={24} /> : <div className="step-number">3</div>}
                        </div>
                        <div className="step-label">Delivered</div>
                    </div>
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
                        <h3 className="shop-name">{shop.name}</h3>
                        <div className="shop-address">
                            <img src={assetsUser.location} alt="Location" className="info-icon" />
                            <span>{shop.shopAddress.address}</span>
                        </div>
                        <div className="contact-links-row">
                            <a href={`tel:${shop.phone}`} className="contact-link">
                                <img src={assetsUser.phone} alt="Call Now" className="icon" />
                                <span>Call Now</span>
                            </a>
                            <a href={`mailto:${shop.email}`} className="contact-link">
                                <img src={assetsUser.email} alt="Contact via Email" className="icon" />
                                <span>Email</span>
                            </a>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${shop.shopAddress.latitude},${shop.shopAddress.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-link"
                            >
                                <img src={assetsUser.direction} alt="Get Directions" className="icon" />
                                <span>Directions</span>
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-data-message">Shop details not available</div>
            )}

            <h3>Order Items</h3>
            <div className="items-container">
                {order.items.map((item, index) => (
                    <div key={index} className="item-card">
                        <div className="item-details">
                            <div className="item-name">{item.name}</div>
                            <div className="item-quantity">Quantity: {item.quantity}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Feedback Form */}
            <h3>Share Your Feedback</h3>
            {feedbackSubmitted ? (
                <div className="feedback-success">
                    <CheckCircle size={48} className="success-icon" />
                    <h4>Thank You for Your Feedback!</h4>
                    <p>Your feedback has been submitted successfully and will help us improve our service.</p>
                </div>
            ) : (
                <div className="feedback-card">
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="rating">Rating</label>
                            <div className="star-rating-container">
                                <div className="star-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={32}
                                            className={`star ${star <= feedback.rating ? 'filled' : ''} ${isSubmitting ? 'disabled' : ''}`}
                                            onClick={() => !isSubmitting && handleRatingClick(star)}
                                        />
                                    ))}
                                </div>
                                <div className="rating-value">
                                    {feedback.rating > 0 ? `${feedback.rating} out of 5 stars` : 'Select a rating'}
                                </div>
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
                                disabled={isSubmitting}
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                </div>
            )}

            {submitStatus && !feedbackSubmitted && <p className="status-message">{submitStatus}</p>}

        </div>
    );
};

export default OrderDetails;