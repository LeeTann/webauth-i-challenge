const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)

const db = require('./data/dbConfig')
const Users = require('./data/helpers/usersModel')

const server = express()

const sessionConfig = {
    name: 'monkey',
    secret: 'keep it secret, keep it safe!',
    cookie: {
        maxAge: 1000 * 60 * 60, // in ms
        secure: false, // used over https only
    },
    httpOnly: true, // cannot access the cookie from js using document.cookie
    resave: false,
    saveUninitialized: false, //GDPR law against setting cookies automatically

    store = new KnexSessionStore({
        knex: db,
        tablename: 'sessions',
        sidfieldname: 'sid',
        createTable: true,
        clearInterval: 1000 * 60 * 60,
    })
}

server.use(helmet())
server.use(express.json())
server.use(cors())
server.use(session(sessionConfig))

server.get('/', (req, res) => {
    req.session.name = 'Donkey Kong'
    res.send("it's working, it's working!!!")
})

server.get('/greet', (req, res) => {
    const name = req.session.name
    res.send(`hello ${name}`)
})

server.post('/api/register', (req, res) => {
    const user = req.body
    const hash = bcrypt.hashSync(user.password, 16) //generate hash from user's password

    user.password = hash // override user.password with hash

    Users.add(user).then(savedUser => {
        req.session.user = savedUser
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
                req.session.user = user
                res.status(200).json({ message: `Welcome young master ${user.username}`})
            } else {
                res.status(401).json({ message: 'You shall not pass'})
            }
        })
        .catch(error => {
            res.status(500).json(error)
        })
})

function restricted(req, res, next) {
    const { username, password } = req.headers

    if (username && password) {
        Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                next()
            } else {
                res.status(401).json({ message: 'You shall not pass!?!?!'})
            }
        })
        .catch(error => {
            res.status(500).json({ message: 'Unexpected error'})
        })
    } else {
        res.status(400).json({ message: 'No credentials provided'})
    }
}

server.get('/api/users', restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users)
        })
        .catch(error => {
            res.status(500).json(error)
        })
})

server.get('/users', async (req, res) => {
    try {
        const users = await Users.find()
        res.status(200).json(users)
    } catch(error) {
        res.send(error)
    }
})

server.get('/api/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(error => {
            if (error) {
                res.send("you can checkout anytime you like, but you can never leave...")
            } else {
                res.send("Bye, you are logged out.")
            }
        })
    } else {
        res.send({ message: "uh oh"})
    }
})

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
