const http = require('http')
const MongoClient=require('mongodb').MongoClient
const url='mongodb+srv://Nona:programming98@vayotsdzor-avvkl.mongodb.net/test?retryWrites=true&w=majority'
// const dbname='VayotsDzor'
MongoClient.connect(url,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}, function(err,client){
    if(err){
        console.log(err)
        return
    }
    console.log('server has been connected')
    const dbname='VayotsDzor'
    const db=client.db(dbname)
    const collection=db.collection('users')
    const activityCollection = client.db('VayotsDzor').collection('activity')
//midllewares
const useQueryParser=require('./middlewares/useQueryParser')
// const usebodyParser=require('./middlewares/useBodyParser')
// const useAuth=require('./middlewares/useAuth')


//Contollers
const userController=require('./Controllers/userController')
const fileController =require('./Controllers/fileContoller')
const activityController =require('./Controllers/activityController')

const server=http.createServer((req,res) => {
    res.setHeader('content-type', 'application/json')
    useQueryParser(req)
    if(req.path === '/api/signUp'){
        if(req.method === 'POST'){
            return userController.post(req,res,collection) 
        }
    }
    else if(req.path === '/api/login' && req.method === 'POST'){
        return userController.login(req,res,collection)
    }
    else if(req.path === '/api/user' && req.method === 'GET'){
         return userController.get(req,res, collection)
    }
    else if(req.path === '/api/image' && req.method === 'POST'){
        return fileController.upload(req,res)
    }
    else if(req.path === '/api/user' && req.method === 'DELETE'){
         return userController.delete(req,res,collection)
    }
    else if(req.path === '/api/user' && req.method === 'PUT'){
        return userController.update(req,res,collection)
    }
    if(req.path === '/api/activity'){
        if(req.method === "POST"){
            return activityController.add(req,res,activityCollection,collection)
        //    return activityController.add(req, res, collection, activityCollection)
        }
        else if(req.method === 'GET'){
            return activityController.get(req,res,activityCollection,collection )
        }
        else if(req.method === 'PUT'){
            return activityController.update(req,res,activityCollection,collection)
        }
        else if(req.method === 'DELETE'){
            return activityController.delete(req,res,activityCollection,collection)
        }
        else if(req.path === '/api/activities' && req.method === 'GET') {
            activityController.getAll(req, res, activityCollection,collection)
        }
      
    }
    })

    

server.listen(3000,() =>{
    console.log('server has been listening on Port 3000')
})
})

