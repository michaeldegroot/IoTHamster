const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const debug = require('debug')('iothamster:auth')

const jwt = require('./jwt')

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
      secretOrKey: jwt.secret
    },
    function(jwt_payload, done) {
      debug.auth('VERIFY EXIST DB?', jwt_payload)
      done()
    }
  )
)
