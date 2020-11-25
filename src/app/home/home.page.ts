import { Component, ElementRef, ViewChild } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map: google.maps.Map;
  minhaPosicao: google.maps.LatLng;

  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  constructor(private geolocation: Geolocation) {
  }

  async buscarPosicao() {
    await this.geolocation.getCurrentPosition().then((resp) => {

      this.minhaPosicao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);

      this.irParaMinhaPosicao();

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  ionViewWillEnter() {
    this.exibirMapa();
  }

  public exibirMapa(): void {
    const posicao = new google.maps.LatLng(-22.194072, -48.778882);
    const opcoes = {
      center: posicao,
      zoom: 1,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, opcoes);

    /*const marker = new google.maps.Marker({
      position: { lat: -22.194916, lng: -48.779311 },
      title: 'Prefeitura Municipal',
      map: this.map
    });*/

    this.buscarPosicao();

  }

  public irParaMinhaPosicao() {
    this.map.setCenter(this.minhaPosicao);
    this.map.setZoom(15);

    const marker = new google.maps.Marker({
      position: this.minhaPosicao,
      title: 'Minha posição!',
      animation: google.maps.Animation.BOUNCE,
      map: this.map,
      icon: 'assets/user-location.png'
    });
  }


}
