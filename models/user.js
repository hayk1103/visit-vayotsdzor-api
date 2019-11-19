const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Username field is required!']
    },
    email: {
        type: String,
        required: [true, 'E-Mail field is required!'],
        unique: true,
        validate: {
            validator: (value) => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value),
            message: 'Email validation failed'
        }
    },
    password: String,
    fullName: String,
    aboutMe: String,
    interests: String,
    avatar: String,
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)