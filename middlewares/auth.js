const jwt = require('jsonwebtoken');
const { generateError } = require('../helpers');

const authUser = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            throw generateError('Falta la cabecera de authorization', 401);
        }

        let payload;
        try {
            payload = jwt.verify(authorization, process.env.SECRET);
        } catch {
            throw generateError('Token incorrecto', 401);
        }
        req.userId = payload.id;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authUser,
};
