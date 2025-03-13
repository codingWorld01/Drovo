import React from "react";
import "./TermsAndConditions.css"; // Optional: Add custom styles

const TermsAndConditions = () => {
    return (
        <div className="terms-container">
            <h1>Terms and Conditions</h1>
            <p>
                By using Drovo, you agree to the following terms and conditions. Please read them carefully to ensure a smooth and hassle-free experience.
            </p>

            <h2>1. Registration and Account</h2>
            <ul>
                <li>Users must create an account to place orders.</li>
                <li>All information provided during registration must be accurate and up to date.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            </ul>

            <h2>2. Order Placement and Delivery</h2>
            <ul>
                <li>You can place orders for milk, dahi, bread, and other essentials through our platform.</li>
                <li>
                    Delivery will be made within 10 minutes of order placement, subject to availability and conditions like traffic or weather.
                </li>
                <li>Ensure the delivery address and contact details are accurate to avoid delays.</li>
            </ul>

            <h2>3. Payment Terms</h2>
            <ul>
                <li>All orders are Cash on Delivery (COD).</li>
                <li>Payment must be made in full upon receiving the order.</li>
            </ul>

            <h2>4. Subscription Service</h2>
            <ul>
                <li>Drovo operates on a subscription model, allowing users to schedule recurring orders.</li>
                <li>Subscriptions can be paused, modified, or canceled at any time without penalties.</li>
            </ul>

            <h2>5. Cancellation and Refunds</h2>
            <ul>
                <li>Orders can be canceled before they are dispatched.</li>
                <li>Refunds for any canceled or incorrect orders will be processed within 3–7 business days.</li>
            </ul>

            <h2>6. Product Quality</h2>
            <ul>
                <li>Drovo ensures the quality and freshness of all products.</li>
                <li>If you experience any issues with the delivered items, report them within 24 hours for assistance or a refund.</li>
            </ul>

            <h2>7. User Responsibilities</h2>
            <ul>
                <li>Users must ensure timely payment for COD orders.</li>
                <li>Repeated refusal to accept deliveries or non-payment may result in account suspension.</li>
            </ul>

            <h2>8. Privacy and Data Use</h2>
            <ul>
                <li>Drovo collects and uses your personal data to facilitate orders and improve services.</li>
                <li>Your information is handled securely and in compliance with our Privacy Policy.</li>
            </ul>

            <h2>9. Limitation of Liability</h2>
            <ul>
                <li>Drovo is not liable for delays caused by external factors (e.g., weather, traffic).</li>
                <li>In case of disputes, Drovo’s liability is limited to the value of the order.</li>
            </ul>

            <h2>10. Amendments</h2>
            <ul>
                <li>Drovo reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.</li>
            </ul>

            <p>
                Thank you for choosing Drovo! If you have questions or need support, contact us at <a href="mailto:drovo499@gmail.com">drovo499@gmail.com</a>.
            </p>
        </div>
    );
};

export default TermsAndConditions;
