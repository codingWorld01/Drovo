import React, { useState, useEffect, useContext } from 'react';
import '../Add/Add.css'; // Reusing the same styles as Add
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { StoreContext } from '../../context/storeContext';
import { assetsAdmin } from '../../assets/assetsAdmin';
import Loader from '../../components/Loader/Loader';

const EditPage = ({ url }) => {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        shopType: "Dairy",
        category: "Milk",
        unit: "liter",
        quantity: 1,
    });
    const { logout } = useContext(StoreContext);
    const navigate = useNavigate();
    const { id } = useParams(); // Get food item ID from the URL

    const shopCategories = {
        Dairy: ["Milk", "Butter", "Yogurt", "Ghee", "Cheese", "Paneer", "Cream", "Others"],
        Grocery: ["Fruits", "Vegetables", "Rice", "Spices", "Flour", "Cereals", "Others"],
        Bakery: ["Bread", "Cakes", "Pastries", "Cookies", "Buns", "Others"]
    };

    const getShopTypeFromCategory = (category) => {
        for (const [shopType, categories] of Object.entries(shopCategories)) {
            if (categories.includes(category)) {
                return shopType;
            }
        }
        return "Dairy"; // Default shop type
    };

    const fetchFoodDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${url}/api/food/${id}`, {
                headers: { token },
            });
            if (response.data.success) {
                const foodData = response.data.data;

                // Infer shopType based on the category
                const inferredShopType = getShopTypeFromCategory(foodData.category);

                setData({
                    ...foodData,
                    shopType: inferredShopType, // Add shopType dynamically
                });
                console.log(foodData);
            } else {
                toast.error("Failed to fetch food details.");
            }
        } catch (error) {
            if (error.response?.status === 401 && error.response.data.message === "Token expired") {
                logout();
            } else {
                toast.error("Error fetching food details.");
            }
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchFoodDetails();
    }, [id]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setData((data) => ({
            ...data,
            [name]: value,
            ...(name === "shopType" && { category: shopCategories[value][0] }), // Update category if shopType changes
        }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("unit", data.unit);
        formData.append("quantity", data.quantity);

        if (image) {
            formData.append("image", image); // Append image only if it exists
        }

        const token = localStorage.getItem('token'); // Retrieve token from localStorage

        // Using toast.promise for better user experience
        await toast.promise(
            axios.post(`${url}/api/food/edit/${id}`, formData, {
                headers: { token, "Content-Type": "multipart/form-data" },
            }),
            {
                loading: 'Updating food item...',
                success: (response) => {
                    // Reset the form and navigate on success
                    setData({
                        name: "",
                        description: "",
                        price: "",
                        category: "",
                        unit: "liter",
                        quantity: 1,
                    });
                    setImage(null); // Reset the image
                    navigate('/dashboard/list');
                    return response.data.message || "Food item updated successfully!";
                },
                error: (error) => {
                    console.error("Error in updating food item:", error);
                    if (error.response?.status === 401 && error.response.data.message === 'Token expired') {
                        logout();
                    }

                    if (error.response?.data?.redirect) {
                        navigate(error.response.data.redirect); // Redirect to setup or subscription page
                        return error.response.data.message || "Please complete your setup or renew your subscription.";
                    }

                    if (error.response?.data?.message) {
                        return error.response.data.message; // Return detailed error message from the backend
                    }

                    return "An error occurred while updating the food item.";
                }
            }
        );
    };

    return (
        <div className="add">
            {loading && <Loader />}
            <form onSubmit={onSubmitHandler} className="flex-col">
                <div className="add-image-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img
                            src={
                                image
                                    ? URL.createObjectURL(image) // If a new image is uploaded, show its preview
                                    : data.image // Show the existing image if it exists
                                        ? `${url}/images/${data.image}` // Use the server path for the uploaded image
                                        : assetsAdmin.upload_area // Fallback to default placeholder
                            }
                            alt="Upload"
                        />
                    </label>
                    <input
                        onChange={(e) => setImage(e.target.files[0])}
                        type="file"
                        id="image"
                        hidden
                    />
                </div>
                <div className="add-product-name flex-col">
                    <p>Item Name</p>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        name="name"
                        autoComplete="off"
                        placeholder="Type here"
                        required
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
                        required
                    ></textarea>
                </div>
                <div className="add-category-price">
                    <div className="add-shop-type flex-col">
                        <p>Shop Type</p>
                        <select onChange={onChangeHandler} name="shopType" value={data.shopType}>
                            <option value="Dairy">Dairy</option>
                            <option value="Grocery">Grocery</option>
                            <option value="Bakery">Bakery</option>
                        </select>
                    </div>
                    <div className="add-category flex-col">
                        <p>Category</p>
                        <select onChange={onChangeHandler} name="category" value={data.category}>
                            {shopCategories[data.shopType]?.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="add-quantity flex-col">
                        <p>Quantity</p>
                        <input
                            onChange={onChangeHandler}
                            value={data.quantity}
                            type="number"
                            name="quantity"
                            min="1"
                            required
                        />
                    </div>
                    <div className="add-unit flex-col">
                        <p>Unit</p>
                        <select onChange={onChangeHandler} name="unit" value={data.unit}>
                            <option value="liter">Liter</option>
                            <option value="kg">Kg</option>
                            <option value="item">Item</option>
                            <option value="grams">Grams</option>
                            <option value="ml">ml</option>
                            <option value="dozen">Dozen</option>
                        </select>
                    </div>
                    <div className="add-price flex-col">
                        <p>Product Price</p>
                        <input
                            onChange={onChangeHandler}
                            value={data.price}
                            type="number"
                            name="price"
                            placeholder="₹ 20"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="add-button">
                    UPDATE
                </button>
            </form>
        </div>
    );
};

export default EditPage;
