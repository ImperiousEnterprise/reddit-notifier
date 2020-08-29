
const mongoose = require('mongoose');
const dbHandler = require('../../lib/inmemorydb');
const userService = require('../../services/users');
const subredditService = require('../../services/subreddits');
const { Subreddit } = require('../../models/subreddits');
const { Token } = require('../../models/token');
const { AppError } = require('../../lib/errors');
const {getRedditToken}  = require('../../lib/reddit');
require('dotenv').config();
const { REDDIT_CLIENT_ID } = process.env;

/**
 * Complete product example.
 */
const userPerfect = {
    username: 'Femi',
    email: 'femi@yahoo.com'
};
const userPerfectTwo = {
    username: 'Temi',
    email: 'Temi@yahoo.com'
};
const userBad = {
    username: '',
    email: 'femi@yahoo.com'
};
const subreddits = ["tokyo","worldnews"];
const nonexistant_subreddits = "bakalkdlajdlksadkfsl";
var token = null;
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => { await dbHandler.connect();
    token = await getRedditToken(REDDIT_CLIENT_ID);
});

/**
 * Clear all test data after every test.
 */
afterEach(async () => {await dbHandler.clearDatabase();});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {await dbHandler.closeDatabase();});

describe('subreddits', ()=>{
    beforeEach(async () =>{
        let t = new Token({token: token});
        await t.save();
    });

    it('can be fetched and verified by reddit api',async ()=>{
        let sub = await subredditService.get(subreddits[0]);
        expect(sub.name).toStrictEqual(subreddits[0]);
    });

    it('that are nonexistant cannot be saved',async ()=>{
        let sub = await subredditService.get(nonexistant_subreddits);
        expect(sub).toBeInstanceOf(AppError);
    });

    it('can be saved',async ()=>{
        let s = new Subreddit({name: subreddits[0]})
        await subredditService.save(s);
        let total = await subredditService.getAllSubreddits();
        expect(total[0].name).toStrictEqual(subreddits[0]);
    });

    it('can all be fetched',async ()=>{
        let s = new Subreddit({name: subreddits[0]});
        let s1 = new Subreddit({name: subreddits[1]});
        await subredditService.save(s);
        await subredditService.save(s1);

        let total = await subredditService.getAllSubreddits();
        expect(total.length).toStrictEqual(2);
    });

    it('that are duplicates cannot be saved',async ()=>{
        let s = new Subreddit({name: subreddits[0]});
        let s1 = new Subreddit({name : subreddits[0]});
        await subredditService.save(s);
        s1 = await subredditService.save(s1);

        expect(s1).toBeInstanceOf(AppError);
    });

    it('can be removed',async ()=>{
        let s = new Subreddit({name: subreddits[0]});
        s =  await subredditService.save(s);
        await subredditService.remove(s._id);
        let total = await subredditService.getAllSubreddits();
        expect(total.length).toStrictEqual(0);
    });

    it('can be updated',async ()=>{
        let s = new Subreddit({name: subreddits[0]});
        s = await subredditService.updateSubreddit(s);
        expect(s.topPosts.length).toBeGreaterThan(0);
    });

});