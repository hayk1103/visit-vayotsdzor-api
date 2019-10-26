const crypto=require('crypto')
const date=new Date().toISOString().split('T')[0]
const jwt = require('jsonwebtoken')
const ObjectId=require('mongodb').ObjectID
// const useAuth=require('../middlewares/useAuth')
module.exports = {
    post:(req,res,collection) => {
            let data = ''
            req.on('data', (chunk) => data += chunk.toString('utf-8'))
            req.on('end', () => {    
            data = JSON.parse(data)
            const passwordHash=crypto.createHash('md5').update(data.password).digest('hex')
            collection
                .find({$and:[{userName: data.userName}, {email: data.email}]})
                .toArray()
                .then((user)=>{
                    if(user.length !== 0){
                        console.log('user already registered')
                        res.end(JSON.stringify({message:'already registered'}))
                    }
                    console.log(user.length)
                    if(data.password !== data.passwordConfirmation){
                        console.log('invalid password')
                        res.end('invalid password')
                    }
                    else if(user.length === 0) {
                        collection.insertOne({
                            userName:data.userName,
                            fullName:data.fullName,
                            email:data.email,
                            password:passwordHash,
                            passwordConfirmation:passwordHash,
                            registeredAt: date
                        })
                        .then((data)=>{
                            res.end('success')
                        })
                        .catch(e=>console.log(e))
                    }
                })
                .catch(err=>{
                    console.log(err)
                    res.WriteHead(500,{status:500, message:'server error'})
                })
        })
    },
    login: (req, res, collection)=>{
        req.on('data', (chunk) => data += chunk.toString('utf-8'))
            let data=''
            req.on('end', () => {    
            data = JSON.parse(data)
            console.log(data.username, crypto.createHash('md5').update(data.password).digest('hex'))
            collection
            .find({
                $and: [
                    {username: data.username}, 
                    {password: crypto.createHash('md5').update(data.password).digest('hex')}
                ]
            })
            .toArray()
            .then((user)=>{
                if(user.length !==0 ) {
                    const token = jwt.sign({ id:user[0]._id }, 'account')
                    res.end(JSON.stringify({token}))
                }
                
                else if(user.length === 0){
                    res.end(JSON.stringify({message:'successfully created acccount'}))
                }
            })
            // console.log(user)
                .catch(err=>{
                console.log(err)
                res.end(JSON.stringify({message:'successfully created acccount'}))
            })

            })
    },
    get: (req,res,collection)=>{
        const query=req.url.split('?')[1].split('=')[1]
        collection
        .find({_id: ObjectId(query)})
        .toArray()
        .then((user)=>{
            for(let i=0;i<user.length;i++){
                let change=user[i]
                delete change.password
                delete change.passwordConfirmation
            }
            console.log(user)
            res.end(JSON.stringify({message:'user was found'}))
        })
        .catch(err=>{
            console.log(err)
            res.end(JSON.stringify({message:'error'}))
        })
    },
    delete: (req,res,collection)=>{
        const query=req.url.split('?')[1].split('=')[1]
        collection
        .deleteOne({_id: ObjectId(query)})
        .then((user)=>{
            console.log(user)
            res.end(JSON.stringify({message:"user was deleted!"}))
        })
        .catch(err=>{
            console.log(err)
            res.end(JSON.stringify({message:'error'}))
        })
    },
    update: function(req,res,collection){
                req.on('data', (chunk) => data += chunk.toString('utf-8'))
                let data=''
                req.on('end', () => {    
                data = JSON.parse(data)
                console.log(data)
                collection
                    .updateOne({_id: ObjectId(data._id)}, 
                        {$set: {
                            userName: data.userName,
                            fullName: data.fullName,
                            aboutMe:  data.aboutMe,
                            interests: data.interests,
                            profilePicture: data.profilePicture
                        }
                    })
                    .then(user => {
                        res.end('user info  updates')
                        // console.log(user)
                    })
          
                })
    }




}

