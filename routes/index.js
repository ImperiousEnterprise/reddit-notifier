var express = require('express');
var router = express.Router();
const userService = require('../services/users');
const { AppError } = require('../lib/errors');

/* GET home page. */
router.post('/signup', async function(req, res, next) {

  let userToCreate = {
    username_displayed: req.body.username,
    username:req.body.username !== null && req.body.username !== ''? req.body.username.toLowerCase() : null,
    email: req.body.email
  };
  let r = await userService.create(userToCreate);

  if(r instanceof AppError){
    return res.status(400).send(r.errors);
  }

  res.status(201).send(r);

});

module.exports = router;
