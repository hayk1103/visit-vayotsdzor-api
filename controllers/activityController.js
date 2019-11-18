const activityModel = require('../models/activity')

module.exports = {
    create: function (req, res) {
        activityModel.create({
                ...req.body,
                likes: null,
                likesCount: 0,
                creator: req.user._id,
                filter: `${req.body.title} ${req.body.description} ${req.body.tags} ${req.body.category}`
            })
                .then( user => res.json({ user }))
            .catch(e => {
                throw new Error(e)
                })
    },
    getOne: function (req, res, next) {
        activityModel
            .findOne({ _id: req.query.activityId })
            .populate('creator', 'username avatar')
            .then(activity => {
                if (!activity) throw new Error('Activity not found!')

                return res.json({ activity })
            })
            .catch(next)
    },
    update: function (req, res) {
        activityModel
            .updateOne(
                { _id:  req.query.activityId, creator: req.user._id },
                {
                    $set: {
                        ...req.body,
                        filter: `${req.body.title} ${req.body.description} ${req.body.tags} ${req.body.category}`
                    }
                }
            )
                .then((data) =>  res.json({ success: true }))
                .catch(e => {
                    throw new Error(e)
                })
    },
    delete: async function (req, res, next) {
        try {
            await activityModel.deleteOne({ _id: req.query.activityId, creator: req.user._id })
            return res.json({ success: true })
        } catch (e) {
            return next(e)
        }
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