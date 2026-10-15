import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email :{
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
            trim:true
        },
        // Wishlist stores references, so Product remains the single source of truth.
        wishlist: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }],
            default: []
        },
        // A cart needs both a Product reference and the chosen quantity.
        cart: {
            type: [{
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    min: 1,
                    default: 1
                }
            }],
            default: []
        }
    },
    {
        timestamps: true
    }
)

const Customer = mongoose.model("Customer", customerSchema)

export default Customer
