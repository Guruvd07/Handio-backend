export default function role(roleName) {
  return function (req, res, next) {

    if (!req.user || req.user.role !== roleName) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}