module.exports = {
    serverError: (e, res) => {
        console.log(e)
        res.writeHead(500)
        res.end(JSON.stringify({status: 500, message: 'Server error'}))
    },
    invalidCredentials: (e, res) => {
        console.log(e)
        res.writeHead(401)
        res.end(JSON.stringify({status: 401, message: 'Invalid credentials'}))
    },
    notFound: (e, res) => {
        console.log(e)
        res.writeHead(404)
        res.end(JSON.stringify({status: 404, message: 'User not found'}))
    }
}