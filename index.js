const express = require("express");
const swaggerValidation = require('express-ajv-swagger-validation');

const validatorOpts = {
  firstError: true,
  beautifyErrors: true,
  formats: [
    { name: 'double', pattern: /\d+\.(\d+)+/ },
    { name: 'int64', pattern: /^\d{1,19}$/ },
    { name: 'int32', pattern: /^\d{1,10}$/ }
  ]
};

swaggerValidation.init("./api.spec.yaml", validatorOpts);

const app = express()
const port = 3000

app.use(express.json());

app.get('/pets', swaggerValidation.validate, (req, res, next) => {
  return res.json({ result: 'OK', action: 'GET', details: { queryString: req.query, params: req.params } });
});

app.post('/pets', swaggerValidation.validate, (req, res, next) => {
  return res.status(201).json({ result: 'OK', action: 'POST', body: JSON.stringify(req.body) });
});

app.use((err, req, res, next) => {
  if (err instanceof swaggerValidation.InputValidationError) {
    return res.status(400).json({ 
      error: {
        name: err.name,
        message: err.message,
        detail: err.errors
      }
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      name: err.name,
      message: err.message,
      data: err.data,
    },
  });
});

app.listen(port, () => console.log('App listening on port >>> ' + port))