const mongoose = require('mongoose');

var topPost = new mongoose.Schema({
    title: {type: String},
    picture: {type: String},
    upvotes: {type: Number }
});

var subredditSchema = new mongoose.Schema({
    name:{ type: String,lowercase: true, unique: true },
    follower: {type: Number, default: 0},
    topPosts: [topPost]
});

module.exports.Subreddit = mongoose.model('Subreddit', subredditSchema);