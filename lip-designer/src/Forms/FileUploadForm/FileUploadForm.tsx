import React, { Component } from 'react';

interface IFileUploadFormProps {}

interface IFileUploadFormState {
  dragging: boolean;
}

export default class FileUploadForm extends Component<IFileUploadFormProps, IFileUploadFormState> {
  constructor(props: IFileUploadFormProps) {
    super(props);
    this.state = {
      dragging: false
    };
    //this.handleFileInputChange = this.handleFileInputChange.bind(this);
  }

  private handleDragEnter (e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragging: true });
  };

  private handleDragLeave (e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragging: false });
  };

  private handleDragOver (e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  };

  private handleDrop (e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragging: false });
    const files = Array.from(e.dataTransfer.files);
    // Обработка загруженных файлов
  };

  private handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>){
    const files = e.target.files;
    if (files) {
      // Обработка выбранных файлов
    }
  };

  openFileDialog () {
    // Открыть окно выбора файлов
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('multiple', 'false');
    input.addEventListener('change', (e:any)=>{this.handleFileInputChange(e)});
    input.click();
  };

  render() {
    return (
      <div
        onDragOver={this.handleDragOver.bind(this)}
        onDragEnter={this.handleDragEnter.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
        onDrop={this.handleDrop.bind(this)}
        style={{ border: `2px dashed ${this.state.dragging?'blue':'red'}`}}
      >
        <input type="file" multiple onChange={this.handleFileInputChange} style={{ display: 'none' }} />
        <button onClick={this.openFileDialog.bind(this)}>Выбрать файл</button>
        <p>или перетащите файл сюда</p>
      </div>
    );
  }
}