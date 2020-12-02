import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map: google.maps.Map;
  minhaPosicao: google.maps.LatLng;

  private autocomplete = new google.maps.places.AutocompleteService();
  private directions = new google.maps.DirectionsService();
  private directionsRender = new google.maps.DirectionsRenderer();

  public listaEnderecos: any = [];

  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  constructor(private geolocation: Geolocation, private ngZone: NgZone) {
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

  buscarEndereco(campoBusca: any) {
    const busca = campoBusca.target.value as string;

    if (!busca.trim().length) { this.listaEnderecos = []; return false; }

    this.autocomplete.getPlacePredictions({ input: busca }, (arrayLocais, status) => {
      if (status == 'OK') {
        this.ngZone.run(() => {
          this.listaEnderecos = arrayLocais;
        });
      } else {
        this.listaEnderecos = [];
      }
    });
  }

  public tracarRota(local: google.maps.places.AutocompletePrediction) {
    this.listaEnderecos = [];
    new google.maps.Geocoder().geocode({ address: local.description }, (resultado) => {
      /*
      this.map.setCenter(resultado[0].geometry.location);
      this.map.setZoom(19);
      */

      const marker = new google.maps.Marker({
        position: resultado[0].geometry.location,
        title: resultado[0].formatted_address,
        animation: google.maps.Animation.DROP,
        map: this.map
      });

      const rota: google.maps.DirectionsRequest = {
        origin: this.minhaPosicao,
        destination: resultado[0].geometry.location,
        unitSystem: google.maps.UnitSystem.METRIC,
        travelMode: google.maps.TravelMode.DRIVING
      };

      this.directions.route(rota, (result, status) => {
        if (status == 'OK') {
          this.directionsRender.setMap(this.map);
          this.directionsRender.setOptions({ suppressMarkers: true });
          this.directionsRender.setDirections(result);
        }
      });
    });
  }
}
