const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

const validatePostInput = require('../../validation/post');

router.post('/addPost',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
  const {errors, isValid} = validatePostInput(req.body)
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  })
  newPost.save()
  .then(post => res.json(post))
  .catch(err => res.json(err))
})

router.post('/like/:id',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
      .then(post => {
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
          const removeIndex = post.likes.map(like => like.user.toString())
          .indexOf(req.user.id)
          post.likes.splice(removeIndex, 1)
          return post.save()
          .then(() => res.json({likeRemoved: true}))
        }
        post.likes.unshift({user: req.user.id})
        return post.save().then(() => res.json({likeAdded: true}))
      })
    })
})
router.post('/comment/:id',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
      .then(post => {
        const comment = {
          text: req.body.text,
          name: req.user.name,
          avatar: req.user.avatar,
          user: req.user.id
        }
        post.comments.unshift(comment)
        return post.save().then(() => res.json({success: true}))
      })
    })
  })

router.delete('/comment/:post_id/:comment_id',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
  const {errors, isValid} = validatePostInput(req.body)
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({user: req.user.id})
  .then(profile => {
    Post.findById(req.params.post_id)
    .then(post => {
      if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        res.status(404).json({comment: 'comment not found'});
      }
      if(post.comments.filter(comment => comment.user.toString() === req.user.id).length > 0 ||
        post.comments.filter(comment => comment.user.toString() === profile.user.id).length > 0) {
        const removeIndex = post.comments.map(comment => comment.user.toString())
        .indexOf(req.params.comment_id)
        post.comments.splice(removeIndex, 1)
        return post.save()
        .then(() => res.json({commentRemoved: true}))
      }
    })
  })
})




router.get('/all', (req, res) => {
  Post.find()
  .sort({date: -1})
  .then(posts => res.json(posts))
  .catch(err => res.status(404).json({posts: 'There are no posts'}));
})

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
  .then(post => res.json(post))
  .catch(err => res.status(404).json({post: 'Post not found'}));
})

router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
  Profile.findOne({user: req.user.id})
  .then(profile => {
    Post.findById(req.params.id)
    .then(post => {
      if(post.user.toString() !== req.user.id) {
        return res.status(401).json({post: 'user not authorized'})
      }
      post.remove().then(() => res.json({success: true}))
    })
    .catch(err => res.status(404).json({post: 'Post not found'}));
  })

})




module.exports = router;