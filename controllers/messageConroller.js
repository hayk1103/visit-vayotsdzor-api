const messageModel = require('../models/message')
module.exports = {
    add: function (req, res) {
        messageModel
            .create({
                ...req.body,
                userId: req.user._id
            })
            .then(data => console.log({ data}))
            .catch(console.log)
    },
    get: function (req, res) {
        messageModel
            .find()
            .populate('userId', 'username')
            .then(message => res.json({ message }))
            .catch((e) => {
                throw new Error(e)
            })
    } 
}