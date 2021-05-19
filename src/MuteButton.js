import React from "react";
import "./App.css";
import {  VscUnmute, VscMute  } from "react-icons/vsc";

function MuteButton(props) {
    let {mute, onClick} = props
	return (
		<div>
			<button style={{backgroundColor: '#9897a9'}} onClick={onClick} >
                {!mute?
                <VscUnmute size={25} color={"white"}/>:
                <VscMute size={25} color={"white"}/>
                }
			</button>
		</div>
	);
}

export default MuteButton;
