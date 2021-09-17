const jwt = require('jsonwebtoken');

const autorizacion = (req, res, next) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Autorization: 'bearer TOKEN'
    if (!token) {
      throw new Error('Fallo de autenticación')
    }
    decodedTOKEN = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      userId: decodedTOKEN.userId
    };
    next();
  } catch (err) {
    const error = new Error('Fallo de autenticación');
    error.code = 401;
    return next(error);
  }
}

module.exports = autorizacion;