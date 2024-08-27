import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

let validations = (type, extras) => {
  return {
    type,
    ...extras,
  };
};

const OrderSchema = new mongoose.Schema({
  billingDetails: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    postcode: { type: String, required: true },
    email: { type: String, required: true },
  },
  orderno: {
    type: String,
    default: () => `Claws${uuidv4()}`, // Prefix with "Claws" and generate a UUID
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 6); // Set delivery date to 6 days after the current date
      return date;
    },
  },
  paymentMethod: { type: String, required: true },
  total: { type: Number, required: true },
  discount: { type: Number, required: true },
  user: { type: String, required: true },
  cartData: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      images: [{ type: String, required: true }],
    },
  ],
},
{
  timestamps: true,
},);

export default mongoose.model("Order", OrderSchema);
