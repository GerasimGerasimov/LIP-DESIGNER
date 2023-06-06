import React, { Component } from "react";

interface IMainProps{
}

interface IMainState{
  Counter: number;
}

export default class MainPage extends Component<IMainProps, IMainState> {
  constructor (props: IMainProps) {
    super(props);
    this.state = {
      Counter:0
    }
  }

  increaseCounter(conter: number):number {
    //TODO сделать инкремент через WASM
    return ++conter;
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