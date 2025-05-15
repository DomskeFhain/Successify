import React, { useState, useEffect, useRef } from "react";
import {
  Slider,
  CircularProgress,
  Typography,
  Box,
  Button,
} from "@mui/material";

export default function Countdown() {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [minutes, setMinutes] = useState(focusDuration);
  const [seconds, setSeconds] = useState(0);
  const [displayMessage, setDisplayMessage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const [cycleCompleted, setCycleCompleted] = useState(false);

useEffect(() => {
    audioRef.current = new Audio("/alarm.mp3");
  if (isRunning) {
    intervalRef.current = setInterval(() => {
      setSeconds((prevSec) => {
        if (prevSec === 0) {
          return 59;
        } else {
          return prevSec - 1;
        }
      });

      setMinutes((prevMin) => {
        if (seconds === 0) {
            if (prevMin === 0) {
                if (audioRef.current) audioRef.current.play();

                if (displayMessage) {

                setIsRunning(false);
                setCycleCompleted(true);
                resetTimer()
                } else {
                setDisplayMessage(true);
                setMinutes(breakDuration - 1);
                setSeconds(59);
                return breakDuration - 1;
                }
                } else {
            return prevMin - 1;
}
        }
        return prevMin;
      });
    }, 1000);
  } else {
    clearInterval(intervalRef.current);
  }

  return () => clearInterval(intervalRef.current);
}, [isRunning, displayMessage, focusDuration, breakDuration, seconds]);


  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setFocusDuration(25);
    setBreakDuration(5);
    setMinutes(25);
    setSeconds(0);
    setDisplayMessage(false);
    setProgress(0);
  };

  const timerMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const timerSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h5" gutterBottom>
        Pomodoro Timer
      </Typography>

      <Box mb={2}>
        <Typography>Focus Duration: {focusDuration} min</Typography>
        <Slider
          value={focusDuration}
          min={5}
          max={60}
          step={5}
          onChange={(e, newValue) => {
            setFocusDuration(newValue);
            if (!displayMessage && !isRunning) {
              setMinutes(newValue);
              setSeconds(0);
            }
          }}
          disabled={isRunning}
        />
      </Box>

      <Box mb={2}>
        <Typography>Break Duration: {breakDuration} min</Typography>
        <Slider
          value={breakDuration}
          min={5}
          max={30}
          step={5}
          onChange={(e, newValue) => {
            setBreakDuration(newValue);
            if (displayMessage && !isRunning) {
              setMinutes(newValue);
              setSeconds(0);
            }
          }}
          disabled={isRunning}
        />
      </Box>

      <Box position="relative" display="inline-flex" mt={4}>
        <CircularProgress variant="determinate" value={progress} size={200} />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          {displayMessage && (
            <Typography variant="body1" color="textSecondary">
              Break Time
            </Typography>
          )}
          <Typography variant="h4">
            {timerMinutes}:{timerSeconds}
          </Typography>
        </Box>
      </Box>

      <Box mt={4} display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          color={isRunning ? "secondary" : "primary"}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button variant="outlined" onClick={resetTimer}>
          Reset
        </Button>
      </Box>
    </Box>
  );
}
