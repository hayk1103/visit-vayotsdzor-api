const activityModel = require('../models/activity')

module.exports = {
    create: function (req, res) {
        let filter = ''
        for (const key in req.body) {
            filter = filter + req.body[key]
        }
        console.log(filter)
        activityModel.create({
                ...req.body,
                likes: null,
                likesCount: 0,
                creator: req.user._id,
                filter: filter
            })
            .then( user => res.json({ user }))
            .catch(e => {
                throw new Error(e)
            })
    },
    getOne: function (req, res) {
        activityModel
            .findOne(
                { _id: req.query.activityId }
            )
            .then(activity => {
                if (!activity) throw new Error('Activity not found!')

                return res.json({ activity })
            })
            .catch(e => {
                throw new Error(e)
            })
    },
    update: function (req, res) {
        console.log(req.query.activityId)
        activityModel
            .updateOne(
                { _id:  req.query.activityId, creator: req.user._id },
                { $set: {
                    ...req.body
                }})
                .then((data) =>  res.json({ success: true }))
                .catch(e => {
                    throw new Error(e)
                })
    },
    delete: function (req, res) {
        activityModel
            .deleteOne({ _id: req.query.activityId, creator: req.user._id })
            .then(() => res.json({ success: true }))
            .catch(e  => {
                throw new Error(e)
            })
    },
    getAll: function (req, res) {
        activityModel
            .find()
            .then(activities => res.json({ activities }))
            .catch(e => {
                throw new Error(e)
            })
    },
    search: function (req, res) {
        activityModel
            .find({filter: { $regex: new RegExp(req.query.search, "i") }})
            .then(data => res.json({ data }))
            .catch(e => {
                throw new Error(e)
            })
    }
}