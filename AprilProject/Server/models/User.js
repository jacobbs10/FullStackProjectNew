const mongoose = require('mongoose');
const utvalues = {
    values: ['admin', 'implementer', 'user'],
    message: 'enum validator failed for path `{PATH}` with value `{VALUE}`'
  }
const userSchema = new mongoose.Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true},
    usertype: {type: String, enum: utvalues, required: true},
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    birthdate: { type: Date, required: true },
    preferences: {
        pagesize: { 
            type: Number,
            default: 12        // Optional: sets a default value
        }
    }
 });
module.exports = mongoose.model('User', userSchema);