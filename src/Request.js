import React, { Component } from "react";
import { Report } from "./Report";
import tone from "./tone.mp3";
import MuteButton from "./MuteButton";
import SelectInterval from "./SelectInterval";
import {
  CheckboxWithLabel,
  Button,
  LoaderContainer,
  Label,
  Dropdown,
} from "./Component.js";

import { URL } from "./url.js";
import { STRINGS } from "./strings.js";

const { STATES, DISTRICTS, SESSIONS } = URL;

const AGES = [18, 45];
const DOSES = [1, 2];

/**  @author Supriya PR <supriya.raghunath96@gmail.com> */
/**  @author Sahil Hussain <sahil.hussain113@gmail.com> */

class Request extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ages: [18, 45],
      doses: [1, 2],
      start: false,
      mute: false,
      interval: 10,
      pauseNotification: false,
    };
  }

  componentDidMount() {
    fetch(STATES)
      .then((response) => response.json())
      .then((data) => this.setState({ states: data }));
  }

  getDistricts = () => {
    fetch(DISTRICTS + this.state.selectedState)
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
            this.state.ages.includes(session.min_age_limit) &&
            (session[`available_capacity_dose${this.state.doses[0]}`] ||
              session[`available_capacity_dose${this.state.doses[1]}`])
          ) {
            if (session.min_age_limit === AGES[0]) {
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
      if (this.state.pauseNotification) {
        if (
          JSON.stringify(_finalCenters) ===
          JSON.stringify(this.state.finalCenters)
        )
          return;
      }

      this.notifyMe();
      this.setState({
        finalCenters: _finalCenters,
        total_18,
        total_45,
        loading: false,
        pauseNotification: false,
      });
    } else {
      this.setState({ finalCenters: null, loading: false });
    }
  };

  fetch = (today) => {
    fetch(SESSIONS + this.state.selectedDistrict + "&date=" + today)
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
            (this.state.ages.includes(AGES[0]) && this.state.total_18 > 0) ||
            (this.state.ages.includes(AGES[1]) && this.state.total_45 > 0)
          ) &&
          this.state.selectedDistrict.length > 0
        ) {
          this.state.intervalId = this.fetch(today);
        }
      }, this.state.interval * 1000);
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
      try {
        var Tone = new Audio(tone);

        await Tone.play();
      } catch (err) {}
    }
  };

  soundPress = () => {
    this.setState({ mute: !this.state.mute });
  };

  notifyMe = () => {
    if (!this.state.start) return;

    this.playBeep();

    if (!("Notification" in window) || !Notification) {
      alert(STRINGS.no_notif_browser);
      return;
    }

    if (Notification.permission !== "granted") Notification.requestPermission();
    else {
      try {
        const notification = new Notification(STRINGS.slot_available_title, {
          icon: URL.VACCINE,
          body: STRINGS.slot_available_body,
        });
        notification.onclick = function () {
          window.focus();
          this.close();
        };
      } catch (e) {}
    }
  };

  pauseNotification = () => {
    this.setState({ pauseNotification: !this.state.pauseNotification });
  };

  start = () => {
    alert(STRINGS.enable_notif);

    this.setState({ start: true }, this.getSessions);
  };

  stop = () => {
    this.setState({ start: false });
  };

  onIntervalSelect = (event) => {
    this.setState({ interval: event.target.value });
  };

  onAgeChange = (event) => {
    this.state.ages = event.target.checked
      ? this.state.ages.concat(parseInt(event.target.id))
      : this.state.ages.filter((key) => key != event.target.id);

    this.checkAvailability();
  };

  onDoseChange = (event) => {
    this.state.doses = event.target.checked
      ? this.state.doses.concat(parseInt(event.target.id))
      : this.state.doses.filter((key) => key != event.target.id);

    this.checkAvailability();
  };

  render() {
    let state = this.state;
    let {
      states,
      districts,
      selectedState,
      selectedDistrict,
      finalCenters,
      start,
      ages,
    } = state || {};

    let showStates = state && states;
    let showDistricts = showStates && districts && districts.districts;
    let showNotifier = ages && selectedDistrict;
    let showPauseResume = start && finalCenters && selectedDistrict.length > 0;
    let isDistrictSelected = selectedDistrict && selectedDistrict.length > 0;
    let noFinalCenters =
      !finalCenters || (finalCenters && finalCenters.length === 0);

    let renderState = (_state) => (
      <option value={_state.state_id}>{_state.state_name}</option>
    );

    let renderDistrict = (district) => (
      <option value={district.district_id}>{district.district_name}</option>
    );

    let stateField = (
      <p>
        <Label title={STRINGS.state_title} />
        {showStates && (
          <Dropdown
            value={selectedState}
            onChange={this.onStateChange}
            renderOption={(data) => renderState(data)}
            defaultOption={STRINGS.default_state_option}
            data={states.states}
          />
        )}
      </p>
    );

    let districtField = showDistricts && (
      <p>
        <Label title={STRINGS.district_title} />
        <Dropdown
          value={selectedDistrict}
          onChange={this.onDistrictChange}
          renderOption={(data) => renderDistrict(data)}
          defaultOption={STRINGS.default_district_option}
          data={districts.districts}
        />
      </p>
    );

    let agesField = (
      <p>
        <Label title={STRINGS.age_title} />
        {AGES.map((age) => (
          <CheckboxWithLabel
            onPress={this.onAgeChange}
            title={`${age}`}
            id={age}
          />
        ))}
      </p>
    );

    let dosesField = (
      <p>
        {DOSES.map((dose) => (
          <CheckboxWithLabel
            onPress={this.onDoseChange}
            title={STRINGS.dose_title + "" + dose}
            id={dose}
          />
        ))}
      </p>
    );

    let interval = (
      <SelectInterval
        interval={state.interval}
        onIntervalSelect={this.onIntervalSelect}
      />
    );

    let muteButton = <MuteButton mute={state.mute} onClick={this.soundPress} />;

    let notifyButtons =
      showNotifier &&
      (start ? (
        <Button onClick={this.stop} label={STRINGS.stop_notifier} />
      ) : (
        <Button onClick={this.start} label={STRINGS.tart_notifier} />
      ));

    let pauseResumeButtons =
      showPauseResume &&
      (state.pauseNotification ? (
        <Button onClick={this.pauseNotification} label={STRINGS.resume_notifications} />
      ) : (
        <Button onClick={this.pauseNotification} label={STRINGS.pause_notifications} />
      ));

    let content = (
      <p>
        {state.loading ? (
          <LoaderContainer />
        ) : isDistrictSelected && noFinalCenters ? (
          start ? (
            <div>
              <Label title={STRINGS.waiting} />
              <LoaderContainer />
            </div>
          ) : (
            <Label title={STRINGS.no_slot} />
          )
        ) : (
          finalCenters &&
          selectedDistrict.length > 0 && <Report finalCenters={finalCenters} />
        )}
      </p>
    );

    return (
      <div>
        {stateField}
        {districtField}
        {agesField}
        {dosesField}
        {interval}
        {muteButton}
        {notifyButtons}
        {pauseResumeButtons}
        {content}
      </div>
    );
  }
}

export { Request };
