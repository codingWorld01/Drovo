import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});  // { shopId: { itemId: quantity, ... }, ... }
    const [shopId, setShopId] = useState(null);  // Track the current shop ID
    const url = import.meta.env.VITE_BASE_URL;
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);
    const [userType, setUserType] = useState("user");
    let navigate = useNavigate();

    // Add food item to cart for a specific shop
    const addToCart = async (itemId, currentShopId) => {

        setCartItems((prev) => {
            const shopCart = prev[currentShopId] || {};  // Get cart for current shop
            const updatedCart = { ...shopCart };
            if (!updatedCart[itemId]) {
                updatedCart[itemId] = 1;
            } else {
                updatedCart[itemId] += 1;
            }
            return { ...prev, [currentShopId]: updatedCart };  // Update cart for the shop
        });

        // If logged in, save cart to the server
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId, shopId: currentShopId }, { headers: { token } });
        }
    };

    // Remove food item from cart for a specific shop
    const removeFromCart = async (itemId, currentShopId) => {
        setCartItems((prev) => {
            const shopCart = { ...prev[currentShopId] };
            if (shopCart[itemId] > 1) {
                shopCart[itemId] -= 1;
            } else {
                delete shopCart[itemId];
            }
            return { ...prev, [currentShopId]: shopCart };  // Update cart for the shop
        });

        // If logged in, update the cart on the server
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId, shopId: currentShopId }, { headers: { token } });
        }
    };

    const deleteFromCart = (itemId, shopId) => {
        const updatedCartItems = { ...cartItems };

        // Remove the item from the cart for the specific shop
        if (updatedCartItems[shopId]) {
            delete updatedCartItems[shopId][itemId]; // Removes the item entirely
        }

        // Update the context or state with the new cart items
        setCartItems(updatedCartItems); // Assuming setCartItems is the function to update the cart state
    };

    const getNumberOfItems = () => {
        let distinctItemCount = 0;
        const shopCart = cartItems[shopId] || {};  // Get cart for the current shop

        for (const item in shopCart) {
            if (shopCart[item] > 0) {
                distinctItemCount += 1;  // Count distinct items
            }
        }

        return distinctItemCount;  // Return the distinct item count
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.setItem('userType', 'user');
        setUserType('user');
        setToken("");
        navigate("/");
        toast.success("Logout")
    }


    // Fetch food items for the selected shop
    const fetchShopFoodList = async (shopId) => {
        try {
            if (shopId) {
                const response = await axios.get(`${url}/api/food/list/${shopId}`, { headers: { token } });
                setFoodList(response.data.data);  // Set food items specific to the shop
                setShopId(shopId);  // Set shopId when food items are fetched
            }
        } catch (error) {
            if (error.response?.data?.redirect) {
                navigate(error.response.data.redirect); // Redirect to setup or subscription page
                return error.response.data.message || "Please complete your setup or renew your subscription.";
            }
            console.error("Error fetching food list for shop:", error);
        }
    };

    // Get total cart amount for the current shop
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        const shopCart = cartItems[shopId] || {};  // Get cart for the current shop
        for (const item in shopCart) {
            if (shopCart[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) totalAmount += itemInfo.price * shopCart[item];
            }
        }
        return totalAmount;
    };

    useEffect(() => {
        async function loadData() {
            if (localStorage.getItem('userType')) setUserType(localStorage.getItem('userType'));

            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        fetchShopFoodList(shopId);
    }, [shopId]);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        url,
        token,
        setToken,
        userType,
        setUserType,
        fetchShopFoodList,
        shopId,
        setShopId,
        getTotalCartAmount,
        deleteFromCart,
        getNumberOfItems,
        logout
    };

    return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};
