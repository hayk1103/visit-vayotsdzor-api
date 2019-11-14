const app = require('express')()
const http = require('http')
const socketio = require('socket.io')

const server = http.createServer(app)
const io = socketio(server)

module.exports = (req, res, next) => {
    io.on('connection', (socket) => {
        console.log('someone connected')
        socket.on('message', (data) => {
            console.log(data)
            io.emit('new message', data)
            req.data = data
            return next()
        })
    })
}