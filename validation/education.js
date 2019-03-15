const Validator = require('validator');
const isEmpty = require('./isEmpty')

module.exports = function validateExperienceInput(data) {
  let errors = {}
  data.school = !isEmpty(data.school) ? data.school : '';
  data.degree = !isEmpty(data.degree) ? data.degree : '';
  data.fieldOfStudy = !isEmpty(data.fieldOfStudy) ? data.fieldOfStudy : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if(Validator.isEmpty(data.school)) {
    errors.school = 'school is required';
  }
  if(Validator.isEmpty(data.degree)) {
    errors.degree = 'degree is required';
  }
  if(Validator.isEmpty(data.fieldOfStudy)) {
    errors.fieldOfStudy = 'fieldOfStudy is required';
  }
  if(Validator.isEmpty(data.from)) {
    errors.from = 'From date is required';
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}
