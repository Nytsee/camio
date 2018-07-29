import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { MissionsProvider } from './../missions/missions';
import 'rxjs/add/operator/filter';
/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTrackerProvider {
  public watch: any;
  public lat: number = 0;
  public lng: number = 0;

  constructor(public zone: NgZone,
    private geolocation : Geolocation,
    private backgroundGeolocation:BackgroundGeolocation,
    public missionservice :MissionsProvider ) {
    console.log('Hello LocationTrackerProvider Provider');
  }
  
  startTracking(status,mission_id) {

    if(status==2 || status==4){
      let config = {
        desiredAccuracy: 0,
        stationaryRadius: 20,
        distanceFilter: 10,
        debug: true,
        interval: 2000
      };
      this.backgroundGeolocation.configure(config).subscribe((location) => {

        this.zone.run(() => {
          this.lat = location.latitude;
          this.lng = location.longitude;
        });
    
      }, (err) => {

        console.log(err);

      });
      this.backgroundGeolocation.start();
      let options = {
        frequency: 3000,
        enableHighAccuracy: true
      };
        this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

        console.log(position);
        console.log('BackgroundGeolocation:  ' + position.coords.latitude + ',' + position.coords.longitude);
        this.missionservice.setLocation(mission_id,position.coords.latitude,position.coords.longitude);
        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
        });

      });
    }
  }


  stopTracking() {
    console.log('Stop Tracking');
    this.backgroundGeolocation.finish();
    if(this.watch){
      this.watch.unsubscribe();
    }
  }

 } //End LocationTrackerProvider
