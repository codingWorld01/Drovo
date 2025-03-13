import React, { useContext, useEffect, useState, useRef } from 'react';
import './Home.css';
import Header from '../../components/NavbarUser/Header/Header';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/storeContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { assetsUser } from '../../assets/assetsUser';
import Testimonials from '../../components/Testimonials/Testimonials';

const Home = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const { url, logout } = useContext(StoreContext);

    // Create a reference for the Available Shops section
    const shopSectionRef = useRef(null);

    const fetchShops = async () => {
        try {
            const response = await axios.get(`${url}/api/shops/all`);
            setShops(response.data.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                if (error.response.data.message === 'Token expired') {
                    logout();
                }
            }
            console.error("Error fetching shops:", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToShops = () => {
        shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchShops();
    }, []);

    return (
        <div>
            <div className="hero-section-new">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>
                            All Fresh Products Delivered <br />
                            <span className="highlight">Quickly & Safely</span> to Your Doorstep
                        </h1>
                        <p>
                            Enjoy the goodness of premium-quality dairy, grocery, and bakery products, sourced fresh
                            from trusted shops and delivered with care to your home.
                        </p>
                        <button className="cta-button" onClick={scrollToShops}>Explore Now</button>
                    </div>
                    <div className="hero-image">
                        <img src={assetsUser.deliveryBoy} alt="Food Delivery" />
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <h2>Why Choose Drovo?</h2>
                <div className="features-grid">
                    <div className="feature">
                        <img src={assetsUser.fresh} alt="Fresh Products" />
                        <h3>Fresh Products</h3>
                        <p>We deliver only the freshest dairy, grocery, and bakery products directly to your door.</p>
                    </div>
                    <div className="feature">
                        <img src={assetsUser.quick} alt="Quick Delivery" />
                        <h3>Quick Delivery</h3>
                        <p>Timely and reliable delivery to ensure your satisfaction.</p>
                    </div>
                    <div className="feature">
                        <img src={assetsUser.securepayment} alt="Secure Payments" />
                        <h3>Secure Payment</h3>
                        <p>Multiple payment options with secure processing.</p>
                    </div>
                    <div className="feature">
                        <img src={assetsUser.allsupport} alt="24/7 Support" />
                        <h3>24/7 Support</h3>
                        <p>Our customer support team is available 24/7 to assist you with any issues.</p>
                    </div>
                </div>
            </div>

            <Header />
            {/* Shop List Section */}
            <div className="shop-list" ref={shopSectionRef}>
                <h1>Available Shops</h1>
                <div className="shop-grid">
                    {loading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="shop-card">
                                <Skeleton height={200} />
                                <div className="shop-info-home">
                                    <Skeleton height={20} width="60%" />
                                    <Skeleton height={15} width="80%" />
                                </div>
                            </div>
                        ))
                        : shops.map((shop) => (
                            <Link to={`/shop/${shop._id}`} key={shop._id} className="shop-card">
                                <div className="shop-card-content">
                                    <img
                                        src={`${url}/images/${shop.shopImage}`}
                                        alt={shop.name}
                                        className="shop-image-home"
                                    />
                                    <div className="shop-info-home">
                                        <h2>{shop.name}</h2>
                                        <p>{shop.shopAddress.address}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <Testimonials />
        </div>
    );
};

export default Home;
