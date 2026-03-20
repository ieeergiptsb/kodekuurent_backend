const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: false, message: "No token provided, please log in" });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_KEY || 'kodekurrent_secret_key', async (err, decoded) => {
        if (err) {
            return res.status(403).json({ status: false, message: "Token is not valid" });
        } else {
            req.userId = decoded.id;
            next();
        }
    });
};
