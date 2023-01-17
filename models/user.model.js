const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { encryptToken } = require("../helpers/utils/crypto-utils");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name field is required."],
    minlength: [5, "User name field must be at least 5 characters."],
    maxlength: [40, "User name field must be at most 40 characters."],
    validate: {
      validator: function (val) {
        return validator.isAlphanumeric(val, "en-US", { ignore: " .-" });
      },
      message: "User name field must contain only alphanumeric characters, spaces, dots, and dashes.",
    },
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "User email field is required."],
    validate: {
      validator: function (val) {
        return validator.isEmail(val);
      },
      message: (props) => `${props.value} is not a valid email address.`,
    },
    lowercase: true,
    trim: true,
  },
  imagePath: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: [true, "User password field is required."],
    minlength: [8, "User password field must be at least 8 characters."],
    maxlength: [100, "User password field must be at most 100 characters."],
    select: false,
  },
  passwordChange: {
    changedAt: {
      type: Date,
      select: false,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiresIn: {
      type: Date,
      select: false,
    },
  },
  role: {
    type: String,
    enum: {
      values: ["user", "guide", "lead-guide", "admin"],
      message: "User role field must be user, guide, lead-guide, or admin.",
    },
    default: "user",
  },
});

userSchema.methods.isPasswordValid = async function (inputPassword) {
  const isValid = await bcrypt.compare(inputPassword, this.password);
  return isValid;
};

userSchema.methods.isPasswordResetTokenValid = function (resetToken) {
  const hashedResetToken = encryptToken(resetToken);
  return hashedResetToken === this.passwordChange.resetToken && this.passwordChange.resetTokenExpiresIn > Date.now();
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  this.passwordChange.changedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
