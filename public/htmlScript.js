   // Form submission handler
    const form = document.getElementById('scrapeForm');
    let map;
    //These are locations on our map that we set. 
    let markers = [];

    //This is what happens directly after we submit our form. 
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const products = document.getElementById('products').value;
      const resultsDiv = document.getElementById('results');
      
      resultsDiv.innerHTML = '<div class="loading">Searching for products...</div>';

      try {
        const response = await fetch(`/scrape?products=${encodeURIComponent(products)}`);
        //Here fetch is used to connect to the backend server and seperate the data. 
        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }
        
        const data = await response.json();
        displayResults(data);
      } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
      }
    });

    //Display Product Results
    function displayResults(data) {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '';

      data.forEach(store => {
        const storeDiv = document.createElement('div');
        storeDiv.className = 'store-result';
        
        storeDiv.innerHTML = `<h2>${store.storeName}</h2>`;
        
        store.results.forEach(query => {
          const queryDiv = document.createElement('div');
          queryDiv.className = 'product-result';
          
          queryDiv.innerHTML = `
            <h3>Results for "${query.query}":</h3>
            ${query.products.length > 0 ? 
              query.products.map(item => 
                `<p><strong>${item.productName}</strong>: $${item.price.toFixed(2)}</p>`
              ).join('') :
              '<p>No products found</p>'
            }
          `;
          
          storeDiv.appendChild(queryDiv);
        });
        
        resultsDiv.appendChild(storeDiv);
      });
    }

    // Initialize Google Map
    async function initMap() {
      try {
        const location = await getLocationFromIP();
        const userLocation = { 
          lat: parseFloat(location.latitude), 
          lng: parseFloat(location.longitude) 
        };
        //The map is configured by loccation in HTML and location on map itself
        map = new google.maps.Map(document.getElementById("map"), {
          center: userLocation,
          zoom: 13
        });

        // Add marker for user location
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Your Location",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        document.getElementById("map").innerHTML = "Error loading map";
      }
    }

    // Fetch Grocery Stores
    async function fetchGroceryStores() {
      const storeListContainer = document.getElementById("store-list");
      storeListContainer.innerHTML = '<div class="loading">Finding nearby stores...</div>';

      try {
        const response = await fetch('/grocery-location');
        if (!response.ok) {
          throw new Error('Failed to fetch store data');
        }

        const data = await response.json();
        displayStores(data.storeLocations);
      } catch (error) {
        storeListContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
      }
    }

    // Display stores on map and in list
    //Note that the stores variable comes from fetchGroceryStores function
    function displayStores(stores) {
      const storeListContainer = document.getElementById("store-list");
      storeListContainer.innerHTML = "";

      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      markers = [];

      // Here we make a for loop for all the stores in the stores list and then we add them to our markers. 
      stores.forEach((store, index) => {
        // Create list item 
        console.log(store);
        const storeItem = document.createElement("div");
        storeItem.className = "store-item";
        storeItem.innerHTML = `
          <h3>${store.name}</h3>
          <p>${store.address}</p>
        `;
        storeListContainer.appendChild(storeItem);

        // Add marker to map
        const marker = new google.maps.Marker({
          position: store.location,
          map: map,
          title: store.name,
          label: (index + 1).toString()
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <h3>${store.name}</h3>
              <p>${store.address}</p>
            </div>
          `
        });
        // Here we add a listener to the marker, this was done through the Google API. 
        //In the future here, I want to add, Price, Distance, and overall score. 
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        //Here we add the marker we jsut made to our marker array. 
        markers.push(marker);
      });

      // Fit map to show all markers if there are any
      if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
      }
    }

    // Get location from IP
    async function getLocationFromIP() {
      try {
        const response = await fetch('https://ipinfo.io/json?token=36ffe8ac3653dd');
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        const data = await response.json();
        const [latitude, longitude] = data.loc.split(',');
        return { latitude, longitude };
      } catch (error) {
        console.error('Error getting location:', error);
        // Default to a fallback location if we can't get the user's location
        return { latitude: "39.952217", longitude: "-75.193214" };
      }
    }