const Joi = require('joi');
const moment = require('moment');

const payloadSchemas = {
  view: Joi.object({
    url: Joi.string().uri().required(),
    title: Joi.string().optional()
  }),
  click: Joi.object({
    element_id: Joi.string().optional(),
    text: Joi.string().optional(),
    xpath: Joi.string().optional()
  }).or('element_id', 'text', 'xpath'),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    accuracy: Joi.number().positive().optional()
  })
};

const eventSchema = Joi.object({
  user_id: Joi.string().trim().min(1).required(),
  event_type: Joi.string().valid('view', 'click', 'location').required(),
  payload: Joi.object().required()
}).unknown(false);

function validateEvent(data) {
  // First validate the basic structure
  const { error, value } = eventSchema.validate(data);
  if (error) {
    return { error };
  }

  // Then validate the payload based on event_type
  const payloadValidation = payloadSchemas[value.event_type].validate(value.payload);
  if (payloadValidation.error) {
    return { 
      error: {
        details: [{
          message: `Invalid payload for ${value.event_type} event: ${payloadValidation.error.details[0].message}`
        }]
      }
    };
  }

  return { value: { ...value, payload: payloadValidation.value } };
}

function validateDateRange(startDate, endDate) {
  if (startDate && !moment(startDate, 'YYYYMMDD', true).isValid()) {
    return { error: 'start_date must be in YYYYMMDD format' };
  }
  
  if (endDate && !moment(endDate, 'YYYYMMDD', true).isValid()) {
    return { error: 'end_date must be in YYYYMMDD format' };
  }
  
  if (startDate && endDate) {
    const start = moment(startDate, 'YYYYMMDD');
    const end = moment(endDate, 'YYYYMMDD');
    
    if (start.isAfter(end)) {
      return { error: 'start_date cannot be after end_date' };
    }
  }
  
  return { valid: true };
}

module.exports = {
  validateEvent,
  validateDateRange
};