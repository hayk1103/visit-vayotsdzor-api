const messageModel = require('../models/message')
module.exports = {
    add: function (req, res) {
        messageModel
            .create(req.data)
            .then(data => res.json({data}))
            .catch(console.log)
    },
    get: function (req, res) {
        messageModel
            .find({_id: req.query.id})
            .populate('users')
            .then(data => res.json({ data }))
            .catch((e) => {
                throw new Error(e)
            })
    } 
}