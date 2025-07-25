# Drovo - Food Delivery Platform

## Overview
Drovo is a full-stack web application designed for food delivery, connecting users with local shops. Users can browse shops, order food, and manage carts, while shop administrators handle inventory, orders, and subscriptions. Built with a modern tech stack, Drovo offers a seamless, secure, and responsive experience with features like dynamic delivery charges, direct shopkeeper payments, and a chatbot for user support.

## Features
- **User Features**:
  - Browse shops and food items by category.
  - Add items to cart and place orders with dynamic delivery charges based on shop-user distance (via Google Maps API).
  - Secure authentication with JWT and Google OAuth.
  - Track orders, provide feedback, and receive notifications via email and WhatsApp.
  - Interact with a chatbot for order assistance and support.
- **Shop Admin Features**:
  - Manage shop profiles, food inventory, and order statuses.
  - Receive direct order payouts via Razorpay Route, with some platform commission retained.
  - Renew subscriptions to maintain active shop listings.
- **General Features**:
  - Responsive UI with React Router and Context API for state management.
  - Image storage and optimization using Cloudinary.
  - Automated notifications using Nodemailer (email) and Twilio (WhatsApp).

## Technologies Used
- **Frontend**: React.js, React Router, Context API, Axios, JavaScript, HTML, CSS
- **Backend**: Express.js, Node.js, MongoDB, Mongoose, RESTful APIs
- **Authentication**: JWT, Google OAuth
- **Payment Integration**: Razorpay (Route)
- **APIs and Services**: Google Maps API, Nodemailer, Twilio (WhatsApp), Cloudinary
- **Other**: Chatbot, CORS, dotenv, Git

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Accounts for:
  - Razorpay (for payment integration)
  - Cloudinary (for image storage)
  - Google Cloud (for Maps API and OAuth)
  - Twilio (for WhatsApp messaging)
  - Gmail (for Nodemailer)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/drovo.git
cd drovo
```

### 2. Install Dependencies
For both frontend and backend:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=4000
URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
EMAIL_USER=<your-gmail-address>
EMAIL_PASS=<your-gmail-app-password>
TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>
```

### 4. Run the Application
- **Backend**:
  ```bash
  cd backend
  npm start
  ```
  The server will run on `http://localhost:4000`.

- **Frontend**:
  ```bash
  cd frontend
  npm start
  ```
  The client will run on `http://localhost:3000`.

### 5. Test the Application
- Access the app in your browser at `http://localhost:3000`.
- Register as a user or shop admin to explore features.
- Use test credentials for Razorpay in development mode (refer to Razorpay documentation).

## Project Structure
```
drovo/
├── backend/
│   ├── config/           # Database connection
│   ├── controllers/      # Business logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Authentication middleware
│   └── index.js          # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context for state
│   │   └── App.js        # Main React component
└── README.md
```

## API Endpoints
- **User**: `/api/register`, `/api/login`, `/api/login/google`, `/api/send-otp`, `/api/verify-otp`
- **Shop**: `/api/shops/all`, `/api/shops/details`, `/api/shops/:shopId`
- **Food**: `/api/food/add`, `/api/food/edit/:id`, `/api/food/list/:shopId`, `/api/food/remove`
- **Cart**: `/api/cart/add`, `/api/cart/remove`, `/api/cart/get`
- **Order**: `/api/order/place`, `/api/order/verify`, `/api/order/userorders`, `/api/order/list`
- **Payment**: `/api/payment/create-order`, `/api/payment/verify`, `/api/payment/createRenewalOrder`

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License.

## Contact
For inquiries, reach out to [yatharthaurangpure01@gmail.com].