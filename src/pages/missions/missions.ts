
import { Component, ViewChild ,ElementRef } from '@angular/core';

import  $ from 'jquery';
import {TweenMax} from 'gsap';

import { MissionsProvider } from './../../providers/missions/missions';
import { IonicPage, NavController, NavParams,ToastController, Platform } from 'ionic-angular';
import { Geolocation ,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation';
import { Detail } from '../detail/detail';


declare var google;
declare var offsetHeight;


/**
 * Generated class for the MissionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@IonicPage()
@Component({
  selector: 'page-missions',
  templateUrl: 'missions.html',
})
export class Missions {

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('currentHeader') thetopPart: ElementRef;

  missionsList = [];
  currentDate: string = new Date().toISOString();
  options : GeolocationOptions;
  currentPos : Geoposition;
  heightMapView : string;
  viewHeight: number;
  CurrentLat:any;
  CurrentLan:any;
  CurrentActiveOrder:any;
  Markers = [];
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  map: any;



  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public missionservice :MissionsProvider,
    private toastCtrl:ToastController,
    private geolocation : Geolocation) {
    this.getMissions();
  }

  IconMission:any = [
    ["pan_tool"],
    ["check_circle"],
    ["swap_calls"],
    ["flag"],
    ["publish"],
    ["directions_walk"],
    ["location_on"],
    ["thumb_up"]
  ];



  ionViewDidLoad() {
  }

  //declartation des foncion pour la map google

  ionViewDidEnter(){
    setTimeout(() => {
      if(this.CurrentActiveOrder){
        let ToConfirme = new Array();
        this.missionservice.setConfirmedMissions().subscribe((data)=>{
        if(data) {
          data.forEach(function (value) {
              if(value.status == 0){
              ToConfirme.push(value.id);
              }
          });
          if(ToConfirme.length > 0){
            this.missionservice.doConfirmMissions(ToConfirme)
            .subscribe(res => {
              this.getMissions();
              });
          }
        }else{
          this.presentToast("aucune mission enregistrer");
        }
      });
      }
    }, 500);
  }


  AdjustMapHeight(){
    this.viewHeight = this.thetopPart.nativeElement.offsetHeight
    if (this.platform.is('android')) {
      this.heightMapView = (document.documentElement.clientHeight-(this.viewHeight*2)+10) +"px";
    }
    if (this.platform.is('ios')) {
      this.heightMapView = (document.documentElement.clientHeight-(this.viewHeight*2)+15) +"px";
    }
  }
  getUserPosition(){
        if(typeof this.CurrentActiveOrder.infos_loading.location.geo.lat != typeof undefined){
          console.log("ITS FULL")
          console.log("Geo Order position : "+this.CurrentActiveOrder.infos_loading.location.geo.lat+" / "+this.CurrentActiveOrder.infos_loading.location.geo.lng);
          this.CurrentLat= this.CurrentActiveOrder.infos_loading.location.geo.lat;
          this.CurrentLan= this.CurrentActiveOrder.infos_loading.location.geo.lng;
          this.Markers.push(  {'lan': this.CurrentLat, 'lng': this.CurrentLan, 'info': this.CurrentActiveOrder.infos_loading.location.name, 'icon':'http://maps.google.com/mapfiles/kml/pal5/icon20.png'} );
        }

        if(this.CurrentActiveOrder.infos_delivery.location.geo.lat != ""){
          console.log("Geo Order position : "+this.CurrentActiveOrder.infos_delivery.location.geo.lat+" / "+this.CurrentActiveOrder.infos_loading.location.geo.lng);
          this.CurrentLat= this.CurrentActiveOrder.infos_delivery.location.geo.lat;
          this.CurrentLan= this.CurrentActiveOrder.infos_delivery.location.geo.lng;
          this.Markers.push(  {'lan': this.CurrentLat, 'lng': this.CurrentLan, 'info': this.CurrentActiveOrder.infos_delivery.location.name, 'icon':'http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png'} );
        }
        this.AdjustMapHeight();
  }


koko(lat,lng){
  var GOOGLE = {lat, lng};
  this.map.setCenter(GOOGLE);
}

  addMarker(Markers){

    for(let ii=0 ; ii < Markers.length; ii++){
         console.log(Markers[ii].lan+" / "+ii+" / "+ Markers[ii].info)
         let marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: {lat: Markers[ii].lan, lng: Markers[ii].lng}
          //icon: Markers[ii].icon
          });

          let content = "<div id='infoWindow'><p>"+Markers[ii].info+"</p></div>";
          let infoWindow = new google.maps.InfoWindow({
          content: content
          });

        //google.maps.event.addListener(marker, 'click', () => {
          //infoWindow.open(this.map, marker);
        //});
    }
  }

  getMissions(){
    this.missionservice.getMissions().subscribe((data)=>{
      if(data) {
        this.missionsList = data;
        console.log("La list des missions : " +this.missionsList);

        //console.log("Missions : "+JSON.stringify(this.missionsList[0].infos_loading.location.time_start));
        console.log(" Total : "+this.missionsList.length)

        this.missionsList.sort((a,b) => {
          let orderA = (a.status < 4) ? a.infos_loading.location.time_start : a.infos_delivery.location.time_start ;
          let orderB = (b.status < 4) ? b.infos_loading.location.time_start : b.infos_delivery.location.time_start ;
          // console.log("A : "+orderA);
          //console.log("B : "+orderB);
          if (orderA > orderB){
            return 1;
          }
          if (orderA < orderB){
            return -1;
          }
          return 0;
        })


        this.CurrentActiveOrder = this.missionsList[0];
        this.getUserPosition();
        console.log("Current Active Order"+JSON.stringify(this.CurrentActiveOrder))
        console.log("Sorted Missions : "+JSON.stringify(this.missionsList))


      }else{
        this.presentToast("aucune mission enregistrer");
      }

        console.log(this.missionsList);
    });
  }



  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  detail(id){
    //alert(this.CurrentActiveOrder.id)
    //console.log(id)
    this.navCtrl.push(Detail, {
      id_detail: id,
      id_activeOrder: this.CurrentActiveOrder.id
    });
  }
}
