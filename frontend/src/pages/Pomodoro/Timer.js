import React from 'react'
import { Button } from '@mui/material'
import SliderWork from './SliderWork'
import ButtonStartWork from './ButtonStartWork'
import DisplayTimeWork from './DisplayTimeWork'
import SliderBreak from './SliderBreak'
import ButtonStartBreak from './ButtonStartBreak'
import DisplayTimeBreak from './DisplayTimeBreak'

function Timer() {
  return (
    <>
    <DisplayTimeWork />
    <SliderWork />
    <ButtonStartWork />
    <DisplayTimeBreak />
    <SliderBreak />
    <ButtonStartBreak />
    
    </>
  )
}

export default Timer