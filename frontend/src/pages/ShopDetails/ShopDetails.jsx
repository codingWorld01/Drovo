import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShopDetails.css';
import { StoreContext } from '../../context/storeContext';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import { assetsUser } from '../../assets/assetsUser';
import Loader from '../../components/Loader/Loader'; // Import the Loader component

const ShopDetails = () => {
    const { shopId } = useParams(); // Get the shop ID from the route
    const [shop, setShop] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const { url, fetchShopFoodList, getNumberOfItems } = useContext(StoreContext);
    const [category, setCategory] = useState("ALL");
    const [showCartIcon, setShowCartIcon] = useState(false); // State to control cart icon visibility
    const navigate = useNavigate();

    // Fetch shop details and its food items
    const fetchShopDetails = async () => {
        try {
            if (shopId) {
                const response = await axios.get(`${url}/api/shops/${shopId}`);
                setShop(response.data.data.shop);
                setFoodItems(response.data.data.foodItems);
                setLoading(false); // Set loading to false after data is fetched
            }
        } catch (error) {
            console.error("Error fetching shop details:", error);
            setLoading(false); // Set loading to false if there's an error
        }
    };

    useEffect(() => {
        fetchShopDetails();
        fetchShopFoodList(shopId);
    }, [shopId]);

    // Check if the cart has more than one distinct item
    const numberOfItems = getNumberOfItems();

    // Handle scroll to show/hide the cart icon
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) { // Show the cart icon after scrolling down 80px
                setShowCartIcon(true);
            } else {
                setShowCartIcon(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (loading) {
        return <Loader />; // Use the Loader component while data is loading
    }

    return (
        <div className="shop-details">
            {shop ? (
                <>
                    <div className="shop-info-container">
                        <img
                            src={`${url}/images/${shop.shopImage}`}
                            alt={shop.name}
                            className="shop-detail-image"
                        />
                        <div className="shop-info">
                            <h1>{shop.name}</h1>
                            <div className="shop-email">
                                <a
                                    href={`mailto:${shop.email}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img src={assetsUser.email} alt="" className='icon-image' />
                                    Contact via Email
                                </a>
                            </div>
                            <div className="shop-address">
                                <p>Address: {shop.shopAddress.address}</p>
                                {shop.shopAddress.latitude && shop.shopAddress.longitude && (
                                    <>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.shopAddress.latitude},${shop.shopAddress.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img src={assetsUser.direction} alt="" className='icon-image' />
                                            Get Directions
                                        </a>
                                    </>
                                )}
                            </div>
                            <div className="shop-contact">
                                <a href={`tel:${shop.phone}`}>
                                    <img src={assetsUser.phone} alt="" className='icon-image' />
                                    Call Now
                                </a>
                            </div>
                        </div>
                    </div>
                    <ExploreMenu category={category} setCategory={setCategory} />
                    <FoodDisplay category={category} foodItems={foodItems} shopId={shopId} />
                </>
            ) : (
                <p>Shop details not available</p>
            )}

            {/* Floating Cart Icon */}
            {numberOfItems > 0 && showCartIcon && (
                <div className="floating-cart" onClick={() => navigate('/cart')}>
                    <div className="cart-counter">{numberOfItems}</div>
                    <div className="cart-icon">
                        <img src={assetsUser.basket} alt="Cart" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopDetails;
