const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const env = require('./env')
const upload = require('./middlewares/upload')

// middlewares
const useAuth = require('./middlewares/useAuth')
const socket = require('./middlewares/socket')

// controllers
const authController = require('./controllers/authController')
const activityController = require('./controllers/activityController')
const messageController = require('./controllers/messageConroller')

const app = express()

mongoose.connect(env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use('/storage', express.static('storage'))

app.post('/api/image', [useAuth, upload.single('image')], (req, res) => res.json({ file: req.file }))

app.post('/api/signup', authController.signup)
app.post('/api/login', authController.login)
// user router
app.get('/api/user', useAuth, authController.get)
app.get('/api/other/user', useAuth, authController.getUser)
app.put('/api/user', useAuth, authController.update)
app.delete('/api/user', useAuth, authController.delete)
// activity router
app.get('/api/activity',  activityController.getOne)
app.get('/api/activities', activityController.getAll)
app.post('/api/activity', useAuth, activityController.create)
app.put('/api/activity', useAuth, activityController.update)
app.delete('/api/activity', useAuth, activityController.delete)
// search router
app.get('/api/activity/search', activityController.search)
app.get('/api/user/search', useAuth, authController.search)
//messsage router
app.post('/api/messages', [useAuth, socket], messageController.add)
app.get('/api/messages', [useAuth, socket], messageController.get)

app.use((err, req, res, next) => {
    console.log(err)
    console.log('server error')
    return res.status(500).json({ message: err.message || 'Server Error' })
})

app.listen(3001, () => console.log('Server is listening on localhost:3001'))