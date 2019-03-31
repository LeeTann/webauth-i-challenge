import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom'

import './App.css';
import Users from './users/Users'
import Login from './login/Login'

class App extends Component {
  render() {
    return (
      <div className="App">
         <nav>
           <NavLink to="/login">Login</NavLink>
           &nbsp;|&nbsp;
           <NavLink to="/users">Users</NavLink>
         </nav>
         <header>
           <main>
             <Route path="/login" component={Login} />
             <Route path="/users" component={Users} />
           </main>
         </header>
      </div>
    );
  }
}

export default App;
