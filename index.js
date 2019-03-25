const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bcrypt = require('bcryptjs')

const db = require('./data/dbConfig')
const Users = require('./data/helpers/usersModel')

const server = express()

server.use(helmet())
server.use(express.json())
server.use(cors())

server.get('/', (req, res) => {
    res.send("it's working, it's working!!!")
})

server.post('/api/register', (req, res) => {
    const user = req.body
    const hash = bcrypt.hashSync(user.password, 16)

    user.password = hash

    Users.add(user).then(savedUser => {
        res.status(201).json(savedUser)
    }).catch(error => {
        res.status(500).json(error)
    })
})

server.post('/api/login', (req, res) => {
    const { username, password } = req.body

    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                res.status(200).json({ message: `Welcome young master ${user.username}`})
            } else {
                res.status(401).json({ message: 'You shall not pass!'})
            }
        })
        .catch(error => {
            res.status(500).json(error)
        })
})

server.get('/api/users', (req, res) => {
    Users.find()
        .then(users => {
            res.json(users)
        })
        .catch(error => {
            res.status(500).json(error)
        })
})

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
