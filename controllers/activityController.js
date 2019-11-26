const activityModel = require('../models/activity')

module.exports = {
    create: function (req, res, next) {
        activityModel.create({
                ...req.body,
                likes: null,
                likesCount: 0,
                creator: req.user._id,
                filter: `${req.body.title} ${req.body.description} ${req.body.tags} ${req.body.category}`
            })
            .then( user => res.json({ user }))
            .catch(next)
            activityModel.createIndexes({"filter": "text"})
                // then(data => console.log(data))
                // .catch(next)
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
    update: function (req, res, next) {
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
                .catch(next)
    },
    updateLike: function (req, res, next) {
        if(!req.body.like) {
            activityModel.update(
                {
                    _id: req.query.activityId, 
                    likes: { $ne: req.user._id }
                },
                {
                    // $inc: { likeCount: 1 },
                    $push: { likes: req.user._id}
                }
            )
            .then(data => res.json({ liked: true}))
            .catch(next)
        }
         else if(req.body.like) {
            activityModel.update(
                {
                    _id: req.query.activityId, 
                    likes: {$eq: req.user._id} 
                },
                {
                    // $inc: { likeCount: -1 },
                    $pull: { likes: req.user._id } 
                }
            )
            .then(data => res.json({ liked: false}))
            .catch(next)
        }
    }, 
    delete: async function (req, res, next) {
        try {
            await activityModel.deleteOne({ _id: req.query.activityId, creator: req.user._id })
            return res.json({ success: true })
        } catch (e) {
            return next(e)
        }
    },
    getAll: function (req, res, next) {
        activityModel
            .find()
            .then(activities => res.json({ activities }))
            .catch(next)
    },
    search: function (req, res, next) {
        activityModel
            .find({ $text: { $search: new RegExp(req.query.search, "i") }})
            .then(data => {
                res.json({ data })
                console.log(data)
            })
            .catch(next)
    }
}