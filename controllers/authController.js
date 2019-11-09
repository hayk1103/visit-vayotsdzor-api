const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const env = require('../env')
const userModel = require('../models/user')

module.exports = {
    signup: function(req, res) {
        // if(req.body.password !== req.body.confirmPassword) {
        //     return res.status(500).json({ message: 'Password does not match' })
        // }
        console.log(req.body)
        userModel.create({
            ...req.body,
            password: crypto.createHash('md5').update(req.body.password).digest('hex'),
            registerDate: new Date
        }).then(user => {
            return res.json({ user })
        }).catch(e => {
            console.log(e)
            return res.status(500).send(e)
        })
    },
    login: function (req, res) {
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
            .catch(e => res.status(500).send(e))
    }, 
    get: function (req, res) {
        return res.json({
            user: req.user
        })
    },
    update: function (req, res) {
        ['_id', '_v', 'createdAt', 'updatedAt', 'password', 'email'].forEach(field => delete req.body[field]) 

        userModel
            .updateOne(
                { _id: req.user._id },
                { $set: req.body }
            )
            .then(() => res.json({ success: true }))
            .catch(e => res.status(500).send(e))
    },
    delete: function (req, res) {
        userModel
            .deleteOne(
                { _id: req.user._id }
            )
            .then(() =>  res.json({ success: true }))
            .catch(err => res.status(500).send(e))
    }
}