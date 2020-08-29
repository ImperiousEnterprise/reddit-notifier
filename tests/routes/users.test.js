const mongoose = require('mongoose');
const dbHandler = require('../../lib/inmemorydb');
const request = require("supertest");
const app = require("../../app");
const {getRedditToken}  = require('../../lib/reddit');
require('dotenv').config();
const { REDDIT_CLIENT_ID } = process.env;
const { Token } = require('../../models/token');

var token;

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
afterAll(async () => {await dbHandler.closeDatabase()});

describe("Test users path", () => {
    beforeEach(async () =>{
        let t = new Token({token: token});
        await t.save();
    });
    it("should return list of users",  async () => {
        let res = await request(app).get("/users");
        expect(res.statusCode).toBe(200);
    });

    it("create user ",  async () => {
        let res = await request(app).post("/signup")
            .send({username: 'femi', email: 'femi@yahoo.com'})
            .set('Accept', 'application/json');
        expect(res.statusCode).toBe(201);
    });

    it("create user with bad params ",  async () => {
        let res = await request(app).post("/signup")
            .send({username: '', email: 'fe@yahoo.com'})
            .set('Accept', 'application/json');
        expect(res.statusCode).toBe(400);
    });

    it("get user by id ",  async () => {
        let res = await request(app).post("/signup")
            .send({username: 'femi', email: 'femi@yahoo.com'})
            .set('Accept', 'application/json');
        res = JSON.parse(res.text);
        let resp = await request(app).get("/users?id="+res._id);
        let resp_json = JSON.parse(resp.text);
        expect(resp_json._id).toBe(res._id);
        expect(resp.statusCode).toBe(200);
    });

    it("fetch nonexist user by id ",  async () => {
        let resp = await request(app).get("/users?id="+12354);
        expect(resp.statusCode).toBe(400);
    });

    it("get user by username ",  async () => {
        let res = await request(app).post("/signup")
            .send({username: 'femi', email: 'femi@yahoo.com'})
            .set('Accept', 'application/json');
        let res_json = JSON.parse(res.text);
        let resp = await request(app).get("/users?username="+res_json.username);
        let resp_json = JSON.parse(resp.text);
        expect(resp_json._id).toBe(res_json.id);
        expect(resp.statusCode).toBe(200);
    });

    it("fetch nonexist user by username ",  async () => {
        let resp = await request(app).get("/users?username="+"femi");
        expect(resp.statusCode).toBe(400);
    });

    it("add subreddit for user ",  async () => {
        let res = await request(app).post("/signup")
            .send({username: 'femi', email: 'femi@yahoo.com'})
            .set('Accept', 'application/json');
        let res_json = JSON.parse(res.text);
        let resp = await request(app)
            .put("/users/"+res_json._id + "/subreddit")
            .send({name: 'popular'})
            .set('Accept', 'application/json');
        let resp_json = JSON.parse(resp.text);
        expect(resp.statusCode).toBe(200);
    });

    it("add nonexistant subreddit to user ",  async () => {
        let res = await request(app).post("/signup")
            .send({username: 'femi', email: 'femi@yahoo.com'})
            .set('Accept', 'application/json');
        let res_json = JSON.parse(res.text);
        let resp = await request(app)
            .put("/users/"+res_json._id + "/subreddit")
            .send({name: 'adfasdfasvsd'})
            .set('Accept', 'application/json');
        expect(resp.statusCode).toBe(400);
    });

    it("remove subreddit from user ",  async () => {
        let res = await request(app).post("/signup")
            .send({username: 'femi', email: 'femi@yahoo.com'})
            .set('Accept', 'application/json');
        let res_json = JSON.parse(res.text);
        await request(app)
            .put("/users/"+res_json._id + "/subreddit")
            .send({name: 'popular'})
            .set('Accept', 'application/json');
       let resp = await request(app)
            .delete("/users/"+res_json._id + "/subreddit")
            .send({name: 'popular'})
            .set('Accept', 'application/json');
        expect(resp.statusCode).toBe(200);
    });

    it("turn off notification for user ",  async () => {
        let res = await request(app).post("/signup")
            .send({username: 'femi', email: 'femi@yahoo.com'})
            .set('Accept', 'application/json');
        let res_json = JSON.parse(res.text);
        let resp = await request(app)
            .put("/users/"+res_json._id + "/notifications")
            .send({notification: false})
            .set('Accept', 'application/json');
        let resp_json = JSON.parse(resp.text);
        expect(resp_json.notification).toBeFalsy();
        expect(resp.statusCode).toBe(200);
    });

    it("turn on notification for user",  async () => {
        let res = await request(app).post("/signup")
            .send({username: 'femi', email: 'femi@yahoo.com'})
            .set('Accept', 'application/json');
        let res_json = JSON.parse(res.text);
        await request(app)
            .put("/users/"+res_json._id + "/notifications")
            .send({notification: false})
            .set('Accept', 'application/json');
        let resp = await request(app)
            .put("/users/"+res_json._id + "/notifications")
            .send({notification: true})
            .set('Accept', 'application/json');
        let resp_json = JSON.parse(resp.text);
        expect(resp_json.notifications).toBeTruthy();
        expect(resp.statusCode).toBe(200);
    });
});