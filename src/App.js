import React, { Component } from "react";

import { GoMarkGithub } from "react-icons/go";
import { GiHelp } from "react-icons/gi";

import { STRINGS } from "./strings.js";
import { URL } from "./url.js";

import { Request } from "./Request";

import "./App.css";

class App extends Component {
  render() {
    let { appTitle, findSlot, startNotifier } = STRINGS;
    let { FORM, GIT } = URL;

    let feedback = <GiHelp className="right-logo" />;
    let gitButton = <GoMarkGithub className="right-logo" />;

    let renderHref = (child, url) => (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="right-logo"
      >
        {child}
      </a>
    );

    return (
      <div className="App">
        <header className="App-header">
          <h1>{appTitle}</h1>
        </header>
        <body className="App-body">
          <p>
            <label className="find-slot">{findSlot}</label>
            <br />
            <label sclassName="start-notifier">{startNotifier}</label>
          </p>
          <p>
            <Request />
          </p>
          <div className="right-logo-section">
            {renderHref(feedback, FORM)}
            {renderHref(gitButton, GIT)}
          </div>
        </body>
      </div>
    );
  }
}

export default App;
