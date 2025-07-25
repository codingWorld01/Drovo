import mongoose from "mongoose"


const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    shopId: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: "Food Processing"
    },
    date: {
        type: Date,
        default: Date.now()
    },
    deliveryCharge: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Online"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    },
    paymentDetails: {
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        paymentDate: { type: Date },
        platformCommission: { type: Number }
    }
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;