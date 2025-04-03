const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
    product_id: {type: Number, required: true},
    product_name: {type: String, required: true},
    product_description: {type: String, required: true},
    product_createtion_date: {type: Date, default: Date.now},
    product_update_date: {type: Date},
    product_status: {type: Boolean, required: true},
    current_stock_level: {type: Number, required: true}
}, { collection: 'Products' });
module.exports = mongoose.model('Product', ProductsSchema);