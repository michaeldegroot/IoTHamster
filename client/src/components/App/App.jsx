import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Login from '../Login/Login.jsx'
import './App.css'

// how to include media
const logo = './assets/images/logo.png'

// how to send ipc
const electron = window.require('electron')
const ipc = electron.ipcRenderer
ipc.send('app-test')

export default class App extends React.Component {
  render() {
    return (
      <Router>
        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
      */}
        <Switch>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/">
            <div className="jumbotron jumbotron-fluid">
              <div className="container">
                <h1 className="display-4">
                  {' '}
                  <img src={logo} width="128px" /> IoTHamster
                </h1>
                <p className="lead text-center">
                  Service software for centralizing your IoT devices, brings your devices together in a modern, fast and <b>secure</b> environment.
                  Features device health uptime checks, push notifications, IFTTT, data encryption at rest. All linked up with your MQTT broker.
                </p>
                <div class="row">
                  <div class="col text-center">
                    <Link to="/a" role="button" className="btn btn-primary btn-lg btn-block">
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Route>
        </Switch>
      </Router>
    )
  }
}
