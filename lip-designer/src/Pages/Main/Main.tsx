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
    this.setState({Counter: this.increaseCounter(this.state.Counter)})
  }

  render(){
    return (
      <>
      <span>{this.state.Counter}</span>
      <button
        className="btn btn-secondary btn-xs"
        onClick = {()=>this.onClickHandler()}>Click Me</button>
      </>
    );
  }
}

function setAdd(arg0: () => any) {
  throw new Error("Function not implemented.");
}
