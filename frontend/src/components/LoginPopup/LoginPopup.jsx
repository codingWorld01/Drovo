import React, { useState, useContext } from "react";
import "./LoginPopup.css";
import { assetsUser } from "../../assets/assetsUser";
import { StoreContext } from "../../context/storeContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken, setUserType } = useContext(StoreContext);
    const [currentState, setCurrentState] = useState("Login");
    const [otpStep, setOtpStep] = useState(false); // Track OTP step
    const [otp, setOtp] = useState(""); // Store OTP
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);


    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData((data) => ({ ...data, [name]: value }));
    };

    const handleTermsClick = (e) => {
        e.preventDefault(); // Prevent default link behavior
        const url = "/terms-and-conditions"; // Define the URL
        window.open(url, "_blank"); // Open the URL in a new tab
    };
    

    const onSendOtp = async (event) => {
        event.preventDefault();

        setIsLoading(true); // Show loader

        try {
            const response = await axios.post(`${url}/api/send-otp`, { email: data.email, password: data.password });

            if (response.data.success) {
                setOtpStep(true);
                toast.success('OTP sent successfully!');
            } else if (response.data.message) {
                toast.error(response.data.message); // Backend-specific error
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
            toast.error(errorMessage);
            console.error("Error while sending OTP:", error);
        } finally {
            setIsLoading(false); // Hide loader after API call finishes
        }
    };


    const onOtpSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${url}/api/verify-otp`, {
                email: data.email,
                otp,
                name: data.name,
                password: data.password,
            });

            if (response.data.success) {
                localStorage.setItem("shopName", data.name);
                localStorage.setItem("shopEmail", data.email);
                localStorage.setItem("userType", "shop");
                setUserType("shop");
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                navigate("/setup");
                setShowLogin(false);
                toast.success('OTP Verified!');
            } else if (response.data.message) {
                toast.error(response.data.message); // Backend-specific error
            } else {
                toast.error("Failed to verify OTP. Please try again.");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to verify OTP. Please try again.';
            toast.error(errorMessage);
            console.error("Error during OTP verification:", error);
        }
        finally {
            setIsLoading(false); // Hide loader after API call finishes
        }
    };


    const onGoogleSuccess = async (credentialResponse) => {
        try {
            const userType = data.role;

            // Send the Google token to your backend to verify and get the user data
            const response = await axios.post(`${url}/api/login/google`, {
                token: credentialResponse.credential,
                userType: userType
            });

            if (response.data.success) {
                const { token, isNewUser } = response.data;

                if (isNewUser) {
                    // For new users, perform the signup flow with Google data
                    const decodedToken = jwtDecode(credentialResponse.credential);

                    const googleData = {
                        name: decodedToken.name, // Extracted from the token
                        email: decodedToken.email, // Extracted from the token
                        role: data.role, // Assuming the role (user/shop) is selected before Google login
                        password: "", // We don't need a password for Google login
                    };


                    // Send the Google data to the signup endpoint
                    const signupResponse = await axios.post(`${url}/api/register-google`, googleData);

                    if (signupResponse.data.success) {
                        setToken(signupResponse.data.token);
                        localStorage.setItem("token", signupResponse.data.token);
                        setUserType(userType);
                        localStorage.setItem("userType", userType);

                        if (userType === 'shop') {
                            // If shop, redirect to the /setup page
                            localStorage.setItem("shopEmail", decodedToken.email);
                            navigate("/setup");
                            toast.success("Shop signup successful via Google!");
                        } else {
                            // If user, navigate to the home page
                            navigate("/");
                            toast.success("User signup successful via Google!");
                        }

                        setShowLogin(false);
                    } else {
                        toast.error("Google signup failed!");
                    }
                } else {
                    // For existing users, perform login
                    setToken(token);
                    localStorage.setItem("token", token);
                    setUserType(userType);
                    localStorage.setItem("userType", userType);

                    navigate("/");

                    setShowLogin(false);
                    toast.success(`${userType === "shop" ? "Shop" : "User"} login successful via Google!`);
                }
            } else {
                toast.error(response.data.message || "Google Login Failed!");
            }
        } catch (error) {
            console.error("Error with Google Login:", error);
            toast.error("Google Login Failed!");
        }
    };



    const onLoginOrRegister = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const newUrl = `${url}/api/${currentState === "Login" ? "login" : "register"}`;

        try {
            const response = await axios.post(newUrl, data);

            if (response.data.success) {
                // Store token and user type
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);

                const userType = data.role === "shop" && currentState === "Login" ? "shop" : "user";
                localStorage.setItem("userType", userType);
                setUserType(userType);

                // Redirect and display success message
                navigate("/");
                setShowLogin(false);
                toast.success(`${userType === "shop" ? "Shop" : "User"} ${currentState} successful!`);
            } else if (response.data.message) {
                toast.error(response.data.message); // Backend-specific error
            } else {
                toast.error(`An error occurred during ${currentState}`); // Fallback error
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
            toast.error(errorMessage); // Display error toast
            console.error("Error during login or registration:", error);
        }
        finally {
            setIsLoading(false); // Hide loader after API call finishes
        }
    };


    return (
        <div className="login-popup">
            {isLoading && <Loader />}
            <form
                onSubmit={otpStep ? onOtpSubmit : currentState === "Sign Up" && data.role === "shop" ? onSendOtp : onLoginOrRegister}
                className="login-popup-container"
            >
                <div className="login-popup-title">
                    <h2>{currentState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assetsUser.cross_icon} alt="Close" />
                </div>

                <div className="role-selection">
                    <label className={`radio-label ${data.role === "user" ? "active" : ""}`}>
                        <input
                            type="radio"
                            name="role"
                            value="user"
                            checked={data.role === "user"}
                            onChange={onChangeHandler}
                        />
                        <span>User</span>
                    </label>
                    <label className={`radio-label ${data.role === "shop" ? "active" : ""}`}>
                        <input
                            type="radio"
                            name="role"
                            value="shop"
                            checked={data.role === "shop"}
                            onChange={onChangeHandler}
                        />
                        <span>Shop</span>
                    </label>
                </div>

                <div className="login-popup-input">
                    {currentState === "Sign Up" && (
                        <input
                            type="text"
                            name="name"
                            onChange={onChangeHandler}
                            value={data.name}
                            placeholder={data.role === "user" ? "Your Name" : "Shop Name"}
                            required
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        onChange={onChangeHandler}
                        value={data.email}
                        placeholder="Your Email"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        onChange={onChangeHandler}
                        value={data.password}
                        placeholder="Password"
                        required
                    />

                    {data.role === "shop" && currentState === "Sign Up" && otpStep && (
                        <input
                            type="text"
                            name="otp"
                            onChange={(e) => setOtp(e.target.value)}
                            value={otp}
                            placeholder="Enter OTP"
                            required
                        />
                    )}
                </div>

                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>
                        I have read and agree to the{" "}
                        <Link to="#" onClick={handleTermsClick} className="highlighted-link">
                            Terms and Conditions and Privacy Policy
                        </Link>.
                    </p>
                </div>

                <button type="submit">
                    {data.role === "shop" && currentState === "Sign Up" && !otpStep
                        ? "Send OTP"
                        : otpStep
                            ? "Verify OTP"
                            : "Submit"}
                </button>


                <div className="separator">
                    <span>OR</span>
                </div>


                <div className="google-login-wrapper">
                    <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={() => toast.error("Google Login Failed!")}
                    />
                </div>


                {currentState === "Sign Up" ? (
                    <p>
                        Already have an account?{" "}
                        <span onClick={() => setCurrentState("Login")}>Login here</span>
                    </p>
                ) : (
                    <p>
                        Create a new account?{" "}
                        <span onClick={() => setCurrentState("Sign Up")}>Click here</span>
                    </p>
                )}
            </form>
        </div>
    );
};

export default LoginPopup;
