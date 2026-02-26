// In-memory blacklist using a Set
// NOTE: This gets wiped on server restart.

const blacklistedTokens = new Set();

function blacklistToken(token) {
  blacklistedTokens.add(token);
}

function isTokenBlacklisted(token) {
  return blacklistedTokens.has(token);
}

export { blacklistToken, isTokenBlacklisted };

/**
 

    In Production :-

        // On logout:
        const decoded = jwt.decode(token);
        const ttl = decoded.exp - Math.floor(Date.now() / 1000); // remaining seconds
        await redisClient.set(token, "blacklisted", { EX: ttl });

        // In middleware:
        const isBlacklisted = await redisClient.get(token);
        if (isBlacklisted) return res.status(401).json({
          success: false,
          message: "Token has been invalidated. Please login again.",
        });

 */
