import mongoose from "mongoose";

// Check if the model is already defined
if (mongoose.models.Admin) {
  module.exports = mongoose.models.Admin;
} else {
  const adminSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "admin" },
    // Add other seller properties if needed
  });

  module.exports = mongoose.model("Admin", adminSchema);
}
