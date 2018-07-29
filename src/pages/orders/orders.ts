import { Component, ViewChild ,ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController, Platform } from 'ionic-angular';
import { MissionsProvider } from './../../providers/missions/missions';
import { Detail } from '../detail/detail';
import { Geolocation ,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation';



declare var google;
declare var offsetHeight;


/**
 * Generated class for the OrdersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-orders',
  templateUrl: 'orders.html',
})
export class Orders {


  missionsList = [];
  CurrentActiveOrder:any;
  options : GeolocationOptions;
  currentPos : Geoposition;
  CurrentLat:number;
  CurrentLan:number;
  heightMapView : string;
  map: any;
  viewHeight: number;
  Markers = [];
  userPosLat:number;
  userPosLng:number;

  public TabIndex:number;





  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  


  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('currentHeader') thetopPart: ElementRef;
  @ViewChild('refresherDIV') refresherDIV: ElementRef;
  

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

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private toastCtrl:ToastController,
    public platform: Platform,
    public missionservice :MissionsProvider,
    private geolocation : Geolocation) {
      console.log("Constructor")
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter OrdersPage');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrdersPage');
    this.getOrders();
  }
  

  ionViewDidEnter() {
    console.log('ionViewDidEnter OrdersPage');
    //Reload Orders list by switching TAB once entering to the view
    this.getOrders();
  }
  
  ionViewWillLeave() {
    console.log('ionViewWillLeave OrdersPage');
  } 

  ionViewDidLeave() {
    console.log('ionViewDidLeave OrdersPage');
  } 
  
  ionViewCanEnter() {
    console.log('ionViewCanEnter OrdersPage');
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
            console.log("Traitement terminé : "+ToConfirme.length)
          });
      }
    }
  });
  }


  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }


getOrders(refResher?){

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
      //this.getUserPosition();
      console.log("Current Active Order"+JSON.stringify(this.CurrentActiveOrder))
      console.log("Sorted Missions : "+JSON.stringify(this.missionsList))


    }else{
     this.presentToast("aucune mission enregistrer");
    }

      console.log(this.missionsList);

      if(refResher){
        setTimeout(() => {
        refResher.complete();
        },800)
      }
  });


}

  detail(id){
    //alert(this.CurrentActiveOrder.id)
    //console.log(id)
    this.navCtrl.push(Detail, {
      id_detail: id,
      id_activeOrder: this.CurrentActiveOrder.id
    });
  }

  initMap(){

    this.options = {
      enableHighAccuracy : false
    };

    this.geolocation.getCurrentPosition(this.options).then((pos : Geoposition) => {
    
          this.userPosLat = pos.coords.latitude;
          this.userPosLng = pos.coords.longitude;
       
 
        this.CurrentLat = pos.coords.latitude ;
        this.CurrentLan = pos.coords.longitude;

        console.log("POS INIT MAP : "+this.userPosLat +" ..... "+this.userPosLng);

        this.map = new google.maps.Map(this.mapElement.nativeElement, {
          zoom: 15,
          panControl: true,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          overviewMapControl: true,
          rotateControl: true,
          center: {lat: this.userPosLat, lng: this.userPosLng}
        });
        

        this.Markers = [];
        if(typeof this.CurrentActiveOrder.infos_loading.location.geo.lat != typeof undefined){
          console.log("GET LOADING MAP INFO")
          console.log("Geo Order position : "+this.CurrentActiveOrder.infos_loading.location.geo.lat+" / "+this.CurrentActiveOrder.infos_loading.location.geo.lng);
          this.CurrentLat= this.CurrentActiveOrder.infos_loading.location.geo.lat;
          this.CurrentLan= this.CurrentActiveOrder.infos_loading.location.geo.lng;
          this.Markers.push(  {'lan': this.CurrentLat, 'lng': this.CurrentLan, 'info': this.CurrentActiveOrder.infos_loading.location.name, 'icon':'assets/imgs/loading_marker.png'} );
        }
    
        if(this.CurrentActiveOrder.infos_delivery.location.geo.lat != ""){
          console.log("GET DELIVERY MAP INFO")
          console.log("Geo Order position : "+this.CurrentActiveOrder.infos_delivery.location.geo.lat+" / "+this.CurrentActiveOrder.infos_loading.location.geo.lng);
          this.CurrentLat= this.CurrentActiveOrder.infos_delivery.location.geo.lat;
          this.CurrentLan= this.CurrentActiveOrder.infos_delivery.location.geo.lng;
          this.Markers.push(  {'lan': this.CurrentLat, 'lng': this.CurrentLan, 'info': this.CurrentActiveOrder.infos_delivery.location.name, 'icon':'assets/imgs/loading_marker.png'} );
        }
        this.Markers.push(  {'lan': pos.coords.latitude, 'lng': pos.coords.longitude, 'info': 'Votre position actuelle', 'icon':'assets/imgs/loading_marker.png'} );
     
        for(let ii=0 ; ii < this.Markers.length; ii++){
          if(ii == 2){
          //console.log(this.Markers[ii].lan+" / "+ii+" / "+ this.Markers[ii].info)
          let icon = {
            url: this.Markers[ii].icon , // url
            scaledSize: new google.maps.Size(32, 35), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(0, 20) // anchor
         };

          let marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: {lat: this.Markers[ii].lan, lng: this.Markers[ii].lng}
          //icon: icon
          });

          let content = "<div class='infoWindow'><p>"+this.Markers[ii].info+"</p></div>";
          let infoWindow = new google.maps.InfoWindow({
          content: content
          });
          google.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(this.map, marker);
          });
        }
      }


        this.directionsDisplay.setMap(this.map);
        let start = new google.maps.LatLng(this.Markers[1].lan, this.Markers[1].lng);
         let end  = new google.maps.LatLng(this.Markers[0].lan, this.Markers[0].lng)
         this.directionsService.route({
          origin: start,
          destination: end,
          travelMode: 'DRIVING'
        }, (response, status) => {
          if (status === 'OK') {
            this.directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
          });
          




          console.log(" TM ==== "+ this.Markers.length)
          console.log(" MARKERS "+ JSON.stringify(this.Markers))


      },(err : PositionError)=>{
        console.log("error : " + err.message);
    })
  }
  
  koko(lat,lng){
    var GOOGLE = {lat, lng};
    this.map.setCenter(GOOGLE);
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


  parseFloat(floatIt){
     return parseFloat(floatIt);
  }


getUserPosition(){
    this.initMap();
    this.AdjustMapHeight();
}

reloadMap(){
  setTimeout(() => {
  this.getUserPosition();
  },0)
  console.log("########## Map reloaded ###########")
}


  addMarker(Markers){
       console.log("TOTAL MARKERS : "+Markers.length)
  }



  doRefresh(refresher) {
    let refResh = refresher;
    this.getOrders(refResh);
    console.log('Begin async operation', refresher);
  }

  getIdxTab(tabIdx){
    console.log("Index tab : "+tabIdx.index);
    this.TabIndex = tabIdx.index;
    if(this.TabIndex == 1){
      this.getUserPosition();
    }
  }
 
  
}














// for(let ii=0 ; ii < this.Markers.length; ii++){
//   console.log(this.Markers[ii].lan+" / "+ii+" / "+ this.Markers[ii].info)
//   let marker = new google.maps.Marker({
//    map: this.map,
//    animation: google.maps.Animation.DROP,
//    position: {lat: this.Markers[ii].lan, lng: this.Markers[ii].lng}
//    //icon: Markers[ii].icon
//    });

//    let content = "<div id='infoWindow'><p>"+this.Markers[ii].info+"</p></div>";
//    let infoWindow = new google.maps.InfoWindow({
//    content: content
//    });
//  //google.maps.event.addListener(marker, 'click', () => {
//    //infoWindow.open(this.map, marker);
//  //});
// }

// this.directionsDisplay.setMap(this.map);
// let start = new google.maps.LatLng(this.Markers[0].lan, this.Markers[0].lng);
// let end  = new google.maps.LatLng(this.Markers[1].lan, this.Markers[1].lng)
// this.directionsService.route({
//   origin: start,
//   destination: end,
//   travelMode: 'DRIVING'
// }, (response, status) => {
//   if (status === 'OK') {
//     this.directionsDisplay.setDirections(response);
//   } else {
//     window.alert('Directions request failed due to ' + status);
//   }
// });