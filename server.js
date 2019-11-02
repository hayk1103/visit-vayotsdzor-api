const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// controllers
const authController = require('./controllers/authController')
// const activityController = require('./controllers/activityController')

const app = express()

// 'mongodb+srv://AidaZaqaryan:tour-app-2019@visit-vayots-dzor-7zgnp.mongodb.net/visit-vayots-dzor'
mongoose.connect('mongodb://localhost:27017/visit-vayots-dzor', { useNewUrlParser: true, useUnifiedTopology: true })

app.use(express.json())
app.use(cors())

// implement image upload using multer

app.post('/api/signup', authController.signup)
app.post('/api/login', authController.login)

// app.get('/api/user', authController.get)
// app.delete('/api/user', authController.delete)
// app.put('/api/user', authController.update)

// app.get('/api/activity', activityController.getOne)
// app.post('/api/activity', activityController.add)
// app.put('/api/activity', activityController.update)
// app.delete('/api/activity', activityController.delete)

app.listen(3001, () => console.log('Server is listening on localhost:3001'))