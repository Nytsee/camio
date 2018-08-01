import { Login } from './../pages/login/login';
import { Chatlist } from './../pages/chatlist/chatlist';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SplitPaneProvider } from './../providers/split-pane/split-pane';
import { Orders } from '../pages/orders/orders';
// import { FCM } from '@ionic-native/fcm';
// declare var FCMPlugin;

@Component({
  templateUrl: 'app.html'
})


export class MyApp {
  rootPage;
  

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public splitPane:SplitPaneProvider
    // private fcm: FCM
    ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
        statusBar.overlaysWebView(false);
        statusBar.backgroundColorByHexString('#139CD3');
        splashScreen.hide();
        //console.log(localStorage.getItem('id'))

        // this.fcm.subscribeToTopic(localStorage.getItem('id'));

        // this.fcm.onNotification().subscribe(data => {
        //   if(data.wasTapped){
        //     console.log("Received in background");
        //   } else {
        //     console.log("Received in foreground");
        //   };
        // });

        if(localStorage.getItem('id')){
          this.rootPage = Orders;          
          //this.pushSetup();
        }else{
          this.rootPage = Login;
        }
    });
  }
}

