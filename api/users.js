const router = require('express').Router();
const validation = require('../lib/validation');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

var getDistributionsByUserId = require('./distributors').getDistributionsByUserId;

const privatekey = 'damn_it_spock_im_a_doctor_not_a_developer';
const saltRounds = 8;

/*
 * Schema describing required/optional fields of a user object.
 */
const userSchema = {
    username: { required: true },
    email: { required: true },
    hashword: { required: false }
};


/*
 * Helper to authenticate user
 * Params: username, hashed+salt password
 * Returns: token if user logged in
 *          null if token invalid, user not logged in, or no user with token exists
 */
function authUser(req, res, next) {
    if (req.token !== null) { // Existing token
        let payload = loggedIn(req.token);

        if (payload !== null) { // && payload.exp > new Date().getTime()) {
            req.tokenPayload = payload;
            next();
        } else {
            res.status(401).send("You are not logged in!");
        }
    } else {
        res.status(403).send("No token provided");
    }
}


/* 
 * Helper to generate auth token
 * Params: user object
 */
function getAuthToken(user) {
    return new Promise((resolve, reject) => {
        if (!user) { reject(null); }

        // New token
        let payload = {
            sub: user._id.toHexString(),
            name: user.username,
            iat: new Date().getTime()
        };

        let token = jwt.sign(payload, privatekey, { expiresIn: 60 * 60 * 24 });

        resolve(token);
    });
}


/*
 * Helper to see how long a user has left
 * Params: JWT token
 * Returns: payload if user logged in (token valid)
 *          null if user logged out (token invalid)
 */
function loggedIn(token) {
    let payload = null;
    try {
        payload = jwt.verify(token, privatekey);
    } catch (err) {
        return null;
    }
    return payload;
}


/*
 * Helper to log a user in with JWT
 * Params: username
 * Returns: New JWT token or existing token
 * Returns: -1 if user does not exist
 *          token if user is authenticated and logged in
 *          null if user is not authenticated
 */
function loginUser(user, raw_password, mongoDB) {
    return bcrypt.compare(raw_password, user.hashword)
        .then((res) => {
            if (res) {
                return getAuthToken(user)
                    .then((token) => {
                        if (loggedIn(token)) {
                            return Promise.resolve(token); // Authenticated, logged in
                        } else {
                            return Promise.resolve(null); // Authenticated, logged out    
                        }
                    })
                    .catch((err) => {
                        return Promise.resolve(err);
                    });
            } else {
                return Promise.resolve(null); // Bad comparison
            }
        })
        .catch((err) => {
            return Promise.reject(err); // Something went wrong
        });
}


/*
 * Helper to get a user from MongoDB
 * Params: Username
 * Returns User Object if user exists
 *         null if no user is found
 */
function getUserByUsername(username, mongoDB) {
    if (username && mongoDB) {
        const usersCollection = mongoDB.collection('users');

        return new Promise((resolve, reject) => {
            return resolve(usersCollection.findOne({ username: username }));
        });
    }
    return Promise.reject('No username given');
}


/* 
 * Helper to add a user to MongoDB
 * Params: User Object
 * Returns: boolean success
 */
function addUser(user, mongoDB) {
    const usersCollection = mongoDB.collection('users');

    const userDocument = {
        username: user.username,
        email: user.email
    };

    return bcrypt.hash(user.password, saltRounds)
        .then((hash) => {
            // Update hashed password
            userDocument.hashword = hash;
            return usersCollection.insertOne(userDocument);
        })
        .then((result) => {
            return Promise.resolve(result);
        });
}




/*
 * Route to register a new user
 */
router.post('/', function(req, res) {
    if (validation.validateAgainstSchema(req.body, userSchema)) {
        const mongoDB = req.app.locals.mongoDB;

        addUser(req.body, mongoDB)
            .then((result) => {
                res.status(201)
                    .json({
                        _id: result.insertedId,
                        links: {
                            user: `/users/${result.ops[0].username}`
                        }
                    });
                return;
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Failed to insert new user: " + err
                });
                return;
            });
    } else {
        res.status(400).json({
            error: "Request doesn't contain a valid user."
        });
        return;
    }
});


/*
 * Route for a user to login
 */
router.post('/login', function(req, res) {
    if (req.body.username && req.body.password) {

        getUserByUsername(req.body.username, req.app.locals.mongoDB)
            .then((user) => {
                if (user) {
                    loginUser(user, req.body.password)
                        .then((token) => {
                            if (token) {
                                res.status(200).json({
                                    token: token
                                });
                                return;
                            } else {
                                res.status(401).send("Could not log user in");
                            }
                        })
                        .catch((err) => {
                            res.status(400).send("Error logging in: " + err);
                        });
                } else {
                    res.status(400).send("User not found:" + req.body.username);
                }
            })
            .catch((err) => {
                res.status(400).send(err);
            });
    } else {
        res.status(400).json({
            error: "Invalid username or password."
        });
        return;
    }
});


/*
 * User must be authorized from here and beyond
 */
router.use(authUser);


/*
 * Route to get a specific user
 */
router.get('/:username', function(req, res) {
    if (req.params.username) {
        if (req.tokenPayload.name == req.params.username) {
            getUserByUsername(req.params.username, req.app.locals.mongoDB)
                .then((userDocument) => {
                    res.status(201).json({
                        user: userDocument
                    });
                    return;
                })
                .catch((err) => {
                    res.status(500).json({
                        error: "Failed to get user." + err
                    });
                    return;
                });
        } else {
            res.status(401).json({ error: "You are not authorized to view this resource." });
        }
    } else {
        res.status(400).json({ error: "Request doesn't contain a valid username." });
    }
});


/*
 * Route to list all of a user's distribution centers.
 */
router.get('/:username/distributors', function(req, res) {
    const mysqlPool = req.app.locals.mysqlPool;

    if (req.params.username) {
        if (req.tokenPayload.name == req.params.username) {
            getUserByUsername(req.params.username, req.app.locals.mongoDB)
                .then((user) => {
                    getDistributionsByUserId(user._id.toHexString(), mysqlPool)
                        .then((businesses) => {
                            if (businesses) {
                                res.status(200).json({ businesses: businesses });
                            } else {
                                next();
                            }
                        })
                        .catch((err) => {
                            res.status(500).json({
                                message: "Unable to fetch distributors. Please try again later.",
                                error: err
                            });
                        });
                })
                .catch((err) => {
                    res.status(400).send(err);
                });
        } else {
            res.status(401).json({ error: "You are not authorized to view this resource." });
        }
    } else {
        res.status(400).json({ error: "Request doesn't contain a valid username." });
    }
});


exports.router = router;