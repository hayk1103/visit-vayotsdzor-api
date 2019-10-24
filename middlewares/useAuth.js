const jwt = require('jsonwebtoken')
const errorHandler = require('./errorHandler')
const ObjectId = require('mongodb').ObjectId
module.exports = {
    checkEmail: (res, req, collection, next) => {
        collection
            .find({
                $or: [
                    {email: req.body.email},
                    {username: req.body.username}
                ]
            })
            .toArray()
            .then(user => {
                if(user.length !== 0) {
                    res.end(JSON.stringify('This email or username has been already used.'))
                } else {
                    next()
                }
            })
            .catch(e => errorHandler.invalidCredentials)
    }, 
    authorization: (req, res, collection, next) => {
        jwt.verify(req.headers['authorization'], 'sectetKey', (err, payload) => {
            if(err) {
                console.log(err)
                res.writeHead(401)
                return res.end(JSON.stringify({ message: 'Unauthorized' }))
            }
            collection
                .find({_id: ObjectId(payload.id)})
                .toArray()
                .then(user => {
                    if(user.length === 0) {
                        res.writeHead(401)
                        res.end(JSON.stringify({ message: 'Unauthorized!' }))
                    }
                    next(user[0])
                })
                .catch(err => errorHandler.serverError(err, req, res))
        })
    }
}