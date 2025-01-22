// grocery-location.js
const axios = require('axios');

const getLocationFromIP = async () => {
  try {
    const response = await axios.get('https://ipinfo.io/json?token=36ffe8ac3653dd');
    const location = response.data.loc;
    const [latitude, longitude] = location.split(',');
    return { latitude, longitude };
  } catch (error) {
    console.error('Error getting location:', error);
    return { latitude: "39.952217", longitude: "-75.193214" };
  }
};

const getNearbyGroceryStores = async (latitude, longitude) => {
  const apiKey = 'AIzaSyDqsSuEJNTpCH2BxaPb5hoMSeeC9a5D8Bk';
  const searchRadius = 2000;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${searchRadius}&type=grocery_or_supermarket&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data.results.map(store => ({
      name: store.name,
      address: store.vicinity,
      location: store.geometry.location
    }));
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
};

const getGroceryStores = async () => {
  const location = await getLocationFromIP();
  const storeLocations = await getNearbyGroceryStores(location.latitude, location.longitude);
  return { location, storeLocations };
};

module.exports = { getGroceryStores };