import { asyncHandler } from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import sendMail from "../utils/sendMail.js";
import createActivationToken from "../utils/activation.js";
import { sendToken } from "../utils/jwt.js";
import Distributor from "../models/distributorModel.js";
import cloudinary from "cloudinary";

class AuthController {
  static registration = asyncHandler(async (req, res, next) => {
    try {
      const { name, email, password, address, phone } = req.body;

      if (!name) {
        return next(new ErrorHandler("Name cannot be empty", 400));
      }

      if (!email) {
        return next(new ErrorHandler("Email cannot be empty", 400));
      }
      if (!password) {
        return next(new ErrorHandler("Name cannot be empty", 400));
      }
      if (!address) {
        return next(new ErrorHandler("Address cannot be empty", 400));
      }
      if (!phone) {
        return next(new ErrorHandler("Phone cannot be empty", 400));
      }
      const isEmailExist = await User.findOne({ email });

      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }
      // putting the destructured object variable in one object known as user
      const user = {
        name,
        email,
        password,
        address,
        phone,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };
      // getting the current directory
      const __filename = fileURLToPath(import.meta.url);
      const currentDirectory = path.dirname(__filename);

      const mailPath = path.join(
        currentDirectory,
        "../mails/activationMail.ejs"
      );

      const html = await ejs.renderFile(mailPath, data);

      // Send mail function call
      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          template: "activationMail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.email} to activate your account.`,
          activationToken: activationToken.token,
        });
      } catch (err) {
        return next(new ErrorHandler(err.message, 400));
      }
    } catch (err) {
      return next(new ErrorHandler(err.message, 400));
    }
  });

  static activation = asyncHandler(async (req, res, next) => {
    try {
      const { activation_code, activation_token } = req.body;

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation Code", 400));
      }

      const { name, email, password, address, phone } = newUser?.userdata;

      const existUser = await User.findOne({ email });

      if (existUser) {
        return next(new ErrorHandler("Email already exits", 400));
      }

      await User.create({
        name,
        email,
        password,
        address,
        phone,
      });

      res.status(201).json({
        success: true,
        message: "User has been successfully created",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });

  static login = asyncHandler(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(
          new ErrorHandler("Please enter your email or Password", 400)
        );
      }

      //  CHECK if the user is banned or not verified
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 400));
      }

      if (!user.isVerified) {
        return next(new ErrorHandler("You are not verified yet", 400));
      }

      if (user.isBanned) {
        return next(new ErrorHandler("You are banned from the site", 400));
      }

      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid Email or Password", 400));
      }

      sendToken(user._id, res);

      delete user._doc.password;

      // response to the frontend
      res.status(201).json({
        success: true,
        message: "User is successfully logged in",
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });

  static logout = asyncHandler(async (req, res, next) => {
    try {
      res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({
        success: true,
        message: "User logged out successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  });

  static changePassword = asyncHandler(async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select("+password");
      const passwordMatch = user.comparePassword(currentPassword);
      if (!passwordMatch) {
        return next(new ErrorHandler("Password is incorrect"));
      }
      if (currentPassword === newPassword) {
        return next(new ErrorHandler("New password is already used", 400));
      }

      // Now update the old password with new password
      user.password = newPassword;
      await user.save();
      const distributor = await Distributor.findOne({ user: user._id });
      if (distributor) {
        await Distributor.findByIdAndUpdate(
          distributor._id,
          { firstlogin: false },
          { new: true, runValidators: true }
        );
      }
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  });

  static updateProfile = asyncHandler(async (req, res, next) => {
    try {
      const { name, address, phone, avatar, bio } = req.body;
      const userId = req.user._id;

      if (!name && !address && !phone && !avatar) {
        return next(new ErrorHandler("At least one field is required", 400));
      }

      // Handle image upload
      let uploadedImage = {};
      if (avatar) {
        const result = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          resource_type: "auto",
        });
        uploadedImage = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      // Build update object with only provided fields
      const updateData = {};
      if (name) updateData.name = name;
      if (address) updateData.address = address;
      if (phone) updateData.phone = phone;
      if (bio) updateData.bio = bio;
      if (avatar) updateData.avatar = uploadedImage;

      const user = await User.findByIdAndUpdate(userId, updateData, {
        runValidators: true,
        new: true,
      });

      if (user) {
        return res.status(200).json({
          success: true,
          message: "Profile Updated Successfully",
        });
      } else {
        return next(new ErrorHandler("User not found", 404));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  });

  static getProfile = asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new ErrorHandler("user not found", 400));
      }
      return res.status(200).json({
        success: true,
        message: "user Profile",
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  });

  static requestDistributor = asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      user.requestDistributor = "process";
      await user.save();
      return res.status(200).json({
        success: true,
        messaage: "Distributor requested successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  });

  static viewSuppliers = asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new ErrorHandler("User Not Found", 400));
      }
      const distributor = await Distributor.findById(user.distributor).populate(
        "user"
      );
      if (!distributor) {
        return next(new ErrorHandler("Distributor is not allocated", 400));
      }
      return res.status(200).json({
        success: true,
        message: "Shop Distributor fetched successfully",
        distributor,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  });
}

export default AuthController;
