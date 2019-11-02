const crypto = require('crypto')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const env = require('../env')

const userModel = require('../models/user')

const { IncomingForm } = require('formidable')
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
    // update: function (req, res, collection) {
    //     useAuth.authorization(req, res, collection, user => {
    //         interests = req.body.interests.split(' ')
    //         collection
    //             .updateOne({_id: ObjectId(user._id)}, 
    //                 {$set: {
    //                     username: req.body.username,
    //                     fullName: req.body.fullName,
    //                     aboutMe: req.body.aboutMe,
    //                     interests: interests,
    //                     profilePicture: req.body.profilePicture
    //                 }
    //             })
    //             .then(data => {
    //                 res.end('user info  updates')
    //             })
    //             .catch(err => errorHandler.serverError(err, res))
    //     })
    // },
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
    // uploadImage: function (req, res) {
    //     if(req.headers['content-type'].startsWith('multipart/form-data')){
    //         const  form = new IncomingForm()
    //         form.uploadDir = './storage'
    //         form.keepExtensions = true
    
    //         form.parse(req, (err, fields, files) => {
    //             res.end(JSON.stringify({
    //                 path: files.image.path
    //             }))
    //         })
    //     } else if (req.headers['content-type'] === 'application/octet-stream') {
    //         if (!req.query.extension) {
    //             res.writeHead(500)
    //             return res.end(JSON.stringify({ message: 'Extension is required!' }))
    //         }

    //         const data = []
    //         req.on('data', chunk => data.push(chunk))
    //         req.on('end', () => {
    //             const path = `storage/upload_${new Date().getTime()}-${randomstring.generate(6)}.${req.query.extension}`
    //             fs.writeFileSync(`./${path}`, Buffer.concat(data))
    //             res.end(JSON.stringify({ path }))
    //         })
    //     }
    // }
}