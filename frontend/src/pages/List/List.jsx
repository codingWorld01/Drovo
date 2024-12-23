import React, { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';

const List = ({ url }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    let navigate = useNavigate();

    const fetchList = async () => {
        setLoading(true);
        try {
            let token = localStorage.getItem('token');
            const response = await axios.get(`${url}/api/food/list`, { headers: { token } });
            if (response.data.success) {
                setList(response.data.data);
            }
        } catch (error) {
            if (error.response?.data?.redirect) {
                navigate(error.response.data.redirect);
                toast.error(error.response.data.message);
            } else {
                toast.error('An error occurred while fetching the food items.');
            }
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
            toast.error('An error occurred while removing the food item.');
        }
    };

    useEffect(() => {
        fetchList();
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
                            <p className="cursor" onClick={() => removeFood(item._id)}>X</p>
                            <div className="info-row">
                                <p><span>Name:</span> {item.name}</p>
                                <p><span>Category:</span> {item.category}</p>
                            </div>
                            <div className="info-row">
                                <p><span>Unit:</span> {item.quantity} {item.unit}</p>
                                <p><span>Price:</span> ₹{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default List;
