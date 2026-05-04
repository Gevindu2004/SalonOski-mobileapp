const { body } = require("express-validator");
const { param } = require("express-validator");

const createFeedbackValidation = [
  body("appointmentId").isInt({ min: 1 }).withMessage("Valid appointmentId is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Comment is required")
];

const replyFeedbackValidation = [body("message").trim().notEmpty().withMessage("Reply message is required")];
const replyByAppointmentValidation = [
  param("appointmentNumber")
    .isInt({ min: 1 })
    .withMessage("Valid appointment number is required"),
  body("message").trim().notEmpty().withMessage("Reply message is required")
];


module.exports = {
  createFeedbackValidation,
  replyFeedbackValidation,
  replyByAppointmentValidation
};


