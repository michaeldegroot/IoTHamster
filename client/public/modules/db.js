require('dotenv').config()
const path = require('path')
const { Model, knexSnakeCaseMappers } = require('objection')
const config = require('../../knexfile')
const glob = require('glob')
const isDev = require('electron-is-dev')
const Knex = require('knex')

const db = {}

db.connect = async () => {
  let selector = isDev ? 'development' : 'production'
  const knex = Knex({ ...config[selector], ...knexSnakeCaseMappers() })
  Model.knex(knex)

  db.Model = Model
  db.knex = knex

  db.Model.knex(db.knex)
  db.models = {}

  const files = glob.sync(path.join(__dirname, '..', 'model', '*.js'))
  for (let filepath of files) {
    const name = path.basename(filepath, '.js')
    db.models[name] = require(filepath)
  }
}

module.exports = db
