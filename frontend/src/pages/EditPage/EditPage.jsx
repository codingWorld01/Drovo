import React, { useState, useEffect, useContext } from 'react';
import '../Add/Add.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { StoreContext } from '../../context/storeContext';
import { assetsAdmin } from '../../assets/assetsAdmin';
import Loader from '../../components/Loader/Loader';

const EditPage = () => {
  const { logout, url } = useContext(StoreContext);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    foodType: "Dairy",
    category: "Milk",
    unit: "liter",
    quantity: 1,
    image: ""
  });
  const navigate = useNavigate();
  const { id } = useParams();

  const shopCategories = {
    Dairy: ["Milk", "Butter", "Yogurt", "Ghee", "Cheese", "Paneer", "Cream", "Others"],
    Grocery: ["Fruits", "Vegetables", "Rice", "Spices", "Flour", "Cereals", "Others"],
    Bakery: ["Bread", "Cakes", "Pastries", "Cookies", "Buns", "Others"]
  };

  const getFoodTypeFromCategory = (category) => {
    for (const [foodType, categories] of Object.entries(shopCategories)) {
      if (categories.includes(category)) {
        return foodType;
      }
    }
    return "Dairy";
  };

  const fetchFoodDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${url}/api/food/${id}`, {
        headers: { token }
      });
      if (response.data.success) {
        const foodData = response.data.data;
        const inferredFoodType = getFoodTypeFromCategory(foodData.category);
        setData({
          ...foodData,
          foodType: inferredFoodType
        });
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
      ...(name === "foodType" && { category: shopCategories[value][0] })
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');

    try {
      // Exclude image from formData unless a new image is selected
      const { image: existingImage, ...formData } = data;
      if (image) {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            formData.image = reader.result;
            resolve();
          };
          reader.onerror = reject;
        });
      }

      setLoading(true);


      await toast.promise(
        axios.post(`${url}/api/food/edit/${id}`, formData, {
          headers: { token, "Content-Type": "application/json" }
        }),
        {
          loading: 'Updating food item...',
          success: (response) => {
            setData({
              name: "",
              description: "",
              price: "",
              category: "",
              unit: "liter",
              quantity: 1,
              image: ""
            });
            setImage(null);
            navigate('/dashboard/list');
            return response.data.message || "Food item updated successfully!";
          },
          error: (error) => {
            console.error("Error in updating food item:", error);
            if (error.response?.status === 401 && error.response.data.message === 'Token expired') {
              logout();
            }
            if (error.response?.data?.redirect) {
              navigate(error.response.data.redirect);
              return error.response.data.message || "Please complete your setup or renew your subscription.";
            }
            return error.response?.data?.message || "An error occurred while updating the food item.";
          }
        }
      );
    } catch (error) {
      toast.error("Error uploading image");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="add">
      <form onSubmit={onSubmitHandler} className="flex-col">
        <div className="add-image-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : data.image || assetsAdmin.upload_area}
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
            <select onChange={onChangeHandler} name="foodType" value={data.foodType}>
              <option value="Dairy">Dairy</option>
              <option value="Grocery">Grocery</option>
              <option value="Bakery">Bakery</option>
            </select>
          </div>
          <div className="add-category flex-col">
            <p>Category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              {shopCategories[data.foodType]?.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
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
        <button type="submit" className="add-button" disabled={loading}>
          {loading ? "UPDATING..." : "UPDATE"}
        </button>
      </form>
    </div>
  );
};

export default EditPage;