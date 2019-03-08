const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../../models/User')
const gravatar = require('gravatar');
const keys = require('../../config/keys');

router.get('/test', (req, res) => res.json({msg: 'Users works'}))

router.post('/register', (req, res) => {
  User.findOne({email: req.body.email})
  .then(user => {
    if(user) {
      return res.status(400).json({email: 'User already exists'});
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', r: 'pg', d: 'mm'
      });
      const {email, password, name} = req.body;

      const newUser = new User({
        email,
        name,
        avatar,
       })
       bcrypt.genSalt(10, (err, salt) => {
         bcrypt.hash(password, salt, (err, hash) => {
          if(err) console.log(err);
          newUser.password = hash;
          newUser.save()
            .then(user => res.json(user))
            .catch(err => console.log(err))
         })
       })
    }
  })
})
router.post('/login', (req, res) => {
  const {email, password} = req.body;
  User.findOne({email})
  .then(user => {
    if(!user) {
      return res.status(404).json({email: 'User not found'});
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if(isMatch) {
        const {id, name, avatar} = user
        const payload = { id: id, name: name, avatar: avatar }
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: `Bearer ${token}`
          })
        })
      } else {
        return res.status(404).json({password: 'password error'});
      }
    })
    .catch(err => console.log(err))
  });
})

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  })
})
module.exports = router;