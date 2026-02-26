import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { blacklistToken } from "../utils/tokenBlacklist.js";

// here the role is not provided like it is given by the admin to the user, so it is not a security risk. If you want to prevent clients from setting role, you can simply ignore the role field from req.body and hardcode it to "user" in the controller.
async function registerUser(req, res) {
  const { username, email, password, role = "user" } = req.body;
  // const role = "user" // default role is "user" if not provided, but can be overridden by client (e.g. for testing admin registration)
  try {
    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (isUserAlreadyExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS),
    );

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function loginUser(req, res) {
  const { username, email, password } = req.body;

  let user;
  try {
    user = await userModel.findOne({
      $or: [{ email }, { username }],
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

async function logoutUser(req, res) {
  const token = req.cookies.token;

  if (token) {
    blacklistToken(token); // invalidate the token server-side
  }

  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
}

export { registerUser, loginUser, logoutUser };
