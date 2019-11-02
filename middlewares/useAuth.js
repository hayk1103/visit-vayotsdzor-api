const jwt = require('jsonwebtoken')
const env = require('../env')
const userModel = require('../models/user')

module.exports = (req, res, next) => {
    jwt.verify(req.headers['authorization'].replace('Bearer ', ''), env.secret, (err, payload) => {
        if(err || !payload._id) return res.status(401).json({ message: 'Unauthorized' })

        userModel
            .findOne({ _id: payload._id })
            .then(user => {
                console.log(user)
                if (!user) {
                    return res.status(401).json({ message: 'Unauthorized' })
                }

                req.user = user
                return next()
            })
            .catch(e => res.status(500).send(e))
    })
}