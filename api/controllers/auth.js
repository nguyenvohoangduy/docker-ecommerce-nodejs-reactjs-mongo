const User = require('../models/user')
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.signup = (req, res) => {
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.status(201).json({
            user
        })
    });
}

exports.signin = (req, res) => {
    const {email, password} = req.body
    User.findOne({email}, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                err: "User with that email does not exsist. Please signup"
            })
        }

        if (!user.authenticate(password)) {
            return res.status(401).json({
                err: "Email and password don't match"
            })
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
        res.cookie('t', token, {expire: new Date() + (24 * 60 * 60)})

        const {_id, name, email, role} = user;
        return res.json({token, user: {_id, name, email, role}})
    })
}

exports.signout = (req, res) => {
    res.clearCookie('t');
    res.json({message: "Signout success"});
}
