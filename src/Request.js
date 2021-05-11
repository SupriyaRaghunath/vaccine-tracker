import React, { Component } from "react";

const states = `https://cdn-api.co-vin.in/api/v2/admin/location/states`;
const districts = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/`;
const sessions = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=`;

class Request extends Component {
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
    for (let center of data.centers)
      for (let session of center.sessions)
        if (session.available_capacity > 0) console.log(session);
  };

  getSessions = () => {
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();

    today = dd + "-" + mm + "-" + yyyy;

    // fetch(sessions + this.state.selectedDistrict + "&date=" + today)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     this.checkAvailability(data);
    //   });
    setInterval(() => {
      fetch(sessions + this.state.selectedDistrict + "&date=" + today)
        .then((response) => response.json())
        .then((data) => {
          this.checkAvailability(data);
        });
    }, 30 * 1000);
  };

  onStateChange = (event) => {
    this.setState({ selectedState: event.target.value }, this.getDistricts);
  };

  onDistrictChange = (event) => {
    this.setState({ selectedDistrict: event.target.value }, this.getSessions);
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
    return (
      <div>
        <p>
          <label>Select Age:</label>
          {this.state && this.state.states && (
            <div>
              <label>
                <input
                  type="radio"
                  onChange={() => {}}
                  defaultChecked
                />
                18
              </label>
              <label>
                <input
                  type="radio"
                  onChange={() => {}}
                />
                45
              </label>
            </div>
          )}
          <label>Select State:</label>
          {this.state && this.state.states && (
            <select
              value={this.state.selectedState}
              onChange={this.onStateChange}
            >
              {this.state.states.states.map((state) => renderState(state))}
            </select>
          )}
          <label>Select district:</label>
          {this.state &&
            this.state.states &&
            this.state.districts &&
            this.state.districts.districts && (
              <select
                value={this.state.selectedDistrict}
                onChange={this.onDistrictChange}
              >
                {this.state.districts.districts.map((district) =>
                  renderDistrict(district)
                )}
              </select>
            )}
        </p>
      </div>
    );
  }
}

export { Request };
