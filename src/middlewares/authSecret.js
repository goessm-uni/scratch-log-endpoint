// Simple static token authentication
hasSecretToken = (req, res, next) => {
    const secret = process.env.SECRETTOKEN;
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }
    if (token !== `Basic ${secret}`) {
        return res.status(401).send({ message: "Unauthorized!" });
    }
    next();
};

module.exports = hasSecretToken;
