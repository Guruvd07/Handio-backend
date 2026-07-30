import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },

    email: {
      type: String,
      unique: true,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer"
    },
    profileImage: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);