/*
https://robkendal.co.uk/blog/how-to-fix-property-does-not-exist-on-window-type-in-typescript
побеждал 'PROPERTY SERIAL DOES NOT EXIST ON TYPE NAVIGATOR IN TYPESCRIPT' ERROR
*/
import React, { Component } from "react";
import { BrowserComPort } from "../../port/BrowserComPort";
import Modal from "../../Components/HOC/Modal";
import ComSettings, { IComSettings } from "../../Forms/ComSettings/ComSettings"
import FileUploadForm from "../../Forms/FileUploadForm/FileUploadForm";
interface IMainProps{
}

interface IMainState{
  Counter: number;
  ComSettings: IComSettings;
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
      ComSettings: {
        baudRate: 115200,
        parity: 'none',
        stopBits: 1,
        isComReadyToUse: false,
      },
      answer:'---',
      showModal: false
    }
  }

  componentDidMount(){
  }

  increaseCounter(conter: number):number {
    return ++conter;
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
      clearTimeout(this.AutoSendTimer);
      await this.browserPort!.close();
    } catch (e) {
      console.error(e);
    }
  }

  openComSettings() {
    this.setState({showModal: true});
  }

  setSelectedSerialPort(port: BrowserComPort, ComSettings: IComSettings) {
    this.browserPort = port;
    this.setState({showModal: false, ComSettings});
  }

  async openFile() {
    const filename: string = "D:/Project/EFi_Tomsk/FirmWare/OLED_BAREMETALL_V3/App/src/Ajuster/OLED_SETTINGS.ini";
    const root = await navigator.storage.getDirectory();
    try {
     const fileHandle = await root.getFileHandle(filename, { create: false });
    } catch (e) {
      console.log(e);
    }
  }

  render(){
    const modal = this.state.showModal
    ? (
      <Modal classes='content-center'>
        <ComSettings onExitHandler={this.setSelectedSerialPort.bind(this)} ComSettings={this.state.ComSettings}/>
      </Modal>
    )
    : null;

    return (
      <>
        <div>
        <span className="img-16x16" onClick = {()=>this.openComSettings()}>⚙️</span>
        <FileUploadForm/>
        <span>{this.state.Counter}</span>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {async ()=>{await this.sendCMD()}}>Send</button>
        <p>{this.state.answer}</p>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {async ()=>{await this.closePort()}}>Close Port</button>
        </div>
        <button
          className="btn btn-secondary btn-xs"
          onClick = {async ()=>{await this.openFile()}}>OpenFile</button>
        {modal}
      </>
    );
  }
}