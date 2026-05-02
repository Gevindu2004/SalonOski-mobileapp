const { body } = require("express-validator");

const createPaymentValidation = [
  body("appointmentId").isMongoId().withMessage("Valid appointmentId is required"),
  body("amount").isFloat({ gte: 0 }).withMessage("Amount must be zero or greater"),
  body("method").optional().isIn(["cash", "card", "online"]).withMessage("Invalid payment method")
];

const updatePaymentStatusValidation = [
  body("status").isIn(["unpaid", "paid", "refunded"]).withMessage("Status must be unpaid, paid or refunded"),
  body("method").optional().isIn(["cash", "card", "online"]).withMessage("Invalid payment method"),
  body("note").optional().isString().trim()
];

module.exports = {
  createPaymentValidation,
  updatePaymentStatusValidation
};
