import React, { Component} from "react"
import './ComSettings.css'

/*
export interface IComSettingsCloseHandler {
  (result: IComhRangQuery | undefined): any;
}*/

export interface IComSettingsProps {
  onExitHandler:undefined;//IComSettingsCloseHandler;
}

export interface IFilterSettingsState {

}

export default class FilterSettings extends Component<IComSettingsProps, IFilterSettingsState> {

  private refEvent    = React.createRef<HTMLSelectElement>();

  constructor (props: IComSettingsProps) {
    super(props);
    this.state={
    }
  }
 
  componentDidMount(){
    //this.refEvent.current!.value = "!!!";
  }

  private exitHandler() {
      //this.props.onExitHandler(query);
  }

  render(){
    return (
      <div className='search block grid-container'>
        <h3 className='search Header'>Connection Settings</h3>
        <button
          className={'btn btn-primary btn-xs search Search'}
          onClick={()=>this.exitHandler()}
        >Search</button>
        <button
          className="btn btn-secondary btn-xs search Cancel"
          //onClick={()=>this.props.onExitHandler(undefined)}
        >Cancel</button>
      </div>
    )
  }  
}
