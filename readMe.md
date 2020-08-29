# Reddit Notifier

The purpose of this project is to create a personalized daily email newsletter at 8 am containing top 3 most voted posts (within the last 24 hours) from our (the user’s) favorite sub-reddit channels.
This app interfaces strictly through api.

The Endpoints are:

```
POST /signup - Sign Up to add user
GET /users - Return list of all users
GET /users?id=<id> - Get user by id
GET /users?username=<username> - Get user by username
PUT /users/<id>/subreddit - User can subscribe to subreddit
DELETE /users/<id>/subreddit - User can unsubscribe from subreddit
PUT /users/<id>/notifications - User can turn on or off email notifications
```

I have chosen to use many PUTs,GETs,and DELETEs because who doesn't love idempotency.
POST here are mainly used just for creation.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Mailgun API_KEY

Mailgun DOMAIN

Reddit Token

NodeJs

### MailGun

An account needs to be created. From there you will need to whitelist email addresses you wish to send emails too.

[Whitelisting Emails](https://help.mailgun.com/hc/en-us/articles/217531258-Authorized-Recipients)

[Where to find your API_KEY](https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials-)

[Where to find Domain](https://i0.wp.com/blog.mailtrap.io/wp-content/uploads/2020/03/Mailgun_sandbox1.png?resize=900%2C470&ssl=1)


[For a good tutorial on Mailgun](https://blog.mailtrap.io/mailgun-sandbox-tutorial/)

At the moment Mailgun allows up to 5 contacts for you to send emails to on their sandbox account.

You will take your API_KEy and Domain and set them as environment variables.

### Reddit

For your reddit token, You will need to create an account. Once logged in. 
Head to [Developers](https://www.reddit.com/prefs/apps). Select create app button, then select the installed app
button since this application uses the App Only Auth. Be sure to set the redirect uri to http://localhost:8080 before
pushing the create app button.

Once your app is created, copy your client id it should be the code located right under the name you designated for your app.

### Installing

A step by step series of examples that tell you how to get a development env running

```
git clone https://github.com/ImperiousEnterprise/reddit-notifier.git
```
```
cd reddit-notifier
```

```
cp .env.example .env
```

```
npm install
```

Be sure to have your .env filled out and examples has be created for you as .env.example


```
npm run start
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

After all node_modules are installed.
```
npm run test
```

## Deployment

At the moment this runs locally. Deployment is possible anywhere that can run a nodejs server.

## Built With

* [Express](https://expressjs.com/) - The web framework used
* [Node-Cron](https://github.com/kelektiv/node-cron) - Job Scheduler
* [Jest](https://jestjs.io/en/) - Testing framework to run tests
* [Mongo InMemory DB](https://github.com/nodkz/mongodb-memory-server) Inmemory db used
## Authors

* **Femi Adeyemi** - *Initial work* - [ImperiousEnterprise](https://github.com/ImperiousEnterprise)



