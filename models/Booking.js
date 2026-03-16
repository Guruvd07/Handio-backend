import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },

    /* ── ADDED: these were missing — date and note were being
       sent from frontend but silently dropped by Mongoose
       because they weren't in the schema ── */
    date: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      default: "",
    },

    priceAmount: {
      type: Number,
      default: null,
    },

    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);