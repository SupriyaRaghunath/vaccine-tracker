import React, { Component } from "react";
import { Report } from "./Report";
import Loader from "react-loader-spinner";
import tone from "./tone.mp3";
import MuteButton from "./MuteButton";

const states = `https://cdn-api.co-vin.in/api/v2/admin/location/states`;
const districts = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/`;
const sessions = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=`;
const age1 = "18";
const age2 = "45";
const EIGHTEEN = 18;
const FORTYFIVE = 45;

/**  @author Supriya PR <supriya.raghunath96@gmail.com> */
/**  @author Sahil Hussain <sahil.hussain113@gmail.com> */

class Request extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ages: ["18", "45"],
      doses: ["1", "2"],
      start: false,
      mute: false,
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

  checkAvailability = () => {
    let _finalCenters = [],
      total_18 = 0,
      total_45 = 0;

    let data = this.state.response;

    if (!data) return;

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
          if (
            this.state.ages.includes(`${session.min_age_limit}`) &&
            (session[`available_capacity_dose${this.state.doses[0]}`] ||
              session[`available_capacity_dose${this.state.doses[1]}`])
          ) {
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

    _finalCenters = _finalCenters.sort((a, b) => {
      return (
        (b.availability_18 || b.availability_45) -
        (a.availability_45 || a.availability_18)
      );
    });

    if (_finalCenters.length) {
      this.notifyMe();
      this.setState({
        finalCenters: _finalCenters,
        total_18,
        total_45,
        loading: false,
      });
    } else {
      this.setState({ finalCenters: null, loading: false });
    }
  };

  fetch = (today) => {
    fetch(sessions + this.state.selectedDistrict + "&date=" + today)
      .then((response) => response.json())
      .then((data) => {
        this.state.response = data;
        this.checkAvailability();
      });
  };

  getSessions = () => {
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();

    today = dd + "-" + mm + "-" + yyyy;

    if (!this.state.start) {
      this.setState({ loading: true });
      this.fetch(today);
    } else {
      let notifyTimer = setInterval(() => {
        if (!this.state.start) {
          clearInterval(notifyTimer);
          return;
        }

        if (
          !(
            (this.state.ages.includes(EIGHTEEN) && this.state.total_18 > 0) ||
            (this.state.ages.includes(FORTYFIVE) && this.state.total_45 > 0)
          ) &&
          this.state.selectedDistrict.length > 0
        ) {
          this.state.intervalId = this.fetch(today);
        }
      }, 10 * 1000);
    }
  };

  onStateChange = (event) => {
    this.setState(
      {
        selectedState: event.target.value,
        finalCenters: [],
        selectedDistrict: "",
      },
      this.getDistricts
    );

    this.state.intervalId && clearInterval(this.state.intervalId);
  };

  onDistrictChange = (event) => {
    this.setState(
      {
        selectedDistrict: event.target.value,
        finalCenters: [],
      },
      this.getSessions
    );

    this.state.intervalId && clearInterval(this.state.intervalId);
  };

  playBeep = async () => {
    if (!this.state.mute) {
      var Tone = new Audio(tone);
      await Tone.play();
    }
  };

  soundPress = () => {
    this.setState({ mute: !this.state.mute });
  };

  notifyMe = () => {
    if (!this.state.start) return;
    let notifTitle = "Slots Available",
      notifBody = "Vaccine Slots are avilable. Hurry up!";

    this.playBeep();
    if (!Notification) {
      alert("Desktop notifications not available in your browser");
      return;
    }

    if (Notification.permission !== "granted") Notification.requestPermission();
    else {
      try {
        const notification = new Notification(notifTitle, {
          icon:
            "https://socoemergency.org/wp-content/uploads/2020/11/icon-vaccine.png",
          body: notifBody,
        });
        notification.onclick = function () {
          window.focus();
          this.close();
        };
      } catch (e) {}
    }
  };

  start = () => {
    alert("Please keep notifications enabled");

    this.setState({ start: true }, this.getSessions);
  };

  stop = () => {
    this.setState({ start: false });
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

    let renderAgeCheckboxWithLabel = (age) => (
      <label>
        <input
          type="checkbox"
          id={age}
          onChange={(event) => {
            this.state.ages = event.target.checked
              ? this.state.ages.concat(event.target.id)
              : this.state.ages.filter((key) => key !== event.target.id);

            this.checkAvailability();
          }}
          defaultChecked
        />
        {age}
      </label>
    );

    let renderDoseCheckboxWithLabel = (dose) => (
      <label>
        <input
          type="checkbox"
          id={dose}
          onChange={(event) => {
            this.state.doses = event.target.checked
              ? this.state.doses.concat(event.target.id)
              : this.state.doses.filter((key) => key !== event.target.id);

            this.checkAvailability();
          }}
          defaultChecked
        />
        {`Dose ` + dose}
      </label>
    );

    return (
      <div>
        <MuteButton mute={this.state.mute} onClick={this.soundPress} />
        <p>
          <label>State </label>
          {this.state && this.state.states && (
            <select
              value={this.state.selectedState}
              onChange={this.onStateChange}
            >
              <option selected>-------SELECT A STATE-------</option>
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
                <label>District </label>
                <select
                  value={this.state.selectedDistrict}
                  onChange={this.onDistrictChange}
                >
                  <option selected>-------SELECT A DISTRICT-------</option>
                  {this.state.districts.districts.map((district) =>
                    renderDistrict(district)
                  )}
                </select>
              </div>
            )}
        </p>
        <p>
          <label>Age </label>
          {renderAgeCheckboxWithLabel(age1)}
          {renderAgeCheckboxWithLabel(age2)}
        </p>
        <p>
          {renderDoseCheckboxWithLabel(1)}
          <br />
          {renderDoseCheckboxWithLabel(2)}
        </p>
        {this.state.ages && this.state.selectedDistrict && (
          <p>
            {this.state.start ? (
              <button type="button" onClick={this.stop}>
                Stop Notifier
              </button>
            ) : (
              <button type="button" onClick={this.start}>
                Start Notifier
              </button>
            )}
          </p>
        )}
        <p>
          {this.state.loading ? (
            <Loader
              type="Bars"
              color="#00BFFF"
              height={100}
              width={100}
              timeout={3000} //3 secs
            />
          ) : this.state.selectedDistrict &&
            this.state.selectedDistrict.length > 0 &&
            (!this.state.finalCenters ||
              (this.state.finalCenters &&
                this.state.finalCenters.length === 0)) ? (
            this.state.start ? (
              <div>
                <label>Waiting for a slot to be available</label>
                <Loader type="Bars" color="#00BFFF" height={100} width={100} />
              </div>
            ) : (
              <label>No slots available</label>
            )
          ) : (
            this.state.finalCenters &&
            this.state.selectedDistrict.length > 0 && (
              <Report finalCenters={this.state.finalCenters} />
            )
          )}
        </p>
      </div>
    );
  }
}

export { Request };
