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
import "./App.css";
import Header from "./Header";

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
				availability_18_d1: 0,
				availability_45_d1: 0,
				availability_18_d2: 0,
				availability_45_d2: 0,
			};

			for (let session of center.sessions) {
				if (session.available_capacity > 0) {
					if (
						this.state.ages.includes(session.min_age_limit) &&
						(session[`available_capacity_dose${this.state.doses[0]}`] ||
							session[`available_capacity_dose${this.state.doses[1]}`])
					) {
						if (session.min_age_limit === AGES[0] && this.state.doses.includes(1)) {
							centerData["availability_18_d1"] +=
								session.available_capacity_dose1;
						}
            if (session.min_age_limit === AGES[0] && this.state.doses.includes(2)) {
							centerData["availability_18_d2"] +=
								session.available_capacity_dose2;
						}
            if (session.min_age_limit === AGES[1] && this.state.doses.includes(1)) {
							centerData["availability_45_d1"] +=
								session.available_capacity_dose1;
						}
            if(session.min_age_limit === AGES[1] && this.state.doses.includes(2)) {
							centerData["availability_45_d2"] +=
								session.available_capacity_dose2;
						}
					}
				}
			}

			centerData["availability_45"] =
					(centerData["availability_45_d1"] + centerData["availability_45_d2"]) || undefined
      centerData["availability_18"] =
					(centerData["availability_18_d1"] + centerData["availability_18_d2"]) || undefined

          if (centerData.availability_18 || centerData.availability_45)
          _finalCenters.push(centerData);

			total_18 += centerData.availability_18;
			total_45 += centerData.availability_45;
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
		let notifTitle = "Slots Available",
			notifBody = "Vaccine Slots are avilable. Hurry up!";

		this.playBeep();

		if (!("Notification" in window) || !Notification) {
			alert("Desktop notifications are not available in your browser");
			return;
		}

		if (Notification.permission !== "granted") Notification.requestPermission();
		else {
			try {
				const notification = new Notification(notifTitle, {
					icon: "https://socoemergency.org/wp-content/uploads/2020/11/icon-vaccine.png",
					body: notifBody,
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
		alert("Please keep notifications enabled");

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

		let {
			state_title,
			default_state_option,
			district_title,
			default_district_option,
			age_title,
			dose_title,
			stop_notifier,
			start_notifier,
			resume_notifications,
			pause_notifications,
			waiting,
			no_slot,
		} = STRINGS;

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

		return (
			<div>
				<Header />
				<div className="left-logo-section">
					<MuteButton mute={this.state.mute} onClick={this.soundPress} />
				</div>
				<p>
					<Label title={state_title} />
					{showStates && (
						<Dropdown
							value={selectedState}
							onChange={this.onStateChange}
							renderOption={(data) => renderState(data)}
							defaultOption={default_state_option}
							data={states.states}
						/>
					)}
				</p>
				<p>
					{showDistricts && (
						<div>
							<Label title={district_title} />
							<Dropdown
								value={selectedDistrict}
								onChange={this.onDistrictChange}
								renderOption={(data) => renderDistrict(data)}
								defaultOption={default_district_option}
								data={districts.districts}
							/>
						</div>
					)}
				</p>
				<p>
					<Label title={age_title} />
					{AGES.map((age) => (
						<CheckboxWithLabel
							onPress={this.onAgeChange}
							title={`${age}`}
							id={age}
						/>
					))}
				</p>
				{DOSES.map((dose) => (
					<CheckboxWithLabel
						onPress={this.onDoseChange}
						title={dose_title + "" + dose}
						id={dose}
					/>
				))}
				<SelectInterval
					interval={state.interval}
					onIntervalSelect={this.onIntervalSelect}
				/>
				{showNotifier &&
					(start ? (
						<Button onClick={this.stop} label={stop_notifier} />
					) : (
						<Button onClick={this.start} label={start_notifier} />
					))}
				{showPauseResume &&
					(state.pauseNotification ? (
						<Button
							onClick={this.pauseNotification}
							label={resume_notifications}
						/>
					) : (
						<Button
							onClick={this.pauseNotification}
							label={pause_notifications}
						/>
					))}
				<div className="Align-centre">
					<p>
						{state.loading ? (
							<LoaderContainer />
						) : isDistrictSelected && noFinalCenters ? (
							start ? (
								<div>
									<Label title={waiting} />
									<LoaderContainer />
								</div>
							) : (
								<Label title={no_slot} />
							)
						) : (
							finalCenters &&
							selectedDistrict.length > 0 && (
								<Report finalCenters={finalCenters} />
							)
						)}
					</p>
				</div>
			</div>
		);
	}
}

export { Request };
