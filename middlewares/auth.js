import jwt from 'jsonwebtoken';

const auth = (roles = []) => async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // console.log("authenticated");
    //this is for the seller Jab seller ham pass kray ga to vo verify kray ga k rew.user.role mn seller ha ya buyer(default) agr 'seller' nhi ho ga to error aye ga authenticate nhi ho ga 
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized. You do not have permission to access this resource.' });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default auth;
