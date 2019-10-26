const ObjectId = require('mongodb').ObjectId
// const useAuth = require('../middlewares/useAuth')
    module.exports = {
    add: (req,res,collection)=>{
            let data = ''
            req.on('data', (chunk) => data += chunk.toString('utf-8'))
            req.on('end', () => {    
            data = JSON.parse(data)
            collection
            .insertOne({
                location:data.location,
                image:data.image,
                description:data.description,
                tags:data.tags,
                gallery:data.gallery,
                likes:null,
                likesCount:0,
                creator:data._id,
                category:data.category
            })
            .then((user)=>{
                res.end('activity adds')
                res.end(JSON.stringify({message:"activity adds"}))
            })
            .catch(err=>{
                console.log(err)
                res.end(JSON.stringify({message:"error"}))
            })
            })
        },
    get:(req,res,collection)=>{
        const query=req.url.split('?')[1].split('=')[1]
        collection
        .find({_id: ObjectId(query)})
        .toArray()
        .then((user)=>{
            console.log(user)
            res.end(JSON.stringify({message:'activity was found'}))
        })
        .catch(err=>{
            console.log(err)
            res.end(JSON.stringify({message:'error'}))
        })
        },
    update:(req,res,collection)=>{
        req.on('data', (chunk) => data += chunk.toString('utf-8'))
                let data=''
                req.on('end', () => {    
                data = JSON.parse(data)
                console.log(data)
                collection
                    .updateOne({_id: ObjectId(data._id)}, 
                        {$set: {
                            location: data.location,
                            image:data.image, 
                            description:data.description,
                            tags:data.tags, 
                            gallery: data.galery,
                            category: data.category
                        }
                    })
                    .then(user => {
                        res.end('activity info  updates')
                        // console.log(user)
                    })
                    .catch(err=>{
                        console.log(err)
                    })
                })
    },
    delete: (req,res,collection)=>{
        const query=req.url.split('?')[1].split('=')[1]
        collection
        .deleteOne({_id: ObjectId(query)})
        .then((user)=>{
            console.log(user)
            res.end(JSON.stringify({message:"activity was deleted!"}))
        })
        .catch(err=>{
            console.log(err)
            res.end(JSON.stringify({message:'error'}))
        })
    },
    getAll:(req,res,collection)=>{
        collection
            .find({})
            .toArray()
            .then(data => {
                res.end(JSON.stringify(data.map(item => (item))))
            })
            .catch(err=>console.log(err))
    }

}


// module.exports = {
//     add: function (req, res, activityCollection, collection) {
//         let data = ''
//             req.on('data', (chunk) => data += chunk.toString('utf-8'))
//             req.on('end', () => {    
//             data = JSON.parse(data)
//         useAuth.authorization(req, res, collection, user => {
//             if(user) {
//                 collection
//                     .insertOne({
//                         location: req.body.location.split(' '),
//                         image: req.body.image,
//                         description: req.body.description,
//                         tags: req.body.tags.split(' '),
//                         gallery: req.body.gallery.split(' '),
//                         likes: null,
//                         likesCount: 0,
//                         creator: user._id,
//                         category: req.body.category.split(' ')
//                     })
//                     .then(data => {
//                         res.end(JSON.stringify({message: 'Activity successfully adds.', id: data.ops[0]._id}))
//                         console.log(data)
//                     })
//                     .catch(err => console.log(err))
//             } else {
//                 res.end(JSON.stringify({message: 'User was deleted.'}))
//                 return
//             }
//         })
//     })
//     }
// }
