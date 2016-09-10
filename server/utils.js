const jwt = require('jwt-simple');

module.exports = {
  checkUser(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.send(403); // send forbidden if a token is not provided
    }
    try {
      // decode token and attach user to the request
      // for use inside our controllers
      const user = jwt.decode(token, 'mE2bNdyu2p');
      req.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  },
};
