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
  private COM: SerialPort | undefined = undefined;

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
      //Если появляется виртуальный СОМ порт (на USB) то при втыкании USB срабатывает событие CONNECT
      navigator.serial.addEventListener('connect', (event) => {console.log(`!!! Navigator Connect: ${event}`)});
      this.COM = await navigator.serial.requestPort({ filters: []});
    } catch (e) {
      console.log(e);
      this.COM = undefined;
      // The prompt has been dismissed without selecting a device.
    }
  }

  async onClickApplyComSettingHandler() {
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
      try {
        await this.COM.open(opt);
        //Когда конкретный порт открыт (виртуальны на USB) то если вытащить разъём USB, срабатывает событие DISCONNECT
        this.COM.ondisconnect = (event) => {this.onDisconnect(event)};
        console.log(this.COM);
      } catch(e) {
        console.log(e);
      }
    }
  }

  async readReceivedData(): Promise<Uint8Array> {
    var values = new Uint8Array(0);
    var tmp = new Uint8Array(0);
    if (this.COM) {
        const reader = this.COM.readable?.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              // |reader| has been canceled.
              console.log('empty');
              reader.releaseLock();
              break;
            }
            // Do something with |value|…
            tmp = new Uint8Array(values.byteLength + value.byteLength);
            tmp.set(new Uint8Array(values), 0);
            tmp.set(new Uint8Array(value), values.byteLength);
            values = tmp;
            //console.log(value);
          }
        } catch (error) {
          // Handle |error|…
          console.log(error);
        } //finally {
          reader.releaseLock();
        //}
    }
    return values;
  }

  async sendCMD () {
    try {
      const writer: WritableStreamDefaultWriter<Uint8Array> | undefined = this.COM?.writable?.getWriter();
      let uint8Array:Uint8Array = new Uint8Array([0x01, 0x11, 192, 44]);
      await writer?.write(uint8Array);
      writer?.releaseLock();
      var values: Uint8Array = await this.readReceivedData();
      console.log(values);
    } catch (e) {

    }
  }

  onConnect(event: any) {
    //console.log(`Connect: ${event}`);
  }

  onDisconnect(event: any) {
    console.log(`COM disconnected!: ${event}`)
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
        <button
          className="btn btn-secondary btn-xs"
          onClick = {()=>this.sendCMD()}>Send</button>
      </>
    );
  }
}

function setAdd(arg0: () => any) {
  throw new Error("Function not implemented.");
}
