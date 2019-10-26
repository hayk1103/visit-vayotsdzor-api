const fs=require('fs')
const randomstring=require('randomstring')
const {IncomingForm}=require('formidable')
module.exports={
    upload: (req,res)=>{
        if(req.headers['content-type'].startsWith('multipart/form-data')){
            const form=new IncomingForm()
            form.uploadDir='./Storage'
            form.keepExtensions=true

            form.parse(req, (err,fields,files)=>{
                res.write('file uploaded')
                res.end(JSON.stringify({
                    path:files.image.path
                }))
            })
        }
           else if(req.headers['content-type'] === 'application/octet-stream'){
               if(!req.query.extension){
                   res.writeHaed(500)
                   return res.end(JSON.stringify({ message: 'Extension is required!' }))
               }
               const data = []
            req.on('data', chunk => data.push(chunk))
            req.on('end', () => {
                const path = `Storage/upload_${new Date().getTime()}-${randomstring.generate(6)}.${req.query.extension}`
                fs.writeFileSync(`./${path}`, Buffer.concat(data))
                res.end(JSON.stringify({ path }))
            })
           }
    }
}