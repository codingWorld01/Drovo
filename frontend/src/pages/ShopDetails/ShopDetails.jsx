import { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShopDetails.css';
import { StoreContext } from '../../context/storeContext';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import { assetsUser } from '../../assets/assetsUser';
import Loader from '../../components/Loader/Loader';

const ShopDetails = () => {
    const { shopId } = useParams();
    const [shop, setShop] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFoodItems, setFilteredFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { url, fetchShopFoodList, getNumberOfItems, logout } = useContext(StoreContext);
    const [showCartIcon, setShowCartIcon] = useState(false);
    const navigate = useNavigate();
    const searchBarRef = useRef(null); // Ref for the search bar

    const fetchShopDetails = async () => {
        try {
            if (shopId) {
                const response = await axios.get(`${url}/api/shops/${shopId}`);
                setShop(response.data.data.shop);
                setFoodItems(response.data.data.foodItems);
                setFilteredFoodItems(response.data.data.foodItems);
                setLoading(false);
            }
        } catch (error) {
            if (error.response?.status === 401 && error.response.data.message === 'Token expired') {
                logout();
            }
            console.error("Error fetching shop details:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShopDetails();
        fetchShopFoodList(shopId);
    }, [shopId]);

    useEffect(() => {
        const filtered = foodItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFoodItems(filtered);
    }, [searchQuery, foodItems]);

    useEffect(() => {
        const handleScroll = () => setShowCartIcon(window.scrollY > 80);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchFocus = () => {
        if (searchBarRef.current) {
            const offset = 100;
            const elementPosition = searchBarRef.current.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };


    if (loading) return <Loader />;

    return (
        <div className="shop-details">
            {shop ? (
                <>
                    <div className="shop-info-container">
                        <img
                            src={`${shop.shopImage}`}
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
                                    <img src={assetsUser.email} alt="" className="icon-image" />
                                    Contact via Email
                                </a>
                            </div>
                            <div className="shop-address">
                                <p>Address: {shop.shopAddress.address}</p>
                                {shop.shopAddress.latitude && shop.shopAddress.longitude && (
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${shop.shopAddress.latitude},${shop.shopAddress.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img src={assetsUser.direction} alt="" className="icon-image" />
                                        Get Directions
                                    </a>
                                )}
                            </div>
                            <div className="shop-contact">
                                <a href={`tel:${shop.phone}`}>
                                    <img src={assetsUser.phone} alt="" className="icon-image" />
                                    Call Now
                                </a>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`search-bar ${!searchQuery ? 'search-empty' : ''}`}
                        ref={searchBarRef} // Attach the ref to the search bar
                    >
                        <input
                            type="text"
                            placeholder="Search for food items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={handleSearchFocus} // Scroll to the search bar on focus
                            className="search-input"
                        />
                        {!searchQuery && (
                            <span
                                style={{
                                    content: '',
                                    position: 'absolute',
                                    width: '20px',
                                    height: '20px',
                                    backgroundImage: `url(${assetsUser.search_icon})`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'contain',
                                    right: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                        {searchQuery && (
                            <button
                                className="clear-button"
                                onClick={() => setSearchQuery('')} // Reset the searchQuery
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {filteredFoodItems.length > 0 ? (
                        <FoodDisplay
                            foodItems={filteredFoodItems}
                            shopId={shopId}
                            isSearching={!!searchQuery}
                        />
                    ) : (
                        <div className="no-food-items">
                            <img
                                src={assetsUser.noresult} // Add a placeholder image in your assets
                                alt="No Food Items"
                                className="no-food-image"
                            />
                            <p>No food items match your search.</p>
                            {searchQuery && (
                                <button
                                    className="clear-button-not-found"
                                    onClick={() => setSearchQuery('')} // Reset search query to show all food items
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <p>Shop details not available</p>
            )}

            {getNumberOfItems() > 0 && showCartIcon && (
                <div className="floating-cart" onClick={() => navigate('/cart')}>
                    <div className="cart-counter">{getNumberOfItems()}</div>
                    <div className="cart-icon">
                        <img src={assetsUser.Cart} alt="Cart" />
                    </div>
                </div>
            )}
        </div>

    );
};

export default ShopDetails;
