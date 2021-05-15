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

    if (_finalCenters.length)
      this.setState({ finalCenters: _finalCenters, total_18, total_45 });
    else {
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
