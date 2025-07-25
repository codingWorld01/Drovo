import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { StoreContext } from '../../context/storeContext';
import Loader from '../../components/Loader/Loader';

const Dashboard = () => {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { url, logout } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        let token = localStorage.getItem('token');
        if (!token) {
          navigate('/logout');
          return;
        }

        const response = await axios.get(`${url}/api/shops/details`, {
          headers: { token },
        });

        if (response.data.success) {
          setShopData(response.data.shop);
          setLoading(false);
        } else {
          toast.error(response.data.message || 'Failed to fetch shop data');
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);

        if (error.response && error.response.status === 401) {
          if (error.response.data.message === 'Token expired') {
            logout();
          }
        }

        if (error.response?.data?.redirect) {
          navigate(error.response.data.redirect);
          return toast.error(error.response.data.message || "Please complete your setup or renew your subscription.");
        }

        toast.error('An error occurred while fetching shop details');
        console.error('Error fetching shop data:', error);
      }
    };

    fetchShopData();
  }, [url, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (!shopData) {
    return <div>No data available</div>;
  }

  const googleMapUrl = `https://www.google.com/maps?q=${shopData.shopAddress.latitude},${shopData.shopAddress.longitude}&hl=es&z=14&output=embed`;

  return (
    <div className="dashboard">
      {shopData.shopImage && (
        <div className="shop-banner">
          <img src={`${shopData.shopImage}`} alt="" className="shop-banner-image" />
        </div>
      )}

      <div className="dashboard-content">

        <div className="dashboard-info">
          <div className="shop-info">
            <h3>Shop Information</h3>
            <p><strong>Name:</strong> {shopData.name}</p>
            <p><strong>Email:</strong> {shopData.email}</p>
            <p><strong>Phone:</strong> {shopData.phone || 'N/A'}</p>
            <p><strong>Address:</strong> {shopData.shopAddress.address}</p>
          </div>

          <div className="subscription-info">
            <h3>Subscription Details</h3>
            <p><strong>Subscription Plan:</strong> {shopData.subscription}</p>
            <p><strong>Subscription End Date:</strong> {new Date(shopData.subEndDate).toLocaleDateString()}</p>
            <p><strong>Setup Complete:</strong> {shopData.isSetupComplete ? 'Yes' : 'No'}</p>
          </div>

          <div className="payment-info">
            <h3>Payment Details</h3>
            <p><strong>Razorpay Order ID:</strong> {shopData.paymentDetails?.razorpayOrderId || 'N/A'}</p>
            <p><strong>Razorpay Payment ID:</strong> {shopData.paymentDetails?.razorpayPaymentId || 'N/A'}</p>
            <p><strong>Payment Date:</strong> {shopData.paymentDetails?.paymentDate ? new Date(shopData.paymentDetails.paymentDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="map-section">
          <h3>Shop Location</h3>
          <iframe
            title="Shop Location"
            width="100%"
            height="300px"
            frameBorder="0"
            style={{ border: 0, borderRadius: '15px' }}
            src={googleMapUrl}
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
