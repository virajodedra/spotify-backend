import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";

function authArtist(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access - No token provided",
    });
  }

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: "Token has been invalidated. Please login again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role != "artist") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action",
      });
    }

    // here i attached the  decoded token payload so controllers can use req.user.id, req.user.role, etc.
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access - Invalid token",
    });
  }
}

async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access - No token provided",
    });
  }

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: "Token has been invalidated. Please login again.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access - Invalid token",
    });
  }

  if (
    decoded.role != "user" &&
    decoded.role != "artist" &&
    decoded.role != "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to perform this action",
    });
  }

  req.user = decoded;
  next();
}

export { authArtist, authUser };
