const activityModel = require('../models/activity')

module.exports = {
    create: function (req, res) {
        console.log(req.body)
        activityModel.create({
                ...req.body,
                likes: null,
                likesCount: 0,
                creator: req.user._id,
            })
            .then( user => res.json({ user }))
            .catch(e => {
                console.log(e)
                res.status(500).send(e)
            })
    },
    getOne: function (req, res) {
        activityModel
            .find(
                { _id: req.query.activityId }
            )
            .then(activities => res.json({ activities }))
            .catch( e => {
                console.log(e)
                res.status(500).send(e)
            })
    },
    update: function (req, res) {
        console.log(req.query.activityId)
        activityModel
            .updateOne(
                { _id:  req.query.activityId },
                { $set: {
                    ...req.body
                }})
                .then(() => res.json({ success: true }))
                .catch(e => res.status(500).send(e))
    },
    delete: function (req, res) {
        activityModel
            .deleteOne(
                { _id: req.query.activityId }
            )
            .then(() => res.json({ success: true }))
            .catch(e  => res.status(500).send(e))
    },
    getAll: function (req, res) {
        activityModel
            .find()
            .select('-__v')
            .then(activities => {
                return res.json({ activities })
            })
            .catch(e => res.status(500).send(e))
    }
}