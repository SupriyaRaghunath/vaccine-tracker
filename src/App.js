import React, {Component} from 'react'
import logo from './logo.svg';
import './App.css';
import {Request} from './Request'
class App extends Component {
  render(){
    return (
    <div className="App">
      <header className="App-header">
        <p>
          <Request/>
        </p>
      </header>
    </div>
  )}
}

export default App;
