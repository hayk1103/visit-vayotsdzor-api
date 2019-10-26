const jwt = require('jsonwebtoken')
// const mongodb=require('mongodb')
const ObjectId=require('mongodb').ObjectId

module.exports ={
    authorization: (req, res, collection, next) => {
        jwt.verify(req.headers['authorization'], 'account', (err, payload) => {
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