import React from "react";
import "./App.css";
import { GoMarkGithub} from "react-icons/go";
import {  VscUnmute, VscMute  } from "react-icons/vsc";

function MuteButton(props) {
    let {mute, onClick} = props
	return (
		<div className="sound">
			<button style={{backgroundColor: '#282c34'}} onClick={onClick} >
                {!mute?
                <VscUnmute size={25} color={"white"}/>:
                <VscMute size={25} color={"white"}/>
                }
			</button>
		</div>
	);
}

export default MuteButton;
