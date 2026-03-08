const mongoose = require('mongoose');

const schemaProduct = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title la bat buoc']
    },
    slug: {
        type: String,
        required: [true, 'Slug la bat buoc']
    },
    price: {
        type: Number,
        required: [true, 'Price la bat buoc'],
        min: [0, 'Price phai lon hon hoac bang 0']
    },
    description: {
        type: String,
        required: [true, 'Description la bat buoc']
    },
    category: {
        type: String,
        default: ""
    },
    images: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8N7qdG-B9FW47yJaKEKCDpidao3fC1raDbpgldxW-Vr47N8vOGMdT6NrFib3y_QGyLZICFQdatPcNA2TDKw&s&ec=121516180"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('product', schemaProduct);