const Validator = require('validator');
const isEmpty = require('./isEmpty')

module.exports = function validateProfileInput(data) {
  let errors = {}
  data.handle = !isEmpty(data.handle) ? data.handle : '';
  data.skills = !isEmpty(data.skills) ? data.skills : '';
  data.status = !isEmpty(data.status) ? data.status : '';

  if(isEmpty(data.status)) {
    errors.status = 'Status is required';
  }
  if(isEmpty(data.handle)) {
    errors.handle = 'handle is required';
  }
  if(isEmpty(data.skills)) {
    errors.skills = 'Skill is required';
  }
  if(!isEmpty(data.website)) {
    if(!Validator.isURL(data.website)) {
      errors.website = 'Not a valid URL';
    }
  }
  if(!isEmpty(data.linkedin)) {
    if(!Validator.isURL(data.linkedin)) {
      errors.linkedin = 'Not a valid URL';
    }
  }
  if(!isEmpty(data.youtube)) {
    if(!Validator.isURL(data.youtube)) {
      errors.youtube = 'Not a valid URL';
    }
  }
  if(!isEmpty(data.facebook)) {
    if(!Validator.isURL(data.facebook)) {
      errors.facebook = 'Not a valid URL';
    }
  }
  if(!isEmpty(data.instagram)) {
    if(!Validator.isURL(data.instagram)) {
      errors.instagram = 'Not a valid URL';
    }
  }
  if (!Validator.isLength(data.handle, {min: 2, max: 40})) {
    errors.handle = 'Handle must be between 2 and 40 chars';
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}
