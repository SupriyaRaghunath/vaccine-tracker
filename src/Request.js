import React, { Component } from "react";
import { Report } from "./Report";

const states = `https://cdn-api.co-vin.in/api/v2/admin/location/states`;
const districts = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/`;
const sessions = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=`;
const age1 = "18";
const age2 = "45";
const EIGHTEEN = 18;
const FORTYFIVE = 45;

class Request extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ages: ["18", "45"],
    };
  }

  componentDidMount() {
    fetch(states)
      .then((response) => response.json())
      .then((data) => this.setState({ states: data }));
  }

  getDistricts = () => {
    fetch(districts + this.state.selectedState)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ districts: data });
      });
  };

  checkAvailability = (data) => {
    let _finalCenters = [],
      total_18 = 0,
      total_45 = 0;

    for (let center of data.centers) {
      let centerData = {
        name: center.name,
        address: center.address,
        pincode: center.pincode,
      };
      let availability_18 = 0,
        availability_45 = 0;

      for (let session of center.sessions) {
        if (session.available_capacity > 0) {
          if (this.state.ages.includes(`${session.min_age_limit}`)) {
            if (session.min_age_limit === EIGHTEEN) {
              centerData["availability_18"] =
                availability_18 + session.available_capacity;
            } else {
              centerData["availability_45"] =
                availability_45 + session.available_capacity;
            }
          }
        }
      }
      if (centerData.availability_18 || centerData.availability_45)
        _finalCenters.push(centerData);

      total_18 += availability_18;
      total_45 += availability_45;
    }

    if (_finalCenters.length) {
      this.notifyMe();
      this.setState({ finalCenters: _finalCenters, total_18, total_45 });
    } else {
      this.setState({ finalCenters: null });
    }
  };

  getSessions = () => {
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();

    today = dd + "-" + mm + "-" + yyyy;

    setInterval(() => {
      if (
        !(
          (this.state.ages.includes(EIGHTEEN) && this.state.total_18 > 0) ||
          (this.state.ages.includes(FORTYFIVE) && this.state.total_45 > 0)
        )
      ) {
        fetch(sessions + this.state.selectedDistrict + "&date=" + today)
          .then((response) => response.json())
          .then((data) => {
            this.checkAvailability(data);
          });
      }
    }, 10 * 1000);
  };

  onStateChange = (event) => {
    this.setState(
      { selectedState: event.target.value, finalCenters: [] },
      this.getDistricts
    );
  };

  onDistrictChange = (event) => {
    this.setState(
      { selectedDistrict: event.target.value, finalCenters: [] },
      this.getSessions
    );
  };

  playBeep = () => {
    var snd = new Audio(
      "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
    );
    snd.play();
  };

  notifyMe = () => {
    let notifTitle = "Slots Available",
      notifBody = "Vaccine Slots are avilable. Hurry up!";

    if (!Notification) {
      alert("Desktop notifications not available in your browser");
      return;
    }

    if (Notification.permission !== "granted") Notification.requestPermission();
    else {
      this.playBeep();
      const notification = new Notification(notifTitle, {
        icon:
          "https://socoemergency.org/wp-content/uploads/2020/11/icon-vaccine.png",
        body: notifBody,
      });
      notification.onclick = function () {
        window.focus();
        this.close();
      };
    }
  };

  render() {
    let renderState = (state) => {
      return <option value={state.state_id}>{state.state_name}</option>;
    };

    let renderDistrict = (district) => {
      return (
        <option value={district.district_id}>{district.district_name}</option>
      );
    };

    let renderCheckboxWithLabel = (age) => (
      <label>
        <input
          type="checkbox"
          id={age}
          onChange={(event) => {
            event.target.checked
              ? this.setState({ ages: this.state.ages.concat(event.target.id) })
              : this.setState({
                  ages: this.state.ages.filter(
                    (key) => key !== event.target.id
                  ),
                });
          }}
          defaultChecked
        />
        {age}
      </label>
    );

    return (
      <div>
        <p>
          <label>Select State </label>
          {this.state && this.state.states && (
            <select
              value={this.state.selectedState}
              onChange={this.onStateChange}
            >
              <option>-------SELECT A STATE-------</option>
              {this.state.states.states.map((state) => renderState(state))}
            </select>
          )}
        </p>
        <p>
          {this.state &&
            this.state.states &&
            this.state.districts &&
            this.state.districts.districts && (
              <div>
                <label>Select district </label>
                <select
                  value={this.state.selectedDistrict}
                  onChange={this.onDistrictChange}
                >
                  <option>-------SELECT A DISTRICT-------</option>
                  {this.state.districts.districts.map((district) =>
                    renderDistrict(district)
                  )}
                </select>
              </div>
            )}
        </p>
        <p>
          {renderCheckboxWithLabel(age1)}
          {renderCheckboxWithLabel(age2)}
        </p>
        <p>
          {this.state.finalCenters && (
            <Report finalCenters={this.state.finalCenters} />
          )}
        </p>
      </div>
    );
  }
}

export { Request };
