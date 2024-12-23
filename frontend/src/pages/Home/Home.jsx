import React, { useContext, useEffect, useState } from 'react';
import './Home.css';
import Header from '../../components/NavbarUser/Header/Header';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/storeContext';

const Home = () => {
    const [shops, setShops] = useState([]);
    const { url } = useContext(StoreContext);

    // Fetch shops from the backend
    const fetchShops = async () => {
        try {
            const response = await axios.get(`${url}/api/shops/all`);
            setShops(response.data.data);
        } catch (error) {
            console.error("Error fetching shops:", error);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    return (
        <div>
            <Header />
            <div className="shop-list">
                <h1>Available Shops</h1>
                <div className="shop-grid">
                    {shops.map((shop) => (
                        <Link to={`/shop/${shop._id}`} key={shop._id} className="shop-card">
                            <div className="shop-card-content">
                                <img
                                    src={`http://localhost:4000/images/${shop.shopImage}`}
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
        </div>
    );
};

export default Home;
