const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title field is required!']
    },
    location: {
        type: [Number],
        required: [true, 'Location field is required!']
    },
    image: {
        type: String,
        required: [true, 'Image field is required!']
    },
    description: {
        type: String,
        required: [true, 'Description field is required!']
    },
    tags: String,
    gallery: [String],
    category: String,
    likes: mongoose.Schema.Types.Mixed,
    likesCount: {
        type: Number,
        default: 0
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, 
    filter: String
}, {
    timestamps: true
})

activitySchema.index({ filter: 1 })
activitySchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' })

module.exports = mongoose.model('Activity', activitySchema)