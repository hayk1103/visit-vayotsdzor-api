const messageModel = require('../models/message')
module.exports = {
    add: function (req, res, next) {
        messageModel
            .create({
                ...req.body,
                userId: req.user._id
            })
            .then(data => res.json({ data}))
            .catch(next)
    },
    get: function (req, res, next) {
        messageModel
            .find()
            .populate('userId', 'username')
            .then(message => res.json({ message }))
            .catch(next)
    } 
}