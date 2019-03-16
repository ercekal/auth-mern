const express = require('express');
const router = express.Router();
const passport = require('passport');

const Profile = require('../../models/Profile')

const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

router.get(
  '/',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const errors = {};
    Profile.findOne({user: req.user.id})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.profile = 'No profile for this user'
        return res.status(404).json(errors);
      }
      res.json(profile)
    })
    .catch(err => res.status(404).json(err));
  }
);

router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({handle: req.params.handle})
  .populate('user', ['name', 'avatar'])
  .then(profile => {
    if(!profile) {
      errors.profile = 'No profile for this user'
      return res.status(404).json(errors);
    }
    res.json(profile)
  })
  .catch(err => res.status(404).json({profile: 'There is no profile'}));
})

router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({user: req.params.user_id})
  .populate('user', ['name', 'avatar'])
  .then(profile => {
    if(!profile) {
      errors.profile = 'No profile for this user'
      return res.status(404).json(errors);
    }
    res.json(profile)
  })
  .catch(err => res.status(404).json({profile: 'There is no profile'}));
})

router.get('/all', (req, res) => {
  const errors = {};
  Profile.find()
  .populate('user', ['name', 'avatar'])
  .then(profiles => {
    if(!profiles) {
      errors.profile = 'No profiles'
      return res.status(404).json(errors);
    }
    res.json(profiles)
  })
  .catch(err => res.status(404).json({profile: 'There is no profile'}));
})

router.post(
  '/experience',
  passport.authenticate('jwt', {session: false}), (req, res) => {
  const {errors, isValid} = validateExperienceInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({user: req.user.id})
  .then(profile => {
    const errors = {};
    const {title, company, location, from, to, current, description} = req.body
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    }
    if(profile) {
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile))
    }
  })
})
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({user: req.user.id})
  .then(profile => {
    if(profile) {
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id)
      profile.experience.splice(removeIndex, 1)
      profile.save().then(profile => res.json(profile))
    }
  })
})
router.post(
  '/education',
  passport.authenticate('jwt', {session: false}), (req, res) => {
  const {isValid} = validateEducationInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({user: req.user.id})
  .then(profile => {
    const {school, degree, fieldOfStudy, from, to, current, description} = req.body
    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from: from,
      to: to,
      current: current,
      description: description
    }
    if(profile) {
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile))
    }
  })
})
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({user: req.user.id})
  .then(profile => {
    const {title, company, location, from, to, current, description} = req.body
    if(profile) {
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id)
      profile.education.splice(removeIndex, 1)
      profile.save().then(profile => res.json(profile))
    }
  })
})
router.post(
  '/',
  passport.authenticate('jwt', {session: false}), (req, res) => {
  const {errors, isValid} = validateProfileInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const profileFields = {}
  profileFields.user = req.user.id
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  if(req.body.experience) profileFields.experience = req.body.experience;
  if(req.body.education) profileFields.education = req.body.education;
  if(typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }
  profileFields.social = {}
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

  Profile.findOne({user: req.user.id})
  .then(profile => {
    const errors = {};
    if(profile) {
      Profile.findOneAndUpdate(
        {user: req.user.id},
        {$set: profileFields},
        {new: true}
      ).then(profile => res.json(profile));
    } else {
      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if(profile) {
          errors.handle = 'handle already exists'
          return res.status(404).json(errors);
        }
        new Profile(profileFields).save().then(profile => res.json(profile))
      })
    }
  })
  .catch(err => res.status(404).json(err));
})

module.exports = router;