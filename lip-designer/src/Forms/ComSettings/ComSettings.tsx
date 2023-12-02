import React, { Component} from "react"
import './ComSettings.css'
import { BPSSelect } from "../../Components/BPSSelect";
import { ParitySelect } from "../../Components/ParitySelect";
import { StopBitsSelect } from "../../Components/StopBitsSelect";
import { BrowserComPort } from "../../port/BrowserComPort";


export interface IComSettings {
  baudRate: number;
  parity: ParityType;
  stopBits: number;
}

export interface IComSettingsCloseHandler {
  (port: BrowserComPort, ComSettings: IComSettings): any;
}

export interface IComSettingsProps {
  ComSettings: IComSettings;
  onExitHandler:IComSettingsCloseHandler;
}

export interface IComSettingsState {
  Settings: IComSettings;
  isPortSelected: boolean;
}

export default class FilterSettings extends Component<IComSettingsProps, IComSettingsState> {

  private browserPort: BrowserComPort | void = undefined;

  constructor (props: IComSettingsProps) {
    super(props);
    this.state={
      Settings: {...props.ComSettings},
      isPortSelected: false
    }
  }
 
  private exitHandler() {
    let ComSettings: IComSettings = {... this.state.Settings};
    this.props.onExitHandler(this.browserPort!, ComSettings);
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
    this.setState({isPortSelected:(this.browserPort === undefined)? false : true});
  }

  async onClickApplyComSettingHandler() {
    let opt: SerialOptions = {
      ...this.state.Settings,
      dataBits: 8,
      bufferSize: 256
    };
    console.log(opt);
    try {
      await this.browserPort!.initialize!(opt);
    } catch(e) {
      console.log(e);
    }
    this.exitHandler();
  }

  tougleBPS (e:any) {
    let Settings: IComSettings = {...this.state.Settings};
    Settings.baudRate = parseInt(e.target.value);
    this.setState({Settings});
  }

  tougleParity (e:any) {
    let Settings: IComSettings = {...this.state.Settings};
    Settings.parity = e.target.value;
    this.setState({Settings});
  }

  tougleStopBits (e: any) {
    let Settings: IComSettings = {...this.state.Settings};
    Settings.stopBits = parseInt(e.target.value);
    this.setState({Settings});
  }

  render(){
    return (
      <div className='search block grid-container'>
        <h3 className='search Header'>Connection Settings</h3>
        <div className={'search Settings'}>
          <button
            className="btn btn-secondary btn-xs"
            onClick = {async ()=>{await this.getSerialPort()}}>Select COM</button>
          <BPSSelect default={this.state.Settings.baudRate.toString()} onChange={(e)=>this.tougleBPS(e)}/>
          <ParitySelect default={this.state.Settings.parity} onChange={(e)=>this.tougleParity(e)}/>
          <StopBitsSelect default={this.state.Settings.stopBits.toString()} onChange={(e)=>this.tougleStopBits(e)}/>
        </div>
        <button
          className = {'search Apply'}
          disabled = {!this.state.isPortSelected}
          onClick = {async ()=>{await this.onClickApplyComSettingHandler()}}
        >Apply</button>
        <button
          className="search Cancel"
          onClick={()=>this.exitHandler()}
        >Cancel</button>
      </div>
    )
  }  
}
