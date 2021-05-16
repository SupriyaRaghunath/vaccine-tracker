import React, { Component } from "react";
import "./App.css";
import { Request } from "./Request";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Vaccine Slot Tracker</h1>
          <p>
            <label style={{ fontWeight: 75, fontSize: 20 }}>
              Find available slots for your vaccination. If there are not slots,
              don't worry! we've got your back. Start notifier and make sure you
              don't close this tab. We'll notify when there are available slots.
            </label>
          </p>
          <p>
            <Request />
          </p>
        </header>
      </div>
    );
  }
}

export default App;
