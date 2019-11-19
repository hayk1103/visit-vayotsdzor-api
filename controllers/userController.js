const userModel = require('../models/user')

module.exports = {
    get: function (req, res) {
        return res.json({
            user: req.user
        })
    },
    getUser: function (req, res) {
        userModel
            .findOne({ username: req.query.username })
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