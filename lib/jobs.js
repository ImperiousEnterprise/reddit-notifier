const cron = require('node-cron');
const {getRedditToken} = require('./reddit');
const { generateEmailTemplate, sendEmail } = require('./email')
const { REDDIT_CLIENT_ID,REDDIT_REFRESH_TOKEN,SEND_TOP_POSTS,GET_TOP_POSTS } = process.env;
const { Token } = require('../models/token');
const subredditService = require('../services/subreddits');
const userService = require('../services/users');

module.exports.reddit_refresh_token = cron.schedule(REDDIT_REFRESH_TOKEN, async () => {
    console.log("Refresh Job Starting");
    let newtoken = await getRedditToken(REDDIT_CLIENT_ID);
    if (newtoken instanceof String){
        //Delete most recent token
        Token.findOneAndDelete({}, {sort: {_id: -1}})
        //Add newest token
        let t = new Token({token: newtoken});
        await t.save().catch(e => {});
    }
    console.log("Refresh Job Finished");
}, {
    scheduled: false
});

module.exports.get_top_posts = cron.schedule(GET_TOP_POSTS, async () => {
    console.log("Getting Top Post Job Starting");
    await subredditService.getAllSubreddits().then(async (subredditList) => {
        subredditList.forEach( async(sub) =>{
            await subredditService.updateSubreddit(sub);
        });
        console.log("Getting Top Post Job Finished");
    }).catch(e => console.error);
}, {
    scheduled: false
});

module.exports.send_top_posts = cron.schedule(SEND_TOP_POSTS, async () => {
    console.log("Sending Top Posts Job Starting");
    let users = await userService.getAllwithNotificationEnabled().then( async (users) =>{
        users.forEach(async (u) => {
            let html = await generateEmailTemplate(u);
            if(html !== null){
                await sendEmail(u.email,html);
            }
        });
        console.log("Sending Top Posts Job Finished");
    });
}, {
    scheduled: false
});