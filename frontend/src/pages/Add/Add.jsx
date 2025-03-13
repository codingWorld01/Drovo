import React, { useContext, useState } from 'react';
import './Add.css';
import { assetsAdmin } from '../../assets/assetsAdmin';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/storeContext';

const Add = ({ url }) => {
    const { logout } = useContext(StoreContext);
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        shopType: "Dairy",  // default shop type
        category: "Milk",   // default category for Dairy shop
        unit: "liter",      // default unit
        quantity: 1
    });

    let navigate = useNavigate();

    const shopCategories = {
        Dairy: ["Milk", "Butter", "Yogurt", "Ghee", "Cheese", "Paneer", "Cream", "Others"],
        Grocery: ["Fruits", "Vegetables", "Rice", "Spices", "Flour", "Cereals", "Others"],
        Bakery: ["Bread", "Cakes", "Pastries", "Cookies", "Buns", "Others"]
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));

        // If shop type changes, reset category 
        if (name === 'shopType') {
            setData({
                ...data,
                shopType: value,
                category: shopCategories[value][0], // Reset to the first category for the selected shop type
            });
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("shopType", data.shopType);
        formData.append("category", data.category);
        formData.append("unit", data.unit);
        formData.append("quantity", data.quantity);
        formData.append("image", image);

        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        // Using toast.promise to show loader, success, and error messages
        await toast.promise(
            axios.post(`${url}/api/food/add`, formData, { headers: { token } }),
            {
                loading: 'Adding food item...',
                success: (response) => {
                    // Reset form and image on success
                    setData({
                        name: "",
                        description: "",
                        price: "",
                        shopType: "Dairy",
                        category: "Milk",
                        unit: "liter",
                        quantity: 1
                    });
                    setImage(null);  // Reset image
                    return response.data.message || "Food item added successfully!";
                },
                error: (error) => {
                    console.error("Error in adding product", error);
                    if (error.response?.data?.redirect) {
                        navigate(error.response.data.redirect); // Redirect to setup or subscription page
                        return error.response.data.message || "Please complete your setup or renew your subscription.";
                    }
                    if (error.response && error.response.status === 401) {
                        if (error.response.data.message === 'Token expired') {
                            logout();
                        }
                    }
                    if (error.response && error.response.data && error.response.data.message) {
                        // Show detailed error message from the backend
                        return error.response.data.message;
                    }

                    return "An error occurred while adding the food item.";
                }
            }
        );
    };

    return (
        <div className="add">
            <form onSubmit={onSubmitHandler} className="flex-col">
                <div className="add-image-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img
                            src={image ? URL.createObjectURL(image) : assetsAdmin.upload_area}
                            alt="Upload"
                        />
                    </label>
                    <input
                        onChange={(e) => setImage(e.target.files[0])}
                        type="file"
                        id="image"
                        hidden
                        required
                    />
                </div>
                <div className="add-product-name flex-col">
                    <p>Item Name</p>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        name="name"
                        autoComplete='off'
                        placeholder="Type here"
                    />
                </div>
                <div className="add-product-description flex-col">
                    <p>Item Description</p>
                    <textarea
                        onChange={onChangeHandler}
                        value={data.description}
                        name="description"
                        rows="3"
                        placeholder="Write content here"
                    ></textarea>
                </div>

                <div className="add-category-price">
                    {/* Shop Type Selection */}
                    <div className="add-shop-type flex-col">
                        <p>Shop Type</p>
                        <select onChange={onChangeHandler} name="shopType" value={data.shopType}>
                            <option value="Dairy">Dairy</option>
                            <option value="Grocery">Grocery</option>
                            <option value="Bakery">Bakery</option>
                        </select>
                    </div>

                    {/* Category Dropdown based on Shop Type */}
                    <div className="add-category flex-col">
                        <p>Category</p>
                        <select onChange={onChangeHandler} name="category" value={data.category}>
                            {shopCategories[data.shopType]?.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>


                    {/* Add Quantity Input */}
                    <div className="add-quantity flex-col">
                        <p>Quantity</p>
                        <input
                            onChange={onChangeHandler}
                            value={data.quantity}
                            type="number"
                            name="quantity"
                            min="1"
                            placeholder="1"
                        />
                    </div>

                    {/* Add Unit Selection */}
                    <div className="add-unit flex-col">
                        <p>Unit</p>
                        <select onChange={onChangeHandler} name="unit">
                            <option value="liter">Liter</option>
                            <option value="kg">Kg</option>
                            <option value="item">Item</option>
                            <option value="grams">grams</option>
                            <option value="ml">ml</option>
                            <option value="dozen">Dozen</option>
                        </select>
                    </div>

                    {/* Product Price */}
                    <div className="add-price flex-col">
                        <p>Product Price</p>
                        <input
                            onChange={onChangeHandler}
                            value={data.price}
                            type="number"
                            name="price"
                            placeholder="₹ 20"
                        />
                    </div>
                </div>
                <button type="submit" className="add-button">ADD</button>
            </form>
        </div>
    );
};

export default Add;
