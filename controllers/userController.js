const userModel = require('../models/user')

module.exports = {
    get: function (req, res) {
        return res.json({
            user: req.user
        })
    },
    getUser: function (req, res, next) {
        userModel
            .findOne({ username: req.query.username })
            .then(user => res.json({ user }))
            .catch(next)
    },
    update: function (req, res, next) {
        ['_id', '_v', 'createdAt', 'updatedAt', 'password', 'email'].forEach(field => delete req.body[field]) 

        userModel
            .updateOne(
                { _id: req.user._id },
                { $set: req.body }
            )
            .then(() => res.json({ success: true }))
            .catch(next)
    },
    delete: function (req, res, next) {
        userModel
            .deleteOne(
                { _id: req.user._id }
            )
            .then(() =>  res.json({ success: true }))
            .catch(next)
    },
    search: function (req, res, next) {
        userModel
            .find({ $or: 
                [
                    {username: { $regex: new RegExp(req.query.search, "i") }},
                    {fullName: { $regex: new RegExp(req.query.search, "i") }}
                ]
            })
            .then(data => res.json({ data }))
            .catch(next)
    }
}