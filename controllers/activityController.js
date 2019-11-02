const ObjectId = require('mongodb').ObjectId

const errorHandler = require('../middlewares/errorHandler')
const useAuth = require('../middlewares/useAuth')

module.exports = {
    add: function (req, res, userCollection, collection) {
        useAuth.authorization(req, res, userCollection, user => {
            if(user) {
                collection
                    .insertOne({
                        location: req.body.location.split(' '),
                        image: req.body.image,
                        description: req.body.description,
                        tags: req.body.tags.split(' '),
                        gallery: req.body.gallery.split(' '),
                        likes: null,
                        likesCount: 0,
                        creator: user._id,
                        category: req.body.category.split(' ')
                    })
                    .then(data => {
                        res.end(JSON.stringify({message: 'Activity successfully adds.', id: data.ops[0]._id}))
                    })
                    .catch(err => errorHandler.serverError(err, res))
            } else {
                res.end(JSON.stringify({message: 'User was deleted.'}))
                return
            }
        })
    },
    getOne: function (req, res, collection) {
        collection
            .find({_id: ObjectId(req.query.id)})
            .toArray()
            .then(data => {
                res.end(JSON.stringify({activity: data[0]}))
            })
            .catch( err => errorHandler.serverError(err, res))
    },
    update: function (req, res, collection) {
        collection
            .updateOne({_id:  ObjectId(req.query.id)},
                { $set: {
                    location: req.body.location.split(' '),
                    image: req.body.image,
                    description: req.body.description,
                    tags: req.body.tags.split(' '),
                    gallery: req.body.gallery.split(' '),
                    // likes: user._id,
                    // likesCount: 0,
                    // creator: user._id,
                    category: req.body.category.split(' ')
                }})
                .then(data => {
                    res.end(JSON.stringify({message: 'Activity successfully updates.'}))
                })
                .catch(err => errorHandler.serverError(err, res))
    },
    delete: function (req, res, collection) {
        collection
            .deleteOne({_id: ObjectId(req.query.id)})
            .then(data =>{
                res.end(JSON.stringify({message: 'Activity successfully deletes.'}))
            })
            .catch(err => errorHandler.serverError(err, res))
    },
    getAll: function (req, res, collection) {
        collection
            .find({})
            .toArray()
            .then(data => {
                res.end(JSON.stringify(data.map(item => (item))))
            })
            .catch(err => errorHandler.serverError(err, res))
    }
}