const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const gravatar = require('gravatar');
const keys = require('../../config/keys');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


const User = require('../../models/User')

router.get('/test', (req, res) => res.json({msg: 'Users works'}))

router.post('/register', (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const {email} = req.body;
  User.findOne({email}).then(user => {
    if(user) {
      errors.email = 'User already exists';
      return res.status(400).json(errors);
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
  const {errors, isValid} = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const {email, password} = req.body;
  User.findOne({email})
  .then(user => {
    if(!user) {
      errors.email = 'User not found';
      return res.status(404).json(errors);
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
        errors.password = 'Password error';
        return res.status(404).json(errors);
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