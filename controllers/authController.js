const crypto = require('crypto')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const env = require('../env')

const userModel = require('../models/user')

const randomstring = require('randomstring')
const ObjectId = require('mongodb').ObjectId

const errorHandler = require('../middlewares/errorHandler')
const useAuth = require('../middlewares/useAuth')

module.exports = {
    signup: function(req, res) {
        if(req.body.password !== req.body.confirmPassword) {
            return res.status(500).json({ message: 'Password does not match' })
        }

        userModel.create({
            ...req.body,
            password: crypto.createHash('md5').update(req.body.password).digest('hex'),
            registerDate: date.toISOString().split('T')[0]
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

        console.log(req.body)

        userModel
            .updateOne(
                { _id: req.user._id },
                { $set: req.body }
            )
            .then(() => res.json({ success: true }))
            .catch(e => res.status(500).send(e))
    },
    // delete: function (req, res, collection) {
    //     useAuth.authorization(req, res, collection, user => {
    //         collection
    //             .deleteOne({_id: ObjectId(user._id)})
    //             .then(data => {
    //                 res.end(JSON.stringify('Useer deletes.'))
    //             })
    //             .catch(err => errorHandler.serverError(err, res))
    //     })
    // },
}