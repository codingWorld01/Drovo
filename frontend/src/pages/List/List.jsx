import React, { useContext, useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { StoreContext } from '../../context/storeContext';

const List = ({ url }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true); // Track scroll position
    let navigate = useNavigate();
    const { logout } = useContext(StoreContext);

    const fetchList = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem('token');
            const response = await axios.get(`${url}/api/food/list`, { headers: { token } });
            if (response.data.success) {
                setList(response.data.data);
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                if (error.response.data.message === 'Token expired') {
                    logout();
                }
            }
            if (error.response?.data?.redirect) {
                navigate(error.response.data.redirect);
                return toast.error(error.response.data.message || "Please complete your setup or renew your subscription.");
            }

            toast.error('An error occurred while fetching the food items.');
        } finally {
            setLoading(false);
        }
    };

    const removeFood = async (foodId) => {
        try {
            let token = localStorage.getItem('token');
            const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchList(); // Refresh list after deletion
            } else {
                toast.error('Error removing the food item.');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                if (error.response.data.message === 'Token expired') {
                    logout();
                }
            }
            toast.error('An error occurred while removing the food item.');
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleScroll = () => {
        // Check if the page is at the top or scrolled
        if (window.scrollY === 0) {
            setIsAtTop(true);  // User is at the top
        } else {
            setIsAtTop(false); // User has scrolled down
        }
    };

    useEffect(() => {
        fetchList();
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="list">
            <p className="list-header">All Food List</p>
            {loading ? (
                <Loader />
            ) : list && list.length === 0 ? (
                <div className="no-items">No food items available.</div>
            ) : (
                <div className="list-container">
                    {list.map((item, index) => (
                        <div key={index} className="list-item">
                            <img src={`${url}/images/${item.image}`} alt={item.name} />
                            <div className="info-row">
                                <p><span>Name:</span> {item.name}</p>
                                <p><span>Category:</span> {item.category}</p>
                            </div>
                            <div className="info-row">
                                <p><span>Unit:</span> {item.quantity} {item.unit}</p>
                                <p><span>Price:</span> ₹{item.price}</p>
                            </div>
                            {/* Description */}
                            <div className="description-row">
                                <p><span>Description:</span> {item.description}</p>
                            </div>
                            {/* Edit and Delete buttons */}
                            <div className="buttons-row">
                                <button className="edit-btn" onClick={() => navigate(`/dashboard/edit/${item._id}`)}>Edit</button>
                                <button className="delete-btn" onClick={() => removeFood(item._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Go to Top Button */}
            {!isAtTop && (
                <button className="go-to-top" onClick={scrollToTop}>
                    ↑
                </button>
            )}
        </div>
    );
};

export default List;
