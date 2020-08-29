const mongoose = require('mongoose');

var tokenSchema = new mongoose.Schema({
    token:{ type: String},
}, { timestamps: { createdAt: 'created_at' } });

module.exports.Token = mongoose.model('Token', tokenSchema);