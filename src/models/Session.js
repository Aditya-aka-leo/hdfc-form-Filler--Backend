const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "label must be at most 100 characters"],
    },
    savedAt: {
      type: Date,
      required: true,
    },
    pathname: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => v.startsWith("/"),
        message: "pathname must start with '/'",
      },
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    excluded: {
      type: [String],
      default: [],
    },
    steps: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Exclude internal __v from responses
    versionKey: false,
  }
);

// Ensure data is a non-empty object at the schema level
sessionSchema.path("data").validate(function (value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}, "data must be a non-empty object");

module.exports = mongoose.model("Session", sessionSchema);
