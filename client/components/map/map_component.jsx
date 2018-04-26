import React from 'react';
import async from 'async';

import UserInputForm from '../user/user_input_form';
import MapStyle from './map_style';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.directionsServiceObject = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();

    this.state = {
      userLocation: null,
      userAddress: null,
    };

    this.getUserLocation = this.getUserLocation.bind(this);
    this.initializeMap = this.initializeMap.bind(this);
    this.centerMap = this.centerMap.bind(this);
    this.drawBoundaries = this.drawBoundaries.bind(this);
    this.newMarker = this.newMarker.bind(this);
    this.landOrWater = this.landOrWater.bind(this);
    this.snapToNearestRoad = this.snapToNearestRoad.bind(this);
  }

  componentDidMount() {
    this.initializeMap();
    this.getUserLocation();
  }

  componentDidUpdate() {
    this.initializeMap();
  }

  initializeMap() {
    const sfCenter = { lat: 37.773972, lng: -122.431297 };
    const center = this.state.userLocation || sfCenter;

    const mapOptions = {
      center: center,
      zoom: 13,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: MapStyle
    };

    this.map = new google.maps.Map(this.refs.renderedMap, mapOptions);
    this.marker = new google.maps.Marker({
          position: center,
          map: this.map,
          // title: 'Hello World!'
        });
  }

  centerMap(locationLatLng) {
    this.setState({
      userLocation: locationLatLng
    });
  }

  getUserLocation() {
    const successCallback = position => {
      const parsedLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.setState({ userLocation: parsedLocation });

      const geocoder = new google.maps.Geocoder;
      geocoder.geocode({ location: parsedLocation }, (results, status) => {
        if (status === 'OK') {
          this.setState({ userAddress: results[0].formatted_address });
        }
      });
    };

    const errorCallback = error => {
      console.log("Can't get user location, using default SF location");
      const parsedLocation = this.marker.position;
      this.setState({userLocation: parsedLocation});

      const geocoder = new google.maps.Geocoder;
      geocoder.geocode({ location: parsedLocation }, (results, status) => {
        if (status === 'OK') {
          this.setState({ userAddress: results[0].formatted_address });
        }
      });
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
      timeout: 5000,
      enableHighAccuracy: true
    });
  }

  newMarker(pos) {
    new google.maps.Marker({
      position: pos,
      map: this.map,
      title: `${pos.lat()}, ${pos.lng()}`
    });
  }

  drawBoundaries(boundaries) {
    let boundariesArray = [];

    for (let i = 0; i < 18; i++) {
      boundariesArray.push(i);
    }

    boundariesArray = boundariesArray.map(index => {
      const boundaryLatLng = boundaries[index];
      this.landOrWater(boundaryLatLng, res => console.log(`${index}`, res));
      return boundaryLatLng;
    });

    boundariesArray.forEach((boundary, index) => {
      new google.maps.Marker({
        position: boundary,
        map: this.map,
        title: `${index}`
      });
    });

    const bermudaTriangle = new google.maps.Polygon({
         paths: boundariesArray,
         strokeColor: '#FF0000',
         strokeOpacity: 0.8,
         strokeWeight: 3,
         fillColor: '#FF0000',
         fillOpacity: 0.35
       });
    const bounds = new google.maps.LatLngBounds();
    boundariesArray.forEach((coord) => bounds.extend(coord));
    this.map.fitBounds(bounds);
    bermudaTriangle.setMap(this.map);
  }

  landOrWater(position, callback) {
    const mapUrl = `http://maps.googleapis.com/maps/api/staticmap?center=${position.lat()},${position.lng()}&zoom=${this.map.getZoom()}&size=1x1&maptype=roadmap`
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let result;

    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = mapUrl;

    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
        const pixelData = canvas.getContext('2d').getImageData(0, 0, 1, 1).data;
        if (pixelData[0] > 160 && pixelData[0] < 181 && pixelData[1] > 190 && pixelData[1] < 210) {
          result = "water";
        } else {
          result = "land";
        }
        callback(result);
    };
  }

  snapToNearestRoad(position) {
    const directionsService = new google.maps.DirectionsService();
    const request = {
        origin: position,
        destination: position,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route(request, (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        position: response.routes[0].legs[0].start_location,
      }
    });
  }

  render() {
    let form;
    if (this.state.userAddress) {
      form = <UserInputForm
                currentAddress={this.state.userAddress}
                parseAddressToLatLng={this.parseAddressToLatLng}
                drawBoundaries={this.drawBoundaries}
                newMarker={this.newMarker}
                map={this.map}
              />;
    }

    return (
      <div className="map-component">
        <div ref="renderedMap" id="map-container" />
        {form}
      </div>
    );
  }
}

export default Map;
