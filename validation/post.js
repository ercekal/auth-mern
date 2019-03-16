const Validator = require('validator');
const isEmpty = require('./isEmpty')

module.exports = function validatePostInput(data) {
  let errors = {}
  data.text = !isEmpty(data.text) ? data.text : '';
  data.comment = !isEmpty(data.comment) ? data.comment : '';

  if(Validator.isEmpty(data.text)) {
    errors.text = 'text is required';
  }
  if (!Validator.isLength(data.text, {min: 10, max: 300})) {
    errors.text = 'text must be between 10 and 30 chars';
  }
  // if(Validator.isEmpty(data.comment)) {
  //   errors.comment = 'comment is required';
  // }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}
