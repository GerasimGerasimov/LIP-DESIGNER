const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  //как прикрутить к Electron выбор последовательных портов из браузера Chrome
  //Инфа взята от сюда
  //https://gist.github.com/jkleinsc/284893c7f01d3cb4559508ca06919481#file-main-js-L21
  //не совсем то, я получаю лишь список портов, но диалог не вызывается, требуется его создать самостоятельно

  win.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    console.log('SELECT-SERIAL-PORT FIRED WITH', portList);

    //Display some type of dialog so that the user can pick a port
    //dialog.showMessageBoxSync({});
    event.preventDefault();
    
    let selectedPort = portList.find((device) => {      
      // Automatically pick a specific device instead of prompting user
      //return device.vendorId == 0x2341 && device.productId == 0x0043;

      // Automatically return the first device
      return true;
    });
    if (!selectedPort) {
      callback('')
    } else {
      callback(selectedPort.portId)
    }
  })

  win.webContents.session.on('serial-port-added', (event, port) => {
    console.log('serial-port-added FIRED WITH', port);
    event.preventDefault();
  })

  win.webContents.session.on('serial-port-removed', (event, port) => {
    console.log('serial-port-removed FIRED WITH', port);
    event.preventDefault();
  })
  
  win.webContents.session.on('select-serial-port-cancelled', () => {
    console.log('select-serial-port-cancelled FIRED.');
  })
  
  win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    // This permission check handler is not needed by default but available if you want to limit serial requests
    console.log(`In PermissionCheckHandler`);
    console.log(`Webcontents url: ${webContents.getURL()}`);
    console.log(`Permission: ${permission}`);
    console.log(`Requesting Origin: ${requestingOrigin}`, details);  
    return true;
  });  

  //load the index.html from a url
  win.loadURL('http://localhost:3000');

  // Open the DevTools.
  win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.