const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader){
        const token = authHeader.split(' ')[1];

        jwt.verify(token, SECRET, (err, payload) => {
            if(err){
                return res
                    .status(404)
                    .json({ message: 'Token is invalid.' });
            }else{
                req.user = payload;
                next();
            }
        });
    }else{
        return res
            .status(404)
            .json({ message: 'Token not provided.' });
    }
}

module.exports = {
    validateToken
};