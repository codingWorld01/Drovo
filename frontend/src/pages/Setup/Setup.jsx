import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../context/storeContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './Setup.css';
import { useNavigate } from 'react-router-dom';

const Setup = () => {
    const { url, token, logout } = useContext(StoreContext);
    let navigate = useNavigate();

    if (!token) {
        return navigate('/');
    }

    const [formData, setFormData] = useState({
        shopImage: '',
        name: localStorage.getItem('shopName') || '',
        address: '',
        email: localStorage.getItem('shopEmail') || '',
        phone: '',
        subscription: '99',
        razorpay_order_id: '',
        razorpay_payment_id: '',
        razorpay_signature: '',
        latitude: '', // Added latitude
        longitude: '' // Added longitude
    });

    const [shopImage, setShopImage] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const onImageChangeHandler = (e) => {
        const selectedImage = e.target.files[0];
        setShopImage(selectedImage);

        setFormData((prevData) => ({ ...prevData, shopImage: selectedImage }));
    };

    const onSubscriptionSelect = (subscription) => {
        setFormData((prevData) => ({ ...prevData, subscription }));
    };

    const loadRazorpayScript = async () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const initiatePayment = async () => {
        try {
            const response = await axios.post(`${url}/api/payment/create-order`, {
                amount: formData.subscription * 100, // Convert to paise
                token,
            });

            const { order } = response.data;
            return order;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                if (error.response.data.message === 'Token expired') {
                    logout();
                }
            }
            console.error('Error initiating payment:', error);
            toast.error('Failed to initiate payment.');
            throw error;
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Check if terms are accepted
        if (!termsAccepted) {
            toast.error('You must accept the terms and conditions.');
            return;
        }

        // Check if shop image is uploaded
        if (!shopImage) {
            toast.error('Please upload a shop image.');
            return;
        }

        // Validate phone number (example: should be 10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error('Please enter a valid phone number.');
            return;
        }

        // Load Razorpay script
        const isRazorpayLoaded = await loadRazorpayScript();
        if (!isRazorpayLoaded) {
            toast.error('Failed to load Razorpay. Please try again.');
            return;
        }

        try {
            const order = await initiatePayment();

            const options = {
                key: import.meta.env.VITE_ROZAPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: formData.name,
                description: 'Shop Subscription Payment',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // Create a FormData object
                        const formDataToSend = new FormData();

                        formData.razorpay_order_id = response.razorpay_order_id;
                        formData.razorpay_payment_id = response.razorpay_payment_id;
                        formData.razorpay_signature = response.razorpay_signature;

                        // Add the rest of the fields
                        for (const key in formData) {
                            if (key !== 'shopImage') {
                                formDataToSend.append(key, formData[key]);
                            }
                        }

                        // Add the image file
                        if (shopImage) {
                            formDataToSend.append('shopImage', shopImage);
                        }
                        for (const pair of formDataToSend.entries()) {
                            console.log(`${pair[0]}: ${pair[1]}`);
                        }


                        // Send the formData to the backend
                        const verifyResponse = await axios.post(
                            `${url}/api/payment/verify`,
                            formDataToSend,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            }
                        );
                        console.log(verifyResponse);

                        if (verifyResponse.data.success) {
                            toast.success('Payment successful! Shop setup completed.');
                            localStorage.removeItem('shopName');
                            localStorage.removeItem('shopEmail');
                            navigate('/');
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (error) {
                        console.error('Error verifying payment:', error);
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: '#3399cc',
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                if (error.response.data.message === 'Token expired') {
                    logout();
                }
            }
            console.error('Error during payment process:', error);
            toast.error('Payment process failed.');
        }
    };

    useEffect(() => {
        if (window.google) {
            const input = document.getElementById('shop-address');
            const autocomplete = new window.google.maps.places.Autocomplete(input, { // Only commercial establishments
                componentRestrictions: { country: 'IN' }, // Optional: Restrict to a specific country
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    setFormData((prevData) => ({
                        ...prevData,
                        address: place.formatted_address, // Exact address
                        latitude: place.geometry.location.lat(), // Latitude
                        longitude: place.geometry.location.lng(), // Longitude
                    }));
                }
            });
        }
    }, []);


    return (
        <div className="setup-page">
            <form onSubmit={onSubmitHandler} className="setup-form">
                <h2>Complete Your Shop Profile</h2>

                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChangeHandler}
                    placeholder="Shop Name"
                    autoComplete='off'
                    disabled={!!localStorage.getItem('shopName')}
                />
                <textarea
                    name="address"
                    id="shop-address" // The input ID for autocomplete
                    value={formData.address}
                    onChange={onChangeHandler}
                    placeholder="Shop Address"
                    rows="4" // Sets the number of rows for the text area (adjust as needed)
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Shop Email"
                    onChange={onChangeHandler}
                    disabled={!!localStorage.getItem('shopEmail')}
                />
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onChangeHandler}
                    placeholder="Shop Phone"
                    autoComplete='off'
                    required
                />
                <div className="file-input-container">
                    <label className="file-input-label">Upload Shop Image</label>
                    <label htmlFor="file-input" className="file-input-button">
                        Choose File
                    </label>
                    <input
                        name='shopImage'
                        id="file-input"
                        type="file"
                        accept="image/*"
                        className="file-input"
                        onChange={onImageChangeHandler}
                        required
                    />
                    {shopImage && (
                        <p className="file-name">{shopImage.name} Selected</p>
                    )}
                </div>

                <h3>Select a Membership Plan</h3>
                <div className="subscription-cards-setup">
                    <div
                        className={`card ${formData.subscription === '99' ? 'selected' : ''}`}
                        onClick={() => onSubscriptionSelect('99')}
                    >
                        <h4>₹99</h4>
                        <p>15 Days</p>
                    </div>
                    <div
                        className={`card ${formData.subscription === '149' ? 'selected' : ''}`}
                        onClick={() => onSubscriptionSelect('149')}
                    >
                        <h4>₹149</h4>
                        <p>1 Month</p>
                    </div>
                    <div
                        className={`card ${formData.subscription === '299' ? 'selected' : ''}`}
                        onClick={() => onSubscriptionSelect('299')}
                    >
                        <h4>₹299</h4>
                        <p>3 Months</p>
                    </div>
                    <div
                        className={`card ${formData.subscription === '599' ? 'selected' : ''}`}
                        onClick={() => onSubscriptionSelect('599')}
                    >
                        <h4>₹599</h4>
                        <p>6 Months</p>
                    </div>
                </div>

                <div className="terms">
                    <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={() => setTermsAccepted(!termsAccepted)}
                    />
                    I accept the{' '}
                    <button
                        type="button"
                        className="terms-button"
                        onClick={() => setShowTermsModal(true)}
                    >
                        Terms and Conditions
                    </button>
                </div>

                <button className="pay" type="submit">
                    Buy now
                </button>
            </form>

            {showTermsModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Terms and Conditions</h2>
                        <div className="modal-content">
                            <p>
                                Welcome to Drovo! By using our website, subscribing to our services, or making a purchase, you agree to the following terms and conditions. Please read them carefully before proceeding.
                            </p>
                            <br />
                            <ul>
                                <li><strong>1. General Overview</strong></li>
                                <li>Drovo operates as a subscription-based platform for delivering dairy and essential grocery products. By creating an account, you agree to abide by these terms of use, which may be updated from time to time. Drovo reserves the right to modify or discontinue the service (or any part thereof) with or without notice at any time.</li>

                                <li><strong>2. Eligibility</strong></li>
                                <li>You must be at least 18 years old to use this platform. Minors may use the platform under parental supervision. By registering, you confirm that all information provided is accurate, complete, and up to date.</li>

                                <li><strong>3. Service Subscription</strong></li>
                                <li>Our subscription model allows you to customize and schedule recurring orders for milk, dahi (curd), bread, and other essentials. Subscriptions can be managed, paused, or canceled at any time without penalty. Users are free to select quantities and delivery timings that suit their preferences.</li>

                                <li><strong>4. Ordering and Delivery</strong></li>
                                <ul>
                                    <li><strong>Order Placement:</strong> You can place an order via our website. Drovo ensures user-friendly browsing and selection of products.</li>
                                    <li><strong>Delivery Time:</strong> Once an order is placed, our delivery agents strive to deliver within 10 minutes.</li>
                                    <li><strong>Payment Options:</strong> We currently support Cash on Delivery (COD) as the primary mode of payment.</li>
                                    <li><strong>Order Accuracy:</strong> It is the user’s responsibility to verify the order details before confirming. Errors in order placement or delivery should be reported immediately for resolution.</li>
                                </ul>

                                <li><strong>5. Pricing and Availability</strong></li>
                                <li>Prices of products are clearly displayed and subject to periodic updates. All products are subject to availability. In case an item is out of stock, Drovo will inform you promptly and may suggest an alternative.</li>

                                <li><strong>6. Quality Assurance</strong></li>
                                <li>Drovo is committed to delivering fresh and quality dairy products and groceries. If you encounter any issues with product quality, you may contact our customer support within 24 hours for resolution.</li>

                                <li><strong>7. Cancellation and Refund Policy</strong></li>
                                <ul>
                                    <li><strong>Cancellations:</strong> Orders can be canceled before they are dispatched for delivery.</li>
                                    <li><strong>Refunds:</strong> Refunds for canceled orders or unsatisfactory deliveries will be processed within 3–7 business days after confirmation.</li>
                                </ul>

                                <li><strong>8. User Responsibilities</strong></li>
                                <ul>
                                    <li>Users must ensure accurate delivery details (e.g., address and contact information).</li>
                                    <li>By selecting Cash on Delivery, users commit to making prompt payment upon receiving the order.</li>
                                    <li>Repeated refusal of deliveries or non-payment may result in service restrictions.</li>
                                </ul>

                                <li><strong>9. Limitation of Liability</strong></li>
                                <li>Drovo is not responsible for delays caused by unforeseen circumstances (e.g., traffic, weather, or technical issues). Our liability for any claim arising from the service is limited to the price of the product purchased.</li>

                                <li><strong>10. Privacy Policy</strong></li>
                                <li>User data, including address and purchase history, will be handled in compliance with our Privacy Policy. We are committed to protecting your personal information.</li>

                                <li><strong>11. Dispute Resolution</strong></li>
                                <li>Any disputes or claims arising from or related to Drovo’s services shall be resolved amicably through customer support. If unresolved, disputes may be subject to local jurisdiction laws.</li>

                                <li><strong>12. Amendments</strong></li>
                                <li>Drovo reserves the right to update these terms and conditions. Continued use of the service after updates constitutes acceptance of the revised terms.</li>

                                <li><strong>13. Commission on Pre-orders</strong></li>
                                <li>Drovo offers a 2% commission to milk stores on pre-orders placed through the platform. For example, on a ₹100 pre-order, Drovo will credit ₹2 to the milk store as commission. The commission is calculated based on the total value of pre-orders fulfilled and is disbursed at the end of the month. The commission is subject to accurate order fulfillment and adherence to Drovo's quality and delivery standards.</li>
                            </ul>

                        </div>
                        <button
                            className="close-modal"
                            onClick={() => setShowTermsModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Setup;
