/*
https://robkendal.co.uk/blog/how-to-fix-property-does-not-exist-on-window-type-in-typescript
побеждал 'PROPERTY SERIAL DOES NOT EXIST ON TYPE NAVIGATOR IN TYPESCRIPT' ERROR
*/
import React, { Component } from "react";
import { BPSSelect } from "../../Components/BPSSelect";
import { ParitySelect } from "../../Components/ParitySelect";
import { StopBitsSelect } from "../../Components/StopBitsSelect";
import { BrowserComPort } from "../../port/BrowserComPort";
import Modal from "../../Components/HOC/Modal";
import ComSettings from "../../Forms/ComSettings/ComSettings"
interface IMainProps{
}

interface IMainState{
  Counter: number;
  baudRate: number;
  parity: ParityType;
  stopBits: number;
  answer: string;
  showModal: boolean;
}

export default class MainPage extends Component<IMainProps, IMainState> {

  private browserPort: BrowserComPort | void = undefined;
  private AutoSendTimer: any = undefined;

  constructor (props: IMainProps) {
    super(props);
    this.state = {
      Counter:0,
      baudRate: 115200,
      parity: 'none',
      stopBits: 1,
      answer:'---',
      showModal: false
    }
  }

  componentDidMount(){
  }

  increaseCounter(conter: number):number {
    return ++conter;
  }

  onClickHandler() {
    this.getSerialPort();
    this.setState({Counter: this.increaseCounter(this.state.Counter)})
  }

  async getSerialPort() {
    try {
      let com: SerialPort = await BrowserComPort.selectPort();
      if (com) this.browserPort = new BrowserComPort(com);
      console.log(com);
    } catch (e) {
      console.log(e);
      this.browserPort = undefined;
    }
  }

  async onClickApplyComSettingHandler() {
    let opt: SerialOptions = {
      ...this.state,
      dataBits: 8,
      bufferSize: 256
    };
    console.log(opt);
    try {
      await this.browserPort!.initialize(opt);
    } catch(e) {
      console.log(e);
    }
  }

  async sendCMD () {
    var res: string = '';
    try {
      const answer:Array<number> = await this.browserPort!.sendMessage(new Uint8Array([0x01, 0x11, 192, 44]));
      res = String.fromCharCode(...answer.slice(3,-2));
      this.AutoSendTimer = setTimeout(async ()=>{await this.sendCMD()}, 1);
    } catch (e) {
      clearTimeout(this.AutoSendTimer);
      this.setState({Counter: 0});
    }
    this.setState({
      answer: res,
      Counter: this.increaseCounter(this.state.Counter)
    });
  }

  async closePort () {
    try {
      await this.browserPort!.close();
    } catch (e) {
    }
  }

  tougleBPS (e:any) {
    this.setState({baudRate: parseInt(e.target.value)});
  }

  tougleParity (e:any) {
    this.setState({parity: e.target.value});
  }

  tougleStopBits (e: any) {
    this.setState({stopBits: parseInt(e.target.value)});
  }

  openComSettings() {
    this.setState({showModal: true});
  }

  /*
          <FilterSettings
          onExitHandler = {this.handlerFilterFormClose.bind(this)}
          Range = {this.state.query.Range || DefaultRange}
        />
  */
  render(){
    const modal = this.state.showModal
    ? (
      <Modal classes='content-center'>
        <ComSettings onExitHandler={undefined} />
      </Modal>
    )
    : null;

    return (
      <>
        <div>
        <span className="img-16x16" onClick = {()=>this.openComSettings()}>⚙️</span>
        <span>{this.state.Counter}</span>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {()=>this.onClickHandler()}>Select COM</button>
        <BPSSelect default={this.state.baudRate.toString()} onChange={(e)=>this.tougleBPS(e)}/>
        <ParitySelect default={this.state.parity} onChange={(e)=>this.tougleParity(e)}/>
        <StopBitsSelect default={this.state.stopBits.toString()} onChange={(e)=>this.tougleStopBits(e)}/>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {()=>this.onClickApplyComSettingHandler()}>Apply</button>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {()=>this.sendCMD()}>Send</button>
        <p>{this.state.answer}</p>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {()=>this.closePort()}>Close Port</button>
        </div>
        {modal}
      </>
    );
  }
}

function setAdd(arg0: () => any) {
  throw new Error("Function not implemented.");
}
