import React, { useState, useEffect } from "react";

const minutes = 15;

function twoDigitSeconds(seconds) {
  if (seconds < 10) {
    return `0${seconds}`;
  } else {
    return seconds;
  }
}

export default function Timer(props) {
  // const [isActive, setIsActive] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    if (secondsLeft === 0) {
      // setIsActive(false);
      props.onGameOver();
    } else {
      const tick = setInterval(function () {
        setSecondsLeft((prevValue) => prevValue - 1);
      }, 1000);
      return () => clearInterval(tick);
    }
  });

  return (
    <div>
      <p>{`${Math.floor(secondsLeft / 60)}:${twoDigitSeconds(
        secondsLeft % 60
      )}`}</p>
    </div>
  );
}
