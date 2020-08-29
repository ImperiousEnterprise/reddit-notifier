var express = require('express');
var router = express.Router();
const userService = require('../services/users');
const subredditService = require('../services/subreddits');
const { AppError } = require('../lib/errors');
const { generateEmailTemplate,sendEmail } = require('../lib/email');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let user;
  if(req.query.username){
    user = await userService.getByUsername(req.query.username);
    if(user instanceof AppError){
      return res.status(400).send(user);
    }
  }else if(req.query.id){
    user = await userService.getById(req.query.id);
    if(user instanceof AppError){
      return res.status(400).send(user);
    }
  }else {
    user = await userService.getAll()
  }

  res.status(200).send(user);
});

router.put('/:id/subreddit', async function(req, res, next){
  let subreddit = await subredditService.get(req.body.name);
  if(subreddit instanceof AppError){
    return res.status(400).send(subreddit);
  }

  let u = await userService.addSubreddit(req.params.id, subreddit._id);

  if(u instanceof AppError){
    return res.status(400).send(u);
  }

  subreddit.follower +=1;
  await subreddit.save();

  res.send(u);

});
router.delete('/:id/subreddit', async function(req, res, next){
  let subreddit = await subredditService.get(req.body.name);
  if(subreddit instanceof AppError){
    return res.status(400).send(subreddit);
  }

  subreddit.follower -=1;
  if(subreddit.follower === 0){
    await subredditService.remove(subreddit._id);
  }else{
    await subredditService.save(subreddit);
  }

  let u = await userService.removeSubreddit(req.params.id, subreddit._id);

  if(u instanceof AppError){
    return res.status(400).send(u);
  }
  res.send(u);
});
router.put('/:id/notifications', async function(req, res, next){
  let u = await userService.updateNotification(req.params.id, req.body.notification);
  if(u instanceof AppError){
    return res.status(400).send(u);
  }
  res.status(200).send(u);
});


router.get('/:id/notes', async function(req, res, next){
  let u = await userService.getById(req.params.id)
  if(u instanceof AppError){
   return res.status(400).send(u);
  }

  await subredditService.updateSubreddit(u.subreddits[0])
  //await subredditService.updateSubreddit(u.subreddits[1])
  let m = await generateEmailTemplate(u);
  await sendEmail(u.email,m);
  res.status(200).send(u);
});

module.exports = router;
