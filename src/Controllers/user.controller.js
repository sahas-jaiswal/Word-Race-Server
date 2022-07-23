const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const env = require("dotenv");
env.config();

const generateJwtToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        error: "User already registered",
      });

    const { fullName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      fullName,
      email,
      hash_password,
    });

    _user.save((error, user) => {
      if (error) {
        return res.status(400).json({
          message: "Something went wrong",
          error,
        });
      }

      if (user) {
        const { _id, fullName, lastName, email } = user;
        return res.status(201).json({
          message: "User successfully created.",
          user: { _id, fullName, lastName, email },
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error) return res.status(400).json({ error: "User not found", error });
    if (user) {
      const isPassword = await user.authenticate(req.body.password);
      if (isPassword) {
        const token = generateJwtToken(user._id);
        const { _id, fullName, email, score, level } = user;
        res.status(200).json({
          token,
          user: { _id, fullName, email, score, level },
        });
      } else {
        return res.status(400).json({
          error: "Invalid Password!",
        });
      }
    } else {
      return res.status(400).json({ error: "User not found" });
    }
  });
};

exports.updateUser = (req, res) => {
  console.log(req)
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).send("No Token");
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      console.log(error);
      return res.status(401).send("Token expired");
    }
    if (user) {
      if (user._id === req.body._id) {
        User.findOne({ _id: req.body._id }).exec((error, user) => {
          user.score = req.body.score;
          user.level = req.body.level;
          user.save().then((user) => {
            if (user) {
              return res.status(200).json({
                fullName: user.fullName,
                score: user.score,
                level: user.level,
              });
            } else {
              return res.status(400).json("User not found");
            }
          });
        });
      } else {
        return res.status(403).send("Unauthorise access");
      }
    }
  });
};
exports.getAllUsers = (req, res) => {
  User.find({}).exec((error, user) => {
    if (error) {
      return res.status(400).json({ error });
    }
    if (user) {
      console.log(user);
      return res.status(200).json([...user]);
    }
  });
};
exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Signout successfully...!",
  });
};
