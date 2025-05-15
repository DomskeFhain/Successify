import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

function valuetext(value) {
  return `${value} Min`;
}

export default function SliderWork() {
  return (
    <Box sx={{ width: 300 }}>
      <Slider
        aria-label="Time"
        defaultValue={15}
        getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        shiftStep={30}
        step={5}
        marks
        min={5}
        max={30}
      />
    </Box>
  );
}