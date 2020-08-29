const { Subreddit } = require('../models/subreddits');
const { Token } = require('../models/token');
const { handleErrors, handleRedditErrors,AppError } = require('../lib/errors');
const { validateSubreddit, fetchSubRedditTopData } = require('../lib/reddit');

/**
 * Stores a new product into the database.
 * @param {Object} product product object to create.
 * @throws {Error} If the product is not provided.
 */
module.exports.get = get = async (name) => {
    let subreddit;
    //Check db first for subreddit
    let err = await Subreddit.findOne({ name: name }, function (err, sub) {
        if (err) return handleErrors(err.errors);
        subreddit = sub;
    });

    if(err){
        return err;
    }else if(subreddit){
        return subreddit;
    }

    //subreddit not in mongo so will verify if exists on reddit
    if (err == null){
        let token = await grabToken();
        let validated = await validateSubreddit(token,name);
        if(validated.names){
           let newSubreddit = new Subreddit({name : name});
           await save(newSubreddit);
           if(newSubreddit instanceof AppError){
               return newSubreddit;
           }
           subreddit = newSubreddit;
        }else{
           return handleRedditErrors(validated);
        }
    }

    return subreddit;
}

module.exports.grabToken = grabToken = async ()=>{
    let t = await Token.findOne({}, {}, { sort: { 'created_at' : -1 } });
    return t.token;
}

module.exports.remove = remove = async (id) => {
   await Subreddit.deleteOne({ _id: id }, function (err) {
        if(err) return handleErrors(err.errors);
    });
}
module.exports.save = save = async (subreddit) => {
    let sub;
    sub = await subreddit.save().catch(e => {
        return e.code ?
            handleErrors({subreddit: {message:"Subreddit already exists"}} ):
            handleErrors(e.errors)});
    return sub;
}

module.exports.updateSubreddit = updateSubreddit = async (subreddit) => {
    let token = await grabToken();
    let b = await fetchSubRedditTopData(subreddit.name,token);
   b.data.children.forEach((e,index,topPosts) =>{ topPosts[index]={title: e.data.title, picture: e.data.thumbnail? e.data.thumbnail: null, upvotes: e.data.ups};});
   subreddit.topPosts = b.data.children;
    subreddit = await save(subreddit);
    return subreddit;
}
module.exports.getAllSubreddits = getAllSubreddits = async () => {
   let sub = await Subreddit.find({});
   return sub;
}