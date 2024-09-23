const mongoose = require("mongoose");

// Check if the model is already defined
if (mongoose.models.Customer) {
  module.exports = mongoose.models.Customer;
} else {
  const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,


  });

  module.exports = mongoose.model("Customer", customerSchema);
}