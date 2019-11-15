const messageModel = require('../models/message')
module.exports = {
    add: function (data) {
        messageModel
            .create(data)
            .then(data => console.log({data}))
            .catch(console.log)
    },
    get: function (req, res) {
        messageModel
            .find()
            // .populate('users')
            .then(message => res.json({ message }))
            .catch((e) => {
                throw new Error(e)
            })
    } 
}