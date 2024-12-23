import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../context/storeContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './Setup.css';
import { useNavigate } from 'react-router-dom';

const Setup = () => {
    const { url, token } = useContext(StoreContext);
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
                key: import.meta.env.ROZARPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: formData.name,
                description: 'Shop Subscription Payment',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        console.log(import.meta.env.ROZARPAY_KEY_ID)
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
            console.error('Error during payment process:', error);
            toast.error('Payment process failed.');
        }
    };

    useEffect(() => {
        if (window.google) {
            const input = document.getElementById('shop-address');
            const autocomplete = new window.google.maps.places.Autocomplete(input, {
                types: ['establishment'], // Only commercial establishments
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
                    placeholder="Shop Name"
                    disabled
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
                    disabled
                />
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onChangeHandler}
                    placeholder="Shop Phone"
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
                    I accept the <a href="/terms">Terms and Conditions</a>
                </div>

                <button className="pay" type="submit">
                    Buy now
                </button>
            </form>
        </div>
    );
};

export default Setup;
