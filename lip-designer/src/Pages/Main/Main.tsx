/*
https://robkendal.co.uk/blog/how-to-fix-property-does-not-exist-on-window-type-in-typescript
побеждал 'PROPERTY SERIAL DOES NOT EXIST ON TYPE NAVIGATOR IN TYPESCRIPT' ERROR
*/
import React, { Component } from "react";
//import Module from "../../hello_world.wasm.js";
//import func from "../../../cpp/public/hello_world.wasm.js";
import createModule from "../../add.mjs";
import { BPSSelect } from "../../Components/BPSSelect";
import { ParitySelect } from "../../Components/ParitySelect";
import { StopBitsSelect } from "../../Components/StopBitsSelect";
interface IMainProps{
}

interface IMainState{
  Counter: number;
  BPS: number;
  parity: ParityType;
  stopBits: number;
}

export default class MainPage extends Component<IMainProps, IMainState> {
  private add: any = undefined;
  private COM: any = undefined;

  constructor (props: IMainProps) {
    super(props);
    this.state = {
      Counter:0,
      BPS: 115200,
      parity: 'none',
      stopBits: 1
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
      this.COM = await navigator.serial.requestPort({ filters: []});
      // Continue connecting to the device attached to |port|.
      console.log(this.COM);
    } catch (e) {
      console.log(e);
      this.COM = undefined;
      // The prompt has been dismissed without selecting a device.
    }
  }

  onClickApplyComSettingHandler() {
    if (this.COM) {
      console.log(this.COM);
      let opt: SerialOptions = {
        baudRate: this.state.BPS,
        dataBits: 8,
        stopBits: this.state.stopBits,
        parity: this.state.parity,
        bufferSize: 256
      };
      console.log(opt);
    }
  }

  tougleBPS (e:any) {
    this.setState({BPS: parseInt(e.target.value)});
  }

  tougleParity (e:any) {
    this.setState({parity: e.target.value});
  }

  tougleStopBits (e: any) {
    this.setState({stopBits: parseInt(e.target.value)});
  }

  render(){
    return (
      <>
        <span>{this.state.Counter}</span>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {()=>this.onClickHandler()}>Select COM</button>
        <BPSSelect default={this.state.BPS.toString()} onChange={(e)=>this.tougleBPS(e)}/>
        <ParitySelect default={this.state.parity} onChange={(e)=>this.tougleParity(e)}/>
        <StopBitsSelect default={this.state.stopBits.toString()} onChange={(e)=>this.tougleStopBits(e)}/>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {()=>this.onClickApplyComSettingHandler()}>Apply</button>

      </>
    );
  }
}

function setAdd(arg0: () => any) {
  throw new Error("Function not implemented.");
}
