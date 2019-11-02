const http = require('http')
const MongoClient = require('mongodb').MongoClient
const authConstroller = require('./controllers/authController')
const activityController = require('./controllers/activityController')
const bodyParser = require('./middlewares/bodyParser')
const queryParser = require('./middlewares/queryParser')
// const useAuth = require('./middlewares/useAuth')

// 'mongodb+srv://AidaZaqaryan:tour-app-2019@visit-vayots-dzor-7zgnp.mongodb.net/visit-vayots-dzor'
MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true },  function (err, client) {
    if(err) {
        console.log(err)
        return
    }

    console.log('mongodb successfully connected!')

    const userCollection = client.db('tour-project').collection('users')
    const activityCollection = client.db('tour-project').collection('activity')

    http.createServer((req, res) => {
        queryParser(req)

        console.log(`${req.method} ${req.path}`)

        if(req.path === '/api/signup' && req.method === 'POST'){
            bodyParser(req, res, () => authConstroller.signup(req, res, userCollection))
        } else if(req.path == '/api/login' && req.method === 'POST') {
            bodyParser(req, res, () => authConstroller.login(req, res, userCollection))
        } else if(req.path === '/api/user') {
            if(req.method === 'GET'){
                authConstroller.get(req, res, userCollection)
            } else if(req.method === 'DELETE') {
                authConstroller.delete(req, res, userCollection)
            } else if(req.method === 'PUT') {
                bodyParser(req, res, () => authConstroller.update(req, res, userCollection))
            }
        } else if (req.path === '/api/image' && req.method === 'POST') {
            authConstroller.uploadImage(req, res, userCollection)
        }

        if (req.path === '/api/activity') {
            if(req.method === 'POST') {
                bodyParser(req, res, () => activityController.add(req, res, userCollection, activityCollection))
            } else if(req.method === 'GET') {
                activityController.getOne(req, res, activityCollection)
            } else if(req.method === 'PUT') {
                bodyParser(req, res, () => activityController.update(req, res, activityCollection))
            } else if(req.method === 'DELETE') {
                activityController.delete(req, res, activityCollection)
            } 
        } else if(req.path === '/api/activities' && req.method === 'GET') {
            activityController.getAll(req, res, activityCollection)
        }
    }).listen(3001, () => console.log('Server is listening on localhost:3001'))
})
