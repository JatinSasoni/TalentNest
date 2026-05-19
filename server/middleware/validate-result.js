import { validationResult } from "express-validator";

const validateResults = (req, res, next) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    const errors = results.array();

    return res.status(422).json({
      message: "Validation failed",
      MESSAGE: "All fields are required",
      success: false,
      SUCCESS: false,
      errors,
    });
  }
  next();
};

export default validateResults;
