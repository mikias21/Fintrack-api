const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const generateToken = (payload) => {
    const options = {
        expiresIn: '30d'
    }

    const token = jwt.sign(payload, SECRET, options);

    return token;
}

module.exports = {
    generateToken
}