import React, { useState } from 'react';
import './Add.css';
import { assetsAdmin } from '../../assets/assetsAdmin';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Add = ({ url }) => {
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Milk",
        unit: "liter",  // default unit
        quantity: 1
    });

    let navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
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
                    <p>Product name</p>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        name="name"
                        placeholder="Type here"
                    />
                </div>
                <div className="add-product-description flex-col">
                    <p>Product description</p>
                    <textarea
                        onChange={onChangeHandler}
                        value={data.description}
                        name="description"
                        rows="6"
                        placeholder="Write content here"
                    ></textarea>
                </div>

                <div className="add-category-price">

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
                        </select>
                    </div>

                </div>

                <div className="add-category-price">



                    <div className="add-category flex-col">
                        <p>Category</p>
                        <select onChange={onChangeHandler} name="category">
                            <option value="Milk">Milk</option>
                            <option value="Butter">Butter</option>
                            <option value="Yogurt">Yogurt</option>
                            <option value="Ghee">Ghee</option>
                            <option value="Cheese">Cheese</option>
                            <option value="Paneer">Paneer</option>
                            <option value="Cake">Cake</option>
                            <option value="Cream">Cream</option>
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
                        />
                    </div>
                </div>
                <button type="submit" className="add-btn">ADD</button>
            </form>
        </div>
    );
};

export default Add;
