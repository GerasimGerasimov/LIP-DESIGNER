import React from 'react';

export interface IParitySelectProps {
  default:string;
  onChange: (e: any) => any;
}

export const ParitySelect = (props: IParitySelectProps) => {

  return (
    <p>Parity:
    <select value={props.default} onChange={(e)=>props.onChange(e)}>
      <option>none</option>
      <option>even</option>
      <option>odd</option>
    </select>
  </p>
  )
}