
const mongoose = require('mongoose');
const dbHandler = require('../../lib/inmemorydb');
const userService = require('../../services/users');
const subredditService = require('../../services/subreddits');
const { User } = require('../../models/users');
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

/**
 * Product test suite.
 */
describe('users ', () => {
    //afterEach(async () => {await dbHandler.clearDatabase();console.log("2-aftereach");});
    /**
     * Tests that a valid product can be created through the productService without throwing any errors.
     */
    it('can be created correctly', async () => {
        let u =await userService.create(userPerfect);
        expect(u).toBeInstanceOf(User);
    });
    it('can not be created incorrectly', async () => {
        let u =await userService.create(userBad);
        expect(u).toBeInstanceOf(AppError);
    });

    it('can all be fetched', async () =>{
        await userService.create(userPerfect);
        await userService.create(userPerfectTwo);
        let u = await userService.getAll();
        expect(u.length).toBe(2);
    });

    it('can all be fetched by Id', async () =>{
        let u = await userService.create(userPerfect);
        let id = u._id;
        u = await userService.getById(u._id);
        expect(u._id).toStrictEqual(id);
    });

    it('can all be fetched by Username', async () =>{
        let u = await userService.create(userPerfect);
        let username = u.username;
        u = await userService.getByUsername(u.username);
        expect(u.username).toBe(username);
    });

    it('who are non existant cannot be fetched by Username', async () =>{
        let u = await userService.getByUsername("test");
        expect(u).toBeInstanceOf(AppError);
    });

    it('who are non existant cannot be fetched by Id', async () =>{
        let u = await userService.getById(12345);
        expect(u).toBeInstanceOf(AppError);
    });


    describe('subreddits', () => {

        beforeEach(async () =>{
            let t = new Token({token: token});
            await t.save();
        });

        it('can add', async () => {
            let token = await subredditService.grabToken()
            let u = await userService.create(userPerfect);
            let sub = await subredditService.get(subreddits[0]);
            u = await userService.addSubreddit(u._id,sub._id);
            expect(u.subreddits[0].name).toBe(subreddits[0]);
        });

        it('can not add an already followed subreddit', async () => {
            let u = await userService.create(userPerfect);
            let sub = await subredditService.get(subreddits[0]);
            u = await userService.addSubreddit(u._id,sub._id);
            u = await userService.addSubreddit(u._id,sub._id);
            expect(u).toBeInstanceOf(AppError);
        });

        it('non existant user cannot add', async () => {
            let sub = await subredditService.get(subreddits[0]);
            let u = await userService.addSubreddit(12345,sub._id);
            expect(u).toBeInstanceOf(AppError);
        });

        it('can remove', async () => {
            let u = await userService.create(userPerfect);
            let sub = await subredditService.get(subreddits[0]);
            u = await userService.addSubreddit(u._id,sub._id);
            u = await userService.removeSubreddit(u._id,sub._id);
            expect(u.subreddits.length).toBe(0);
        });
        it('non followed cannot be removed', async () => {
            let u = await userService.create(userPerfect);
            let sub = await subredditService.get(subreddits[0]);
            u = await userService.removeSubreddit(u._id,sub._id);
            expect(u).toBeInstanceOf(AppError);
        });

        it('non existant user cannot remove', async () => {
            let sub = await subredditService.get(subreddits[0]);
            let u = await userService.removeSubreddit(12345,sub._id);
            expect(u).toBeInstanceOf(AppError);
        });

    });
    describe('notifications', () => {
        it('can be turned off', async () => {
            let u = await userService.create(userPerfect);
            u = await userService.updateNotification(u._id,false);
            expect(u.notifications).toBe(false);
        });

        it('can be turned off and turned back on', async () => {
            let u = await userService.create(userPerfect);
            u = await userService.updateNotification(u._id,false);
            expect(u.notifications).toBe(false);
            u = await userService.updateNotification(u._id,true);
            expect(u.notifications).toBe(true);
        });

        it('can no be updated for non existant user', async () => {
            let u = await userService.updateNotification(12345,false);
            expect(u).toBeInstanceOf(AppError);
        });
    });

});
