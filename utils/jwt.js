const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const generateToken = (payload) => {
    const options = {
        expiresIn: '1h'
    }

    const token = jwt.sign(payload, SECRET, options);

    return token;
}

module.exports = {
    generateToken
}