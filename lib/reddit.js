const fetch = require('node-fetch');

const REDDIT_ACCESS_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token'
const APP_ONLY_GRANT_TYPE = 'https://oauth.reddit.com/grants/installed_client'

module.exports.getRedditToken = async (clientId) => {
    try {
        // Creating Body for the POST request which are URL encoded
        const params = new URLSearchParams()
        params.append('grant_type', APP_ONLY_GRANT_TYPE)
        params.append('device_id', 'DO_NOT_TRACK_THIS_DEVICE')

        // Trigger POST to get the access token
        const tokenData = await fetch(REDDIT_ACCESS_TOKEN_URL, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:`).toString('base64')}` // Put password as empty
            }
        }).then(res => res.json());

        if (!tokenData.error) {
            return tokenData.access_token
        }
        // Handling OAuth error
    } catch (error) {
        console.log(error);
        return error;
    }
}

module.exports.validateSubreddit = (accessToken, subreddit) => {
    return fetch(`https://oauth.reddit.com/api/search_reddit_names?`+new URLSearchParams({
        query: subreddit,
        exact: true,
        include_unadvertisable: true
    }), {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(data => data.json());
}

module.exports.fetchSubRedditTopData = (sub, accessToken) =>
    fetch(`https://oauth.reddit.com/r/${sub}/top?`+new URLSearchParams({
        t: 'day',
        limit: 3
    }), {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(data => data.json()).catch(e => console.log(e));