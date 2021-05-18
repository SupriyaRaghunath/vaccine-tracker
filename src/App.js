import React, { Component } from "react";

import { Request } from "./Request";

import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <body className="App-body">
            <Request />
        </body>
      </div>
    );
  }
}

export default App;
