const crypto = require('crypto')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const { IncomingForm } = require('formidable')
const randomstring = require('randomstring')
const ObjectId = require('mongodb').ObjectId

const errorHandler = require('../middlewares/errorHandler')
const useAuth = require('../middlewares/useAuth')

const date = new Date

module.exports = {
    signup: function(req, res, collection) {
        useAuth.checkEmail(res, req, collection, () => {
            if(req.body.password === req.body.passwordConfirmation) {
                collection
                    .insertOne({
                        email: req.body.email,
                        username: req.body.username,
                        fullName: req.body.fullName,
                        password: crypto.createHash('md5').update(req.body.password).digest('hex'),
                        registerDate: date.toISOString().split('T')[0]
                    })
                    .then(data => {
                        
                        res.end(JSON.stringify({message: 'User successfully adds.'}))
                    })
                    .catch(e => errorHandler.serverError(e, res))
            } else {
                res.writeHead(400)
                res.end(JSON.stringify({status: 400, message: 'Password does not match'}))
            }
        })
    },
    login: function (req, res, collection) {
        collection
            .find( {$and: [
                {username: req.body.username},
                {password: crypto.createHash('md5').update(req.body.password).digest('hex')}
            ]})
            .toArray()
            .then(user => {
                if ( user.length === 0) {
                    console.log('user undefind')
                    res.end(JSON.stringify(errorHandler.invalidCredentials(null, res)))
                } else if(user.length !== 0){
                    const token = jwt.sign({id: user[0]._id}, 'sectetKey')
                    res.end(JSON.stringify({token}))
                } 
            })
            .catch(err => errorHandler.serverError(err, res))
    }, 
    get: function (req, res, collection) {
        collection
            .find({_id: ObjectId(req.query.id)})
            .toArray()
            .then(data => {
                const user = {}
                for (const key in data[0]) {
                    if(key !== '_id' && key !== 'password') {
                        user[key] = data[0][key]
                    }
                }
                res.end(JSON.stringify({user}))
            })
    },
    update: function (req, res, collection) {
        useAuth.authorization(req, res, collection, user => {
            interests = req.body.interests.split(' ')
            collection
                .updateOne({_id: ObjectId(user._id)}, 
                    {$set: {
                        username: req.body.username,
                        fullName: req.body.fullName,
                        aboutMe: req.body.aboutMe,
                        interests: interests,
                        profilePicture: req.body.profilePicture
                    }
                })
                .then(data => {
                    res.end('user info  updates')
                })
                .catch(err => errorHandler.serverError(err, res))
        })
    },
    delete: function (req, res, collection) {
        useAuth.authorization(req, res, collection, user => {
            collection
                .deleteOne({_id: ObjectId(user._id)})
                .then(data => {
                    res.end(JSON.stringify('Useer deletes.'))
                })
                .catch(err => errorHandler.serverError(err, res))
        })
    },
    uploadImage: function (req, res) {
        if(req.headers['content-type'].startsWith('multipart/form-data')){
            const  form = new IncomingForm()
            form.uploadDir = './storage'
            form.keepExtensions = true
    
            form.parse(req, (err, fields, files) => {
                res.end(JSON.stringify({
                    path: files.image.path
                }))
            })
        } else if (req.headers['content-type'] === 'application/octet-stream') {
            if (!req.query.extension) {
                res.writeHead(500)
                return res.end(JSON.stringify({ message: 'Extension is required!' }))
            }

            const data = []
            req.on('data', chunk => data.push(chunk))
            req.on('end', () => {
                const path = `storage/upload_${new Date().getTime()}-${randomstring.generate(6)}.${req.query.extension}`
                fs.writeFileSync(`./${path}`, Buffer.concat(data))
                res.end(JSON.stringify({ path }))
            })
        }
    }
}