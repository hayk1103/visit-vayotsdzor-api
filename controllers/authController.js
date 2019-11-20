const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const env = require('../env')
const userModel = require('../models/user')

module.exports = {
    signup: function(req, res, next) {
        // if(req.body.password !== req.body.confirmPassword) {
        //     return res.status(500).json({ message: 'Password does not match' })
        // }
        userModel.create({
            ...req.body,
            password: crypto.createHash('md5').update(req.body.password).digest('hex'),
            registerDate: new Date
        }).then(user => {
            return res.json({ user })
        }).catch(next)
    },
    login: function (req, res, next) {
        userModel
            .findOne({
                username: req.body.username,
                password: crypto.createHash('md5').update(req.body.password).digest('hex')
            })
            .then((user) => {
                console.log(user)
                if (!user) {
                    return res.status(500).json({ message: 'invalid username or password!' })
                }
                return res.json({
                    token: jwt.sign({ _id: user._id }, env.secret)
                })
            })
            .catch(next)
    }
}