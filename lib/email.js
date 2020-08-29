const Email = require('email-templates');
require('dotenv').config();
const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM } = process.env;
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

module.exports.generateEmailTemplate = generateEmailTemplate = async (user) =>{
    console.log("GENERATING EMAIL TEMPLATE")
    const email = new Email();
    let html;
    await email.render('../emails/reddit/top_posts', {user: user})
        .then(h => html = h)
        .catch(e => console.error(e));
    return html;
}

module.exports.sendEmail = sendEmail = async (user, html) =>{

    const auth = {
        auth: {
            api_key: MAILGUN_API_KEY,
            domain: MAILGUN_DOMAIN
        },
    }

    const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail({
        from: MAILGUN_FROM,
        to: user,
        subject: 'Reddit NewsLetter',
        html: html,
    }, (err, info) => {
        if (err) {
            console.log(`Error: ${err}`);
        }
        else {
            console.log(`Response: ${info}`);
        }
    });
}