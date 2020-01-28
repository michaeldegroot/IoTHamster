const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const debug = require('debug')('iothamster:auth')

class Passport {
  constructor() {
    this.passport = require('passport')
  }

  async start(modules) {
    this.passport.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
          secretOrKey: modules.jwt.secret,
          passReqToCallback: true
        },
        async (req, payload, done) => {
          await modules.database.knex('logs').insert([
            {
              event: 'JwtStrategy',
              log: `device ${payload.device} requested ${req.originalUrl} and authenticated with jwt`,
              createdAt: Date.now()
            }
          ])
          done(null, {})
        }
      )
    )

    this.passport.serializeUser(function(user, done) {
      done(null, user)
    })

    this.passport.deserializeUser(function(user, done) {
      done(null, user)
    })
  }
}

module.exports = Passport
