module.exports = (req, res, next) => {
    let data = ''
    req.on('data', chunk => data += chunk.toString('utf-8'))
    req.on('end', () => {
        try {
            req.body = JSON.parse(data)
            next()
        } catch (e) {
            console.log(e)
            res.writeHead(500)
            res.end(JSON.stringify({ message: 'Invalid data' }))
        }
    })
}