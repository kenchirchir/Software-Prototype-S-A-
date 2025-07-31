const Joi = require('joi');

// Separate validation logic
const productSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Product name is required',
    'any.required': 'Product name is required'
  }),
  description: Joi.string().optional(),
  SKU: Joi.string().optional(),
  category_id: Joi.number().required().messages({
    'number.base': 'Valid category is required'
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  quantity: Joi.number().integer().min(0).optional()
});

// Middleware version
exports.validateProduct = (req, res, next) => {
  console.log('Validating Product Request Body:', req.body);
  
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    console.error('Validation Errors:', error.details);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

// Function version for direct call in controllers
exports.validateProductFunction = (data, isUpdate = false) => {
  const schema = isUpdate 
    ? productSchema.fork(['name', 'price', 'category_id'], field => field.optional())
    : productSchema;
  
  return schema.validate(data, { abortEarly: false });
};
