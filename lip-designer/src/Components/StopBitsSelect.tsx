import React from 'react';

export interface IStopBitsSelectProps {
  default:string;
  onChange: (e: any) => any;
}

export const StopBitsSelect = (props: IStopBitsSelectProps) => {

  return (
    <p>StopBits:
    <select value={props.default} onChange={(e)=>props.onChange(e)}>
      <option>1</option>
      <option>2</option>
    </select>
  </p>
  )
}