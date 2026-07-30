import mongoose from "mongoose";

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    category: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    area: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    /* =========================
       PROFILE PHOTO
    ========================= */

    profilePhoto: {
      type: String,
      default: ""
    },

    /* =========================
       PORTFOLIO IMAGES
    ========================= */

    portfolio: [
      {
        imageUrl: String,
        caption: String
      }
    ],

    

    /* =========================
       FLEXIBLE PRICING SYSTEM
    ========================= */

    priceAmount: {
      type: Number,
      required: true,
      min: 0
    },

    priceType: {
      type: String,
      enum: [
        "hour",
        "day",
        "month",
        "visit",
        "session",
        "fixed"
      ],
      required: true
    },

    /* =========================
       ADMIN + REVIEW FIELDS
    ========================= */

    verified: {
      type: Boolean,
      default: false
    },

    averageRating: {
      type: Number,
      default: 0
    },

    totalReviews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProviderProfile", providerProfileSchema);