const { User } = require("../models/index");
const OpError = require("../helpers/operational-error");
const sendEmail = require("../helpers/send-mail");
const { createToken, encryptToken } = require("../helpers/utils/crypto-utils");
const { signJwtToken } = require("../helpers/utils/jwt-utils");
const { filterOutObjKeys } = require("../helpers/utils/object-utils");

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, photo } = req.body;
    const user = await User.create({ name, email, password, photo });
    user.password = undefined;
    user.passwordChange = undefined;

    await sendEmail({
      to: user.email,
      subject: "Welcome To Express-Tours 🚀",
      htmlContent: `<h1>Welcome ${user.name}</h1><hr><p>We are happy to have you on board 🤩.</p><p>Best Regards,</p>`,
    });

    res.status(201).json({
      status: "Success",
      message: "Your account has been created successfully. Please sign in with your email and password.",
    });
  } catch (error) {
    next(error);
  }
};

const getUser = (req, res, next) => {
  try {
    const { user } = req;

    res.status(200).json({
      status: "Success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 0, limit = 10 } = req.query;
    const paginationResults = await User.paginate({}, { page, limit });
    const { docs: users, ...paginationData } = paginationResults;

    res.status(200).json({
      status: "Success",
      data: { users, ...paginationData },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { user } = req;
    const updateFields = filterOutObjKeys(req.body, ["password", "passwordChange", "role", "createdAt", "updatedAt"]);
    for (let field in updateFields) {
      user[field] = updateFields[field];
    }
    await user.save();
    user.password = undefined;

    res.status(200).json({
      status: "Success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { user } = req;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new OpError(400, "Current password and new password fields are required to update password."));
    }
    if (!(await user.isPasswordValid(currentPassword))) {
      return next(new OpError(401, "Invalid current password."));
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "Success",
      message: "Password has changed successfully. Please sign in with the new password.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.deleteOne({ _id: userId });

    res.status(204).json({
      status: "Success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new OpError(400, "Email and password fields are required for user authentication."));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.isPasswordValid(password))) {
      return next(new OpError(401, "Invalid email or password."));
    }
    user.password = undefined;

    const accessToken = signJwtToken({ id: user._id });

    res.cookie("jwt", accessToken, {
      maxAge: process.env.COOKIE_EXPIRESIN,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

    res.status(200).json({
      status: "Success",
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new OpError(400, "Email field is required to reset password."));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new OpError(404, `No user found with this email '${email}'.`));
    }

    const resetToken = createToken();
    const hashedResetToken = encryptToken(resetToken);
    user.passwordChange.resetToken = hashedResetToken;
    user.passwordChange.resetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

    const passwordResetServerUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetpassword/${resetToken}`;
    const passwordResetClientUrl = `${process.env.CLIENT_HOST}/users/resetpassword/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Your Password Reset URL",
      htmlContent: `<h1>Reset Your Password</h1><hr><p>Hi <strong>${user.name}</strong>,</p><p>Please submit a <code>PATCH</code> request with your <code>email</code> and a new <code>password</code> to this URL:\n<code>${passwordResetServerUrl}</code></p><p>The URL is only valid for <strong>10 minutes</strong>.</p><p>If you didn't request to reset your password, please ignore this email.</p><p>Best Regards,</p>`,
    });

    await user.save();

    res.status(200).json({
      status: "Success",
      message: "Password reset URL is sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new OpError(400, "Email and new password fields are required to reset password."));
    }
    const user = await User.findOne({ email }).select("+passwordChange.resetToken +passwordChange.resetTokenExpiresIn");
    if (!user) {
      return next(new OpError(404, `No user found with this email '${email}'.`));
    }
    if (!user.isPasswordResetTokenValid(resetToken)) {
      return next(new OpError(401, "Password reset token is not valid or has expired."));
    }

    user.password = newPassword;
    user.passwordChange.resetToken = undefined;
    user.passwordChange.resetTokenExpiresIn = undefined;
    await user.save();

    res.status(200).json({
      status: "Success",
      message: "Password has changed successfully. Please sign in with the new password.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  authenticateUser,
  forgotPassword,
  resetPassword,
};
