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
            throw new Error(e)
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
            .catch(e => {
                throw new Error(e)
            })
    }, 
    get: function (req, res) {
        return res.json({
            user: req.user
        })
    },
    getUser: function (req, res) {
        userModel
            .findOne({ _id: req.query.id })
            .then(user => res.json({ user }))
            .catch(e => {
                throw new Error(e)
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
            .catch(e => {
                throw new Error(e)
            })
    },
    delete: function (req, res) {
        userModel
            .deleteOne(
                { _id: req.user._id }
            )
            .then(() =>  res.json({ success: true }))
            .catch(err => {
                throw new Error(e)
            })
    },
    search: function (req, res) {
        userModel
            .find({ $or: 
                [
                    {username: { $regex: new RegExp(req.query.search, "i") }},
                    {fullName: { $regex: new RegExp(req.query.search, "i") }}
                ]
            })
            .then(data => res.json({ data }))
            .catch(e => {
                throw new Error(e)
            })
    }
}