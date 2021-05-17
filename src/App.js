import React, { Component } from "react";
import "./App.css";
import { Request } from "./Request";
/**  @author supriya <supriya.raghunath96@gmail.com> */
/**  @author Sahil Hussain <sahil.hussain113@gmail.com> */

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Vaccine Slot Tracker</h1>
          <p>
            <label style={{ fontWeight: 75, fontSize: 20 }}>
              Find available slots for your vaccination. If there are no slots,
              don't worry! we've got your back. We'll notify when there are
              available slots.
            </label>
            <br />
            <label style={{ fontWeight: 10, fontSize: 20 }}>
              'Start Notifier' and make sure you don't close this tab.
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
