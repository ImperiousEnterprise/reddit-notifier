const { User } = require('../models/users');
const { handleErrors, AppError } = require('../lib/errors');

/**
 * Stores a new product into the database.
 * @param {Object} product product object to create.
 * @throws {Error} If the product is not provided.
 */
module.exports.create = async (user) => {

    let u = new User(user);
    let err = await u.save().catch(e=>{
        //If code exits its a mongodb error and not mongoose
        if(e.code){
            return handleErrors({duplicate: {message:"Username/Email already exists"}})
        }else{
            return handleErrors(e.errors);
        }
    });

    if (err){
       return err;
    }
    return u;
}

module.exports.getById = async (id) =>{
    let u = await User.findOne({ _id: id }).catch(e=> {return  e.path ?
            handleErrors({user: {message:"This user does not exist"}}):
            handleErrors(e.errors);});

    if(u == null){
        return handleErrors({user: {message:"This user does not exist"}})
    }else if(u instanceof AppError){
        return u;
    }
    await u.populate("subreddits","-__v -follower").execPopulate();
    return u;
}

module.exports.addSubreddit = async (id, subreddit_id) => {

    let u = await User.findOne({ _id: id }).exec()
        .catch(e =>{
            return  e.path ?
                handleErrors({user: {message:"This user does not exist"}}):
                handleErrors(e.errors);
        });

    if(u instanceof AppError){
        return u;
    }

    if(u.subreddits.includes(subreddit_id)){
        return handleErrors({subreddit: {message:"Your already following this subreddit"}})
    }
    let err;
    u.subreddit_count += 1;
    u.subreddits.push(subreddit_id);
    await u.populate("subreddits","-_id -__v -follower -topPosts").execPopulate();
    await u.save().then(user => u = user).catch( e => err= handleErrors(e.errors));


    if (err){
        return err;
    }
    //removing subreddit_count from returned results
    delete u.subreddit_count;
    return u;
}
module.exports.removeSubreddit = async (id, subreddit_id) => {

    let u = await User.findOne({ _id: id }).exec().catch(e =>{
       return  e.path ?
            handleErrors({user: {message:"This user does not exist"}}):
            handleErrors(e.errors);
    });

    if(u instanceof AppError){
        return u;
    }

    if(!u.subreddits.includes(subreddit_id)){
        return handleErrors({subreddit: {message:"You were never following this subreddit"}})
    }
    u.subreddit_count -= 1;
    u.subreddits.pull({ _id: subreddit_id });
    u = await u.save().catch( e => {return handleErrors(e.errors);});
    if(u instanceof AppError){
        return u;
    }
    await u.populate("subreddits","-_id -__v -follower -topPosts").execPopulate();
    return u;
}

module.exports.updateNotification = async (id, notification) => {
    let u = await User.findOneAndUpdate({ _id: id}, { notifications: notification },
        { new: true }).catch(e => {
            return e.path ?  handleErrors({user: {message:"This user does not exist"}}):
            handleErrors(e)});

    return u;
}

module.exports.getByUsername = async (username) => {
    let u = await User.findOne({ username: username.toLowerCase() }).exec()
        .then(async (user) => {
            if(user){
                await user.populate("subreddits","-__v -follower").execPopulate();
                return { id: user._id, username: user.username, notifications: user.notifications, subreddits: user.subreddits}
            }else{
                return handleErrors({user: {message:"This user does not exist"}} );
            }
        })
        .catch( err =>{ return handleErrors(err.errors)});
    return u;
}

module.exports.getAll = async () => {
    let u = await User.find({}).then(user => user.map(u => u.username_original)).catch(e => handleErrors(e.errors));
    return u;
}
module.exports.getAllwithNotificationEnabled = getAllwithNotificationEnabled = async () =>{
    let u;
   await User.find({ subreddit_count:{  $gte : 1 } , notifications: true })
       .populate("subreddits","-_id -__v -follower").exec().then(user => u = user).catch(err => u = handleErrors(err));
   return u;
}