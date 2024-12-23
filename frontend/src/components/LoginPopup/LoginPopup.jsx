import React, { useState, useContext } from "react";
import "./LoginPopup.css";
import { assetsUser } from "../../assets/assetsUser";
import { StoreContext } from "../../context/storeContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken, setUserType } = useContext(StoreContext);
    const [currentState, setCurrentState] = useState("Login");
    const [otpStep, setOtpStep] = useState(false); // Track OTP step
    const [otp, setOtp] = useState(""); // Store OTP
    const navigate = useNavigate();

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

    const onSendOtp = async (event) => {
        event.preventDefault();

        // Using toast.promise for loading, success, and error messages during OTP sending
        await toast.promise(
            axios.post(`${url}/api/send-otp`, { email: data.email, password: data.password }),
            {
                loading: 'Sending OTP...',
                success: (response) => {
                    if (response.data.success) {
                        setOtpStep(true);
                        return 'OTP sent successfully!';
                    }
                    throw new Error(response.data.message); // Error will be caught by toast.promise
                },
                error: 'Failed to send OTP. Please try again.',
            }
        ).catch((error) => {
            console.error("Error while sending OTP:", error);
        });
    };

    const onOtpSubmit = async (event) => {
        event.preventDefault();

        // Using toast.promise for loading, success, and error messages during OTP verification
        await toast.promise(
            axios.post(`${url}/api/verify-otp`, {
                email: data.email,
                otp,
                name: data.name,
                password: data.password,
            }),
            {
                loading: 'Verifying OTP...',
                success: (response) => {
                    if (response.data.success) {
                        // Update the local state and navigate after successful OTP verification
                        localStorage.setItem("shopName", data.name);
                        localStorage.setItem("shopEmail", data.email);
                        localStorage.setItem("userType", "shop");
                        setUserType("shop");
                        setToken(response.data.token);
                        localStorage.setItem("token", response.data.token);
                        navigate("/setup");
                        setShowLogin(false);
                        return 'OTP Verified! Account setup completed.';
                    }
                    throw new Error(response.data.message); // Error will be caught by toast.promise
                },
                error: 'Failed to verify OTP. Please try again.',
            }
        ).catch((error) => {
            console.error("Error during OTP verification:", error);
        });
    };

    const onLoginOrRegister = async (event) => {
        event.preventDefault();

        let newUrl = `${url}/api/${currentState === "Login" ? "login" : "register"}`;

        // Using toast.promise for loading, success, and error messages during login or registration
        await toast.promise(
            axios.post(newUrl, data),
            {
                loading: 'Processing...',
                success: (response) => {
                    if (response.data.success) {
                        setToken(response.data.token);
                        localStorage.setItem("token", response.data.token);

                        if (data.role === "shop" && currentState === "Login") {
                            localStorage.setItem("userType", "shop");
                            setUserType("shop");
                            navigate("/");
                        } else {
                            localStorage.setItem("userType", "user");
                            setUserType("user");
                            navigate("/");
                        }

                        setShowLogin(false);

                        return `${data.role === "shop" ? "Shop" : "User"} ${currentState} successful!`;
                    }
                    throw new Error(response.data.message); // Error will be caught by toast.promise
                },
                error: 'An error occurred during login or registration.',
            }
        ).catch((error) => {
            console.error("Error during login or registration:", error);
        });
    };

    return (
        <div className="login-popup">
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

                <button type="submit">
                    {data.role === "shop" && currentState === "Sign Up" && !otpStep
                        ? "Send OTP"
                        : otpStep
                            ? "Verify OTP"
                            : "Submit"}
                </button>

                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
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
