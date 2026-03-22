let mongoose = require('mongoose')

let reservationItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    }
}, { _id: false })

let reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    items: [reservationItemSchema],
    status: {
        type: String,
        enum: ['pending', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('reservation', reservationSchema)
