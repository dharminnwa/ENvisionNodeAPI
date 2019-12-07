var config = require('config');
let jwt = require('jsonwebtoken');
const jwtBlacklist = require('jwt-blacklist')(jwt);
module.exports =
    {

        GenerateTokan: function (profile, expiresIn) {
            return jwt.sign(profile, config.JWTTokenKey.secret, { expiresIn: expiresIn });
        },
        CheckToken: function (req, res, next) {
            let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
            if (token) {
                jwt.verify(token, config.JWTTokenKey.secret, (err, token_data) => {
                    if (err) {
                        return res.json({
                            Authorization_success: false,
                            // message: 'Authentication is required'
                            message: err.message
                        });
                    }
                    else {
                        req.token_data = token_data;
                        //var userId = token_data.username;
                        next();
                    }
                });
            } else {
                return res.status(403).send({
                    Authorization_success: false,
                    message: 'Invalid Authentication!!'
                });
            }
        },
        blacklist: function (token, res, next) {
            if (token) {
                jwtBlacklist.blacklist(token);
            }
        }
    };