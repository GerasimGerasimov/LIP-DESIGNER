interface onDataBrowserCallBack {
  ():any;
}

export class BrowserComPort {

  public onData: onDataBrowserCallBack;
  private com: SerialPort | undefined = undefined;
  private data: Array<number> = [];
  private ChunkEndTimer: any = undefined;
  private ChunkEndTime: number = 10;
  private TimeOutTimer: any = undefined;
  
  private reader: any = undefined;
  
  constructor (com: SerialPort) {
    this.com = com;
    this.onData = this.onDataDefault;
  }

  private onDataDefault():any {
    return 0;
  }

  async readChunk() {
      this.reader = this.com!.readable?.getReader();
      const reader = this.reader;
        try {
          while (true) {
            const {done, value} = await reader.read();
            if (done) {
              console.log('DONE',this.data);
              //reader.releaseLock();
              break;
            }
            if (value) {
              console.log('CHUNK:', value);
              this.data.push(...value);
              //reader.releaseLock();
            } else {
              console.log('LEN=0',this.data);
              reader.releaseLock();
            }
          }
        } catch (error) {
          console.log('ERROR:',error);
          reader.releaseLock();
        }
    }
    /*
      if (reader) {
        try {
            
            if (value) {
              
              if (value.length == 0) {
                throw new Error('empty');
              }
            }
            if (done) {
              throw new Error('empty');
            };
            reader.releaseLock();
            this.ChunkEndTimer = setTimeout(() =>{this.onChunkEndTime()}, this.ChunkEndTime);
        } catch (error) {
          //console.log(error);
          console.log(this.comRespondData);
          clearTimeout(this.ChunkEndTimer);
          reader.releaseLock();
        }
        //this.comRespondData = values;
        //console.log(this.comRespondData);
        }
        reader.releaseLock();
      }
    }
    */

    private onTimeOut() {
      clearTimeout(this.TimeOutTimer);
      console.log('time out');
    }
  
    private onChunkEndTime() {
      console.log('read chank time');
      clearTimeout(this.ChunkEndTimer);
      this.readChunk();
    }

  public async sendMessage(uint8Array:Uint8Array) {
    this.data = [];
    const writer: WritableStreamDefaultWriter<Uint8Array> | undefined = this.com!.writable?.getWriter();
    await writer!.write(uint8Array);
    writer!.releaseLock();
    this.TimeOutTimer  = setTimeout(()=>{this.onTimeOut()}, 3000);
    /*
    
    if (this.reader) this.reader.close();
    const writer: WritableStreamDefaultWriter<Uint8Array> | undefined = this.COM?.writable?.getWriter();
    let uint8Array:Uint8Array = new Uint8Array([0x01, 0x11, 192, 44]);
    await writer?.write(uint8Array);
    writer?.releaseLock();
    //this.TimeOutTimer  = setTimeout(()=>{this.onTimeOut()}, 3000);
    this.ChunkEndTimer = setTimeout(() =>{this.onChunkEndTime()}, 3000);
    */
  }

  public async initialize (opt: SerialOptions) {
    try {
      await this.com!.open(opt);
    } catch(error) {
      throw new Error('An error occurred while port initializing: '+error);
    }
  }

  public static async selectPort(): Promise <SerialPort> {
    try {
      return await navigator.serial.requestPort({ filters: []});
    } catch (e) {
      throw new Error('port is not selected');
    }
  }
}

/*
  async _readReceivedData(): Promise<Array<number>> {
    var values: Array<number> = [];
    if (this.COM) {
      const reader = this.COM.readable?.getReader();
      if (reader) {
        try {
          while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            values.push(...value);
            console.log(values);
          }
        }
        finally {
          reader.releaseLock();
        }
      }
    }
    return values;
  }
*/

/*
  async readReceivedData(): Promise<Array<number>> {
    var values: Array<number> = [];
    if (this.COM) {
        const reader = this.COM.readable?.getReader();
        if (reader) {
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
              values.push(...value);
              //console.log(value);
            }
          } catch (error) {
            // Handle |error|…
            console.log(error);
          } //finally {
            reader.releaseLock();
          //}
        }
    }
    return values;
  }
*/