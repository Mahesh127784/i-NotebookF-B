const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middlewares/fetchuser");
const {
  reconstructFieldPath,
} = require("express-validator/src/field-selection");
const JWT_SECRET = "nameisvirattheking";

//create a user using:POST "/api/auth/creatuser". no login required
const validateUserCreation = [
  body("name", "Enter a valid name").isLength({ min: 3 }),
  body("email", "Enter a valid email").isEmail(),
  body("password", "Enter a strong password of at least 5 characters").isLength(
    { min: 5 }
  ),
];
//If there are erors,return bad request and the errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
router.post(
  "/createUser",
  validateUserCreation,
  handleValidationErrors,
  async (req, res) => {
    //check wether the users email already exists
    try {
      let person = await User.findOne({ email: req.body.email });
      if (person) {
        return res.status(400).json({ error: "This email is already exists" });
      }

      //creating a salt passsword and adding to originl passwrd for higher security and making them hashcode
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //for creating a new user
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      //creating a authenticationToken for easy giving user for next time login
      const data = user.id;

      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({ authtoken }); //{authtoken}=>authtoken:authtoken
    } catch (error) {
      console.error(error.message);
      res.status(500).send(`Internal server error`);
    }
  }
);

//Authenticating a user using:POST "/api/auth/login". login required
router.post(
  "/loginPage",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "password cannot be blank").exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please login with proper credentials" });
      }

      let passcheck = await bcrypt.compare(password, user.password);
      if (!passcheck) {
        return res
          .status(400)
          .json({ error: "Please login with proper credentials" });
      }
      const data = user.id;

      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send(`Internal server error`);
    }
  }
);

//Get loggedin user details, Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    console.log("insidegetuser");
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(`Internal server error`);
  }
});

module.exports = router;
