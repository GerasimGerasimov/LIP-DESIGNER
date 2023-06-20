import React from 'react';

export interface IBPSSelectProps {
  default:string;
  onChange: (e: any) => any;
}

export const BPSSelect = (props: IBPSSelectProps) => {

  return (
    <p>BPS:
    <select value={props.default} onChange={(e)=>props.onChange(e)}>
        <option>230400</option>
        <option>115200</option>
        <option>57600</option>
        <option>38400</option>
        <option>19200</option>
      </select>
  </p>
  )
}