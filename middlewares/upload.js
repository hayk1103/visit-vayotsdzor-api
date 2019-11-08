const multer = require('multer')
const mime = require('mime')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

module.exports = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            console.log(path)
            let dest = path.join('storage/')
            console.log(dest)
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest)
            }
            
            cb(null, dest)
        },
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, raw) => {
                if (err) {
                    cb(null, err)
                    return
                }

                cb(null, `${raw.toString('hex')}${Date.now()}.${mime.getExtension(file.mimetype)}`)
            })
        }
    })
})