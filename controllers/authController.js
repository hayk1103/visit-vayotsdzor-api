const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const env = require('../env')
const userModel = require('../models/user')

module.exports = {
    signup: function(req, res, next) {
        // if(req.body.password !== req.body.confirmPassword) {
        //     return res.status(500).json({ message: 'Password does not match' })
        // }
        userModel.create({
            ...req.body,
            password: crypto.createHash('md5').update(req.body.password).digest('hex'),
            registerDate: new Date
        }).then(user => {
            return res.json({ user })
        }).catch(next)
    },
    login: function (req, res, next) {
        userModel
            .findOne({
                username: req.body.username,
                password: crypto.createHash('md5').update(req.body.password).digest('hex')
            })
            .then((user) => {
                console.log(user)
                if (!user) {
                    return res.status(500).json({ message: 'invalid username or password!' })
                }
                return res.json({
                    token: jwt.sign({ _id: user._id }, env.secret)
                })
            })
            .catch(next)
    },
    facebook: async (req, res, next) => {
        try {
            const response = await axios.get('https://graph.facebook.com/v5.0/oauth/access_token', {
                params: {
                    code: req.body.code,
                    client_id: env.facebook.clientId,
                    client_secret: env.facebook.clientSecret,
                    redirect_uri: 'http://localhost:3000/'
                }
            })

            const user = await axios.get('https://graph.facebook.com/v5.0/me', {
                params: {
                    access_token: response.data.access_token,
                    fields: 'email,id,name'
                }
            })

            let profile = await userModel.findOne({ facebookId: user.data.id })

            if (!profile) {
                profile = await userModel.create({
                    facebookId: user.data.id,
                    username: user.data.email,
                    email: user.data.email,
                    fullName: user.data.name
                })
            }

            return res.json({ token: jwt.sign({ _id: profile._id }, env.secret) })
        } catch (e) {
            next(e)
        }
    },
    google: async (req, res) => {
        if (req.method === 'GET') {
            return res.json({
                redirectUri: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.google.clientId}&redirect_uri=${env.google.redirectUri}&response_type=code&scope=profile email`
            })
        }

        try {
            const response = await axios.post('https://oauth2.googleapis.com/token', null, {
                params: {
                    'client_id': env.google.clientId,
                    'client_secret': env.google.clientSecret,
                    'redirect_uri': env.google.redirectUri,
                    'grant_type': 'authorization_code',
                    'code': decodeURIComponent(req.body.code)
                }
            })

            const data = jwt.decode(response.data.id_token)

            let explorer = await Explorer.findOne({
                $or: [
                    { google_id: data.sub },
                    { email: data.email }
                ]
            })

            if (explorer) {
                explorer.google_id = data.sub
                await explorer.save()
            } else {
                explorer = await Explorer.create({
                    google_id: data.sub,
                    email: data.email,
                    full_name: data.name,
                    profile_picture: data.picture
                })
            }

            return res.json({
                token: jwt.sign({ id: explorer._id }, env.secret, { expiresIn: '7d' })
            })
        } catch (e) {
            throw new Error(e)
        }
    },
    apple: async (req, res) => {
        if (req.method === 'GET') {
            return res.json({
                redirectUri: `https://appleid.apple.com/auth/authorize?redirect_uri=${env.apple.redirectUri}&response_type=code&client_id=${env.apple.clientId}&scope=email+name&response_mode=form_post`
            })
        }

        if (req.headers['x-authorization']) {
            // verify apple token
            const data = jwt.decode(req.body.code)

            let explorer = await Explorer.findOne({ email: data.email })

            if (explorer) {
                explorer.apple_id = data.sub
                await explorer.save()
            } else {
                explorer = await Explorer.create({
                    apple_id: data.sub,
                    email: data.email
                })
            }

            return res.json({
                token: jwt.sign({ id: explorer._id }, env.secret, { expiresIn: '7d' })
            })
        }

        try {
            const clientSecret = jwt.sign({
                iss: 'JSADNJNAJSDNJ',
                aud: 'https://appleid.apple.com',
                sub: 'com.test.go'
            }, fs.readFileSync('keys/key.txt'), {
                algorithm: 'ES256',
                expiresIn: '24h',
                header: {
                    kid: 'MN88A289Z5'
                }
            })

            const response = await axios.post('https://appleid.apple.com/auth/token', querystring.stringify({
                client_id: 'com.test.go',
                client_secret: clientSecret,
                code: req.body.code,
                grant_type: 'authorization_code',
                redirect_uri: 'https://tinder-api.st.rad.travel/api/auth/apple'
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })

            return res.redirect(301, `https://tinder.st.rad.travel?code=${response.data.id_token}&apple=true`)
        } catch (e) {
            throw new Error(e)
        }
    },
}