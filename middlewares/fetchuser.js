const jwt = require("jsonwebtoken");
const JWT_SECRET = "nameisvirattheking";

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .json({ error: "please authenticate using proper token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.userId = data;
    next();
  } catch (error) {
    res.status(401).send({ error: "please authenticate using proper token" });
  }
};

module.exports = fetchuser;
