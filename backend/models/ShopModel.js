import mongoose from "mongoose"

const ShopSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // required: true
    },
    shopAddress: {
        address: { type: String },
        latitude: { type: String },
        longitude: { type: String }
    },
    phone: {
        type: String
    },
    subscription: {
        type: String,
        enum: ['99', '149', '299', '599'],
    },
    subEndDate: {
        type: Date
    },
    isSetupComplete: {
        type: Boolean,
        default: false
    },
    shopImage: {
        type: String
    },
    paymentDetails: {
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        paymentDate: { type: Date },
    },

    bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  
  razorpayAccountId: { type: String },

});

const Shop = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);

export default Shop;
