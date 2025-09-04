import React, { useContext, useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/storeContext';
import { ChevronUp, Package, Plus } from 'lucide-react';

// Skeleton components
const SkeletonText = ({ width = '100%', height = '1rem' }) => (
  <div 
    className="skeleton-shimmer" 
    style={{ width, height, borderRadius: '4px' }}
  />
);

const SkeletonImage = ({ width = '100%', height = '200px' }) => (
  <div 
    className="skeleton-shimmer" 
    style={{ width, height, borderRadius: '8px' }}
  />
);

const SkeletonButton = ({ width = '49%', height = '2.5rem' }) => (
  <div 
    className="skeleton-shimmer" 
    style={{ width, height, borderRadius: '5px' }}
  />
);

// Individual skeleton item
const SkeletonListItem = () => (
  <div className="list-item skeleton-item">
    <SkeletonImage height="200px" />
    <div className="info-row gap-1" style={{ marginTop: '10px' }}>
      <SkeletonText width="45%" height="20px" />
      <SkeletonText width="45%" height="20px" />
    </div>
    <div className="info-row gap-2" style={{ marginTop: '10px' }}>
      <SkeletonText width="40%" height="20px" />
      <SkeletonText width="35%" height="20px" />
    </div>
    <div className="description-row" style={{ marginTop: '15px' }}>
      <SkeletonText width="100%" height="16px" />
      <SkeletonText width="80%" height="16px" style={{ marginTop: '5px' }} />
    </div>
    <div className="buttons-row" style={{ marginTop: '20px' }}>
      <SkeletonButton />
      <SkeletonButton />
    </div>
  </div>
);

// Main skeleton loader showing multiple items
const SkeletonLoader = () => (
  <div className="list-container">
    {[...Array(6)].map((_, index) => (
      <SkeletonListItem key={index} />
    ))}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="no-items">
    <div className="empty-icon">
      <Package size={64} strokeWidth={1.5} />
    </div>
    <h3>No Food Items Available</h3>
    <p>Your food inventory is empty. Start by adding your first item!</p>
    <button 
      className="add-first-item-btn"
      onClick={() => window.location.href = '/dashboard/add'}
    >
      <Plus size={20} />
      Add Your First Item
    </button>
  </div>
);

const List = ({ url }) => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);
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
                fetchList();
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
        if (window.scrollY === 0) {
            setIsAtTop(true);
        } else {
            setIsAtTop(false);
        }
    };

    useEffect(() => {
        fetchList();
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="list">
            <p className="list-header">All Food List</p>
            
            {loading ? (
                <SkeletonLoader />
            ) : list && list.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="list-container">
                    {list.map((item, index) => (
                        <div key={index} className="list-item">
                            <img src={`${item.image}`} alt={item.name} />
                            <div className="info-row gap-1">
                                <p><span>Name:</span> {item.name}</p>
                                <p><span>Category:</span> {item.category}</p>
                            </div>
                            <div className="info-row gap-2">
                                <p><span>Unit:</span> {item.quantity} {item.unit}</p>
                                <p><span>Price:</span> ₹{item.price}</p>
                            </div>
                            {/* Description */}
                            <div className="description-row">
                                <p><span>Description:</span> {item.description}</p>
                            </div>
                            {/* Edit and Delete buttons */}
                            <div className="buttons-row">
                                <button className="edit-btn" onClick={() => navigate(`/dashboard/edit/${item._id}`)}>
                                    Edit
                                </button>
                                <button className="delete-btn" onClick={() => removeFood(item._id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Go to Top Button */}
            {!isAtTop && (
                <button className="go-to-top" onClick={scrollToTop}>
                    <ChevronUp size={24} />
                </button>
            )}
        </div>
    );
};

export default List;