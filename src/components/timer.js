import React, { useState, useEffect } from "react";

const minutes = 15;

function twoDigitSeconds(seconds) {
  if (seconds < 10) {
    return `0${seconds}`;
  } else {
    return seconds;
  }
}

let timerStart;
let timerEnd;

export default function Timer(props) {
  // const [isActive, setIsActive] = useState(true);
  const [millisecondsLeft, setMillisecondsLeft] = useState(minutes * 60000);
  
  useEffect(() => {
    timerStart = new Date();
    // .getTime() returns milliseconds, so multiply minutes by 60,000
    timerEnd = new Date(timerStart.getTime() + minutes * 60000);
  }, []) // [] as second parameter means only run on mounting, NOT updating
  
  useEffect(() => {
    if (millisecondsLeft < 0) {
      props.onGameOver();
    } else {
      const tick = setInterval(function () {
        setMillisecondsLeft(timerEnd.getTime() - new Date().getTime());
      }, 1000);
      return () => clearInterval(tick);
    }
  });
  

  return (
    <div>
      <p>{`${Math.floor(millisecondsLeft / 60000)}:${twoDigitSeconds(Math.floor(millisecondsLeft % 60000 / 1000))}`}</p>
    </div>
  );
}
