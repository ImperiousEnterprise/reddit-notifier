const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = mongoose.SchemaTypes
const subreddits = require('./subreddits');

/**
 * Users model schema.
 */
const userSchema = Schema({
    username_displayed:{
        type: String,
    },
    username: {
        type: String,
        required: [true, "Provide a Username"],
        minlength: [4, 'Username needs to be more than 4 characters'],
        maxlength: [30, 'Username cannot be more than 30 characters'],
        unique: [true, "Username is already taken"],
        lowercase: true },
    email: {
        type: String,
        required: [true, "Provide an Email"],
        unique:true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    subreddit_count: {
        type:Number,
        default: 0
    },
    subreddits: [{
        type: Types.ObjectID,
        ref: "Subreddit"
    }],
    notifications: {type: Boolean, default: true}
});

module.exports.User = mongoose.model('User', userSchema);