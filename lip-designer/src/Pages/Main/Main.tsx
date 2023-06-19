/*
https://robkendal.co.uk/blog/how-to-fix-property-does-not-exist-on-window-type-in-typescript
побеждал 'PROPERTY SERIAL DOES NOT EXIST ON TYPE NAVIGATOR IN TYPESCRIPT' ERROR
*/
import React, { Component } from "react";
//import Module from "../../hello_world.wasm.js";
//import func from "../../../cpp/public/hello_world.wasm.js";
import createModule from "../../add.mjs";
interface IMainProps{
}

interface IMainState{
  Counter: number;
}

export default class MainPage extends Component<IMainProps, IMainState> {
  private add: any = undefined;

  constructor (props: IMainProps) {
    super(props);
    this.state = {
      Counter:0
    }
  }

  componentDidMount(){
    console.log('смонтирован');
    createModule().then((Module: { cwrap: (arg0: string, arg1: string, arg2: string[]) => any; }) => {
      this.add = Module.cwrap("add", "number", ["number", "number"]);
      const res: number = this.add(1,2);
    });
    /*
    func().then((WebAssembly.Instance) => {
      console.log('!'),
    });

    Module['onRuntimeInitialized'] = onRuntimeInitialized;
    function onRuntimeInitialized() {
      const helloMessage = Module.cwrap('getHelloMessage', 'string', [])();
      const element = document.getElementById('output');
      //element.textContent = helloMessage;
    }
    */
  }

  increaseCounter(conter: number):number {
    //TODO сделать инкремент через WASM
    if (this.add) {
      return (this.add(conter,1))
    }
    return conter;
  }

  onClickHandler() {
    this.getSerialPort();
    this.setState({Counter: this.increaseCounter(this.state.Counter)})
  }

  async getSerialPort() {
    try {
      const port:any = await navigator.serial.requestPort({ filters: []});
      console.log(port.getInfo());
      // Continue connecting to the device attached to |port|.

    } catch (e) {
      console.log(e);
      // The prompt has been dismissed without selecting a device.
    }
  }

  render(){
    return (
      <>
        <span>{this.state.Counter}</span>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {()=>this.onClickHandler()}>Select COM</button>
        <p>bps:
          <select>
              <option >230400</option>
              <option selected>115200</option>
              <option>57600</option>
              <option>38400</option>
              <option>19200</option>
            </select>
        </p>
        <p>parity:
          <select>
            <option selected>none</option>
            <option>even</option>
            <option>odd</option>
          </select>
        </p>
        <p>stop bits:
          <select>
            <option selected>1</option>
            <option>1.5</option>
            <option>2</option>
          </select>
        </p>

      </>
    );
  }
}

function setAdd(arg0: () => any) {
  throw new Error("Function not implemented.");
}
