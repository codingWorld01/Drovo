import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/storeContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { assetsUser } from "../../assets/assetsUser";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, shopId, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    latitude: "",
    longitude: "",
    flat: "",
    floor: "",
    landmark: "",
  });

  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isAddressFilled, setIsAddressFilled] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setData((prevData) => ({ ...prevData, latitude, longitude }));
          setIsAddressFilled(true);

          // Reverse geocode to get the address using Google Maps API
          const geocoder = new window.google.maps.Geocoder();
          const latLng = new window.google.maps.LatLng(latitude, longitude);

          geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === "OK" && results[0]) {
              const address = results[0].formatted_address;
              setData((prevData) => ({ ...prevData, street: address }));
              toast.success("Location fetched successfully!");
            } else {
              toast.error("Unable to fetch location. Please try again.");
            }
          });
        },
        () => {
          toast.error("Unable to access location. Please enable location services.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    if (window.google) {
      const input = document.getElementById("street-address");
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: "IN" },
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (place.geometry) {
          const latitude = place.geometry.location.lat();
          const longitude = place.geometry.location.lng();
          const address = place.formatted_address || "";

          setData((prevData) => ({
            ...prevData,
            street: address,
            latitude,
            longitude,
          }));

          setIsAddressFilled(true);
        }
      });
    }
  }, []);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[789]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const isFormValid = () => {
    const { firstName, lastName, phone, street, flat, latitude, longitude } = data;
    return firstName && lastName && phone && street && latitude && longitude && flat;
  };

  useEffect(() => {
    const fetchDistanceAndCharge = async () => {
      if (shopId) {

        const shopCoordinates = await axios
          .get(`${url}/api/shops/${shopId}`, { headers: { token } })
          .then((res) => res.data.data.coordinates)
          .catch((err) => {
            toast.error("Unable to fetch shop location.");
            return null;
          });

        if (!shopCoordinates) return;
      }

      setIsCalculatingDistance(true);

      const customerCoordinates = {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
      };

      const service = new window.google.maps.DistanceMatrixService();
      const request = {
        origins: [new window.google.maps.LatLng(customerCoordinates.lat, customerCoordinates.lng)],
        destinations: [new window.google.maps.LatLng(shopCoordinates.lat, shopCoordinates.lng)],
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      service.getDistanceMatrix(request, (response, status) => {
        if (status === "OK") {
          const distance = response.rows[0].elements[0].distance.value;
          const calculatedCharge = calculateDeliveryCharge(distance);
          setDeliveryCharge(calculatedCharge);
          setIsCalculatingDistance(false);
        } else {
          toast.error("Unable to calculate distance. Please try again.");
          setIsCalculatingDistance(false);
        }
      });

      const calculateDeliveryCharge = (distance) => {
        const distanceInKm = distance / 1000;
        if (distanceInKm < 1) return 12;
        if (distanceInKm < 2.5) return 20;
        if (distanceInKm < 4) return 30;
        if (distanceInKm < 6) return 40;
        return 50;
      };
    };

    if (data.latitude && data.longitude) {
      fetchDistanceAndCharge();
    }
  }, [data.latitude, data.longitude]);

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!data.latitude || !data.longitude || !data.street || deliveryCharge == 0) {
      toast.error("Please provide a valid address using 'Current Location' or the autocomplete search");
      return;
    }

    if (!isFormValid()) {
      toast.error("Please complete all fields before submitting.");
      return;
    }


    if (!validatePhoneNumber(data.phone)) {
      toast.error("Invalid Phone Number");
      return;
    }

    const orderData = {
      address: data,
      items: food_list
        .filter((item) => cartItems[shopId]?.[item._id] > 0) // Check for the current shopId
        .map((item) => ({
          ...item,
          quantity: cartItems[shopId][item._id], // Access quantity correctly for the current shopId
        })),
      amount: getTotalCartAmount(),
      deliveryCharge: deliveryCharge,
      shopId: shopId,
    };

    axios
      .post(`${url}/api/order/place`, orderData, { headers: { token } })
      .then((res) => {
        toast.success("Order placed successfully!");
        navigate("/myorders");
        setCartItems({});
      })
      .catch(() => toast.error("Failed to place order. Please try again."));
  };

  return (
    <div>
      <form
        className="place-order"
        onSubmit={placeOrder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        autocomplete="off"
      >
        <div className="place-order-left">
          <p className="title">Delivery Information</p>
          <div className="multi-field">
            <input
              required
              name="firstName"
              onChange={onChangeHandler}
              value={data.firstName}
              type="text"
              placeholder="First Name"
            />
            <input
              required
              name="lastName"
              onChange={onChangeHandler}
              value={data.lastName}
              type="text"
              placeholder="Last Name"
            />
          </div>

          <button type="button" onClick={getCurrentLocation} className="current-location-btn">
            Use Current Location
            <img src={assetsUser.location} alt="" className="button-icon" />
          </button>
          <p className="or-separator">OR</p>
          <textarea
            id="street-address"
            required
            name="street"
            onChange={onChangeHandler}
            value={data.street}
            type="text"
            placeholder="Select nearby location..."
            rows="2"
          ></textarea>
          {isAddressFilled && (
            <>
              <input
                name="flat"
                onChange={onChangeHandler}
                value={data.flat}
                type="text"
                placeholder="Flat / House no / Building name *"
                required
              />
              <div className="multi-field">
                <input
                  name="floor"
                  onChange={onChangeHandler}
                  value={data.floor}
                  type="text"
                  placeholder="Floor (optional)"
                />
                <input
                  required
                  name="phone"
                  onChange={onChangeHandler}
                  value={data.phone}
                  type="text"
                  placeholder="Phone"
                />
              </div>
              <input
                name="landmark"
                onChange={onChangeHandler}
                value={data.landmark}
                type="text"
                placeholder="Nearby landmark (optional)"
              />
            </>
          )}
        </div>

        <div className="place-order-right">
          <div className="cart-total-final">
            <h2>Cart Total</h2>
            <div>
              <div className="cart-total-details-final">
                <p>Subtotal</p>
                <p>&#8377;{getTotalCartAmount()}</p>
              </div>
              <hr />
              {isCalculatingDistance ? (
                <p>Calculating delivery fee...</p>
              ) : (
                <>
                  <div className="cart-total-details-final">
                    <p>Delivery Fee</p>
                    <p>&#8377;{deliveryCharge}</p>
                  </div>
                  <hr />
                </>
              )}
              <div className="cart-total-details-final">
                <b>Total</b>
                <b>&#8377;{getTotalCartAmount() + deliveryCharge}</b>
              </div>
              <button type="submit">Confirm Order</button>
            </div>
          </div>
        </div>
      </form>
      <div className="payment-note">
        <p><strong>Note:</strong> Payment can be made either via Cash on Delivery or Online Payment when the delivery boy arrives.</p>
      </div>
    </div>
  );
};

export default PlaceOrder;
