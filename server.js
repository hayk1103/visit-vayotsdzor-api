const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const env = require('./env')
const upload = require('./middlewares/upload')

// middlewares
const useAuth = require('./middlewares/useAuth')

// controllers
const authController = require('./controllers/authController')
// const activityController = require('./controllers/activityController')

const app = express()

mongoose.connect(env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(cors())
app.use(express.json())

app.post('/api/image', [useAuth, upload.single('image')], (req, res) => {
    console.log(req.file)

    return res.json({ file: req.file })
})

app.post('/api/signup', authController.signup)
app.post('/api/login', authController.login)

app.get('/api/user', useAuth, authController.get)
// app.delete('/api/user', authController.delete)
// app.put('/api/user', authController.update)

// app.get('/api/activity', activityController.getOne)
// app.post('/api/activity', activityController.add)
// app.put('/api/activity', activityController.update)
// app.delete('/api/activity', activityController.delete)

app.listen(3001, () => console.log('Server is listening on localhost:3001'))