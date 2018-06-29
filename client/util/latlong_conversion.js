// export const parseAddressToLatLng = function(address, callback) {
//   const geocoder = new google.maps.Geocoder;
//   geocoder.geocode({ address: address }, (results, status) => {
//     if (status === 'OK') {
//       const addressLatLng = new google.maps.LatLng(
//         results[0].geometry.location.lat(),
//         results[0].geometry.location.lng()
//       );
//       this.props.centerMap(addressLatLng);
//       this.setState({ addressLatLng }, () => {
//         this.getBoundaries();
//       });
//     } else {
//       alert('Geocode was not successful for the following reason: ' + status);
//       this.setState({
//         addressLatLng: '',
//         formSubmitted: false
//       }, () => {
//         this.getBoundaries();
//       });
//     }
//   });
// };

export const parseAddressToLatLng = function(address) {
  const geocoder = new google.maps.Geocoder;
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === 'OK') {
      const addressLatLng = new google.maps.LatLng(
        results[0].geometry.location.lat(),
        results[0].geometry.location.lng()
      );

      return addressLatLng;
    } else {
      return false;
    }
  });
};
