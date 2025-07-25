import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import cloudinary from 'cloudinary';
import Shop from '../models/ShopModel.js';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new order for subscription
const shopPayment = async (req, res) => {
  const { amount, token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized request' });
  }

  try {
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error while creating order' });
  }
};

// Create Razorpay linked account using fetch API
const createLinkedAccountWithFetch = async (shop) => {
  try {
    const accountDetails = {
      email: shop.email,
      phone: shop.phone,
      type: "route", // Required parameter
      legal_business_name: shop.name,
      business_type: "individual", // or "partnership", "private_limited", etc.
      customer_facing_business_name: shop.name,
      contact_name: shop.name, // Required parameter
      reference_id: `shop_${Date.now()}`, // Optional but recommended
      profile: {
        category: "healthcare",
        subcategory: "clinic",
        addresses: {
          registered: {
            street1: shop.address || "Business Address",
            street2: "Laxmi Nagar",
            city: "Nagpur", // Update based on your location
            state: "MAHARASHTRA",
            postal_code: "440001", // Update based on actual postal code
            country: "IN"
          }
        }
      },
      legal_info: {
        // These are typically required for KYC
        pan: "AAACL1234C", // You'll need actual PAN
        gst: "" // GST number if available
      }
    };

    // Create base64 encoded credentials
    const credentials = btoa(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`);

    console.log('Creating linked account with details:', accountDetails);

    const response = await fetch('https://api.razorpay.com/v2/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(accountDetails)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Razorpay API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      // Handle specific error cases
      if (response.status === 400) {
        const errorDesc = responseData.error?.description || 'Bad Request';

        if (errorDesc.includes('Route feature not enabled') ||
          errorDesc.includes('Marketplace feature is not enabled')) {
          throw new Error('Razorpay Route/Marketplace feature is not enabled. Please contact Razorpay support to enable this feature.');
        } else if (errorDesc.includes('Access Denied')) {
          throw new Error('Access denied. Please ensure your Razorpay account has marketplace permissions enabled.');
        } else if (errorDesc.includes('Invalid category')) {
          throw new Error('Invalid business category. Please check the category and subcategory values.');
        } else if (errorDesc.includes('email already exists')) {
          throw new Error('An account with this email already exists.');
        }
      }

      throw new Error(`Failed to create linked account: ${responseData.error?.description || response.statusText}`);
    }

    console.log('Linked account created successfully:', responseData.id);
    return responseData.id;

  } catch (error) {
    console.error('Error creating Razorpay linked account:', error);
    throw error;
  }
};



// Verify payment and update shop
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    name,
    address,
    email,
    phone,
    subscription,
    latitude,
    longitude,
    shopImage,
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment details' });
  }

  try {
    // Verify payment signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Find shop by email
    const shop = await Shop.findOne({ email });
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    // Create Razorpay linked account
    let razorpayAccountId = null;
    razorpayAccountId = await createLinkedAccountWithFetch({
      name,
      email,
      phone,
      bankDetails: { accountHolderName, accountNumber, ifscCode, bankName }
    });

    // Upload shop image to Cloudinary if provided
    let imageUrl = shop.shopImage;
    if (shopImage) {
      // Delete old image if it exists
      if (shop.shopImage) {
        try {
          const urlParts = shop.shopImage.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          if (uploadIndex === -1) throw new Error("Invalid Cloudinary URL");
          const versionIndex = urlParts[uploadIndex + 1].startsWith('v') ? uploadIndex + 2 : uploadIndex + 1;
          const publicId = urlParts.slice(versionIndex).join('/').split('.')[0];
          await cloudinary.v2.uploader.destroy(`drovo/shop/${publicId}`);
        } catch (error) {
          console.warn("Failed to delete old shop image from Cloudinary:", error.message);
        }
      }
      // Upload new image
      const result = await cloudinary.v2.uploader.upload(shopImage, {
        folder: `drovo/shop`,
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto', dpr: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
      imageUrl = result.secure_url;
    }

    // Map subscription plan to days
    const durationMapping = {
      '99': 15,
      '149': 30,
      '299': 90,
      '599': 180,
    };

    let subscriptionDays = durationMapping[subscription];
    if (!subscriptionDays) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
    }

    let subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + subscriptionDays);

    // Update shop
    const updateData = {
      name,
      shopAddress: {
        address,
        latitude,
        longitude
      },
      phone,
      subscription,
      subEndDate: subscriptionEndDate,
      isSetupComplete: true,
      paymentDetails: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentDate: new Date(),
      },
      shopImage: imageUrl,
      bankDetails: {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName
      },
      ...(razorpayAccountId && { razorpayAccountId }) // Only add if creation was successful
    };

    const updatedShop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and shop setup completed.',
      shop: updatedShop,
      ...(razorpayAccountId && { razorpayAccountId }) // Include in response if created
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Server error while verifying payment' });
  }
};

// Create a new order for subscription renewal
const createRenewalOrder = async (req, res) => {
  const { amount, token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized request' });
  }

  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `renewal_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error creating renewal order:', error);
    res.status(500).json({ success: false, message: 'Server error while creating renewal order' });
  }
};

// Verify the payment for subscription renewal
const verifyRenewalPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, subscription } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment details' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const shopId = decodedToken.id;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({ success: false, message: "Shop not found" });
      }

      const durationMapping = {
        '99': 15,
        '149': 30,
        '299': 90,
        '599': 180,
      };

      let subscriptionDays = durationMapping[subscription];
      if (!subscriptionDays) {
        return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
      }

      let newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + subscriptionDays);

      const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        {
          subscription,
          subEndDate: newEndDate,
          paymentDetails: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            paymentDate: new Date(),
          },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Subscription renewed successfully.',
        shop: updatedShop,
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Error verifying renewal payment:', error);
    res.status(500).json({ success: false, message: 'Server error while verifying renewal payment' });
  }
};

export { shopPayment, verifyPayment, createRenewalOrder, verifyRenewalPayment };