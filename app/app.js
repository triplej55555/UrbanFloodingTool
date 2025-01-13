    // Your access token can be found at: https://ion.cesium.com/tokens.
    // This is the default access token from your ion account
    

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MGMxODg4OC1kMzY3LTQ2YWEtOGE3ZC02NTZhMjhlYzMyM2IiLCJpZCI6MjE4NTkzLCJpYXQiOjE3MTY5NjA1Nzl9.g7iklh7XUTw185GhAkjNQVQuJsW13ZAgKAsTQM2_MvI';
    
    const imageryProviders = [
            new Cesium.ProviderViewModel({
                name: 'OSM',
                iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
                tooltip: 'OpenStreetMap',
                creationFunction: function() {
                    return new Cesium.OpenStreetMapImageryProvider({
                        url : 'https://a.tile.openstreetmap.org/'
                    });
                }
            }),
            // WMS DOP NRW
            new Cesium.ProviderViewModel({
                name: 'DOP NRW',
                iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
                tooltip: 'DOP NRW',
                creationFunction: function() {
                    return new Cesium.WebMapServiceImageryProvider({
                  url: 'https://www.wms.nrw.de/geobasis/wms_nw_dop?',
                  layers : 'nw_dop_rgb',
                      parameters : {
                          service: 'WMS',
                          version: '1.3.0',
                          request: 'GetMap',
                          styles: '',
                          format: 'image/png', 
                          srs: 'EPSG:4326' // Use 'srs' for WMS version 1.1.1
                          }})
                          }
            }),
            //Top Plus Open Grau
            new Cesium.ProviderViewModel({
                name: 'TopPlus Grau',
                iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/bingRoads.png'),
                tooltip: 'TopPlus Grau',
                creationFunction: function() {
                    return new Cesium.WebMapServiceImageryProvider({
                  url: 'https://sgx.geodatenzentrum.de/wms_topplus_open?',
                  layers : 'web_grau',
                      parameters : {
                          service: 'WMS',
                          version: '1.3.0',
                          request: 'GetMap',
                          styles: '',
                          format: 'image/png', 
                          srs: 'EPSG:4326' // Use 'srs' for WMS version 1.1.1
                          }})
                          }
            }),
        ];

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    const viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1)     //Cesium.Terrain.fromAssetId(2599342)  // // Cesium.Terrain.fromWorldTerrain(), for world Terrain
    ,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
      infoBox: true,
      selectionIndicator: true,
      sceneModePicker: false, // change back when it works
      //imageryProvider: false,
            imageryProviderViewModels: imageryProviders,
            selectedImageryProviderViewModel: imageryProviders[1], // Select DOP als default
            baseLayerPicker: true, 
      });
      
        // Enable depth testing so things behind the terrain are not visible
  viewer.scene.globe.depthTestAgainstTerrain = true;
// Wait for the Cesium Viewer to initialize and then modify the iframe sandbox attribute
viewer.infoBox.frame.removeAttribute("sandbox");
viewer.infoBox.frame.setAttribute("sandbox", "allow-same-origin allow-popups allow-forms allow-scripts");
viewer.infoBox.frame.src = "about:blank";

// Cesium3DTilesInspector
//viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

// Add the Cesium3DTilesInspector
//const inspector = new Cesium.Cesium3DTilesInspector('cesiumContainer', viewer.scene);

const handler2 = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler2.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position);
  
    if (Cesium.defined(pickedObject) && pickedObject.primitive instanceof Cesium.Cesium3DTileset) {
      const tileset = pickedObject.primitive; // This is your 3D Tileset
      const content = pickedObject.content; // Tile content if available
  
      console.log('Tileset Info:', tileset);
      if (content) {
        console.log('Tile Content:', content);
        if (content.properties) {
          console.log('Content Properties:', content.properties);
        }
      }
    } else {
      console.log('No valid tile or feature selected');
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  

//startView and Fly the camera Cologne at the given longitude, latitude, and height.
const initialPosition = Cesium.Cartesian3.fromDegrees(6.958, 50.928, 600); // Long, Lat, Height
const initialOrientation = {
  heading: Cesium.Math.toRadians(0.0),
  pitch: Cesium.Math.toRadians(-15.0),
};
    viewer.camera.flyTo({
      destination:initialPosition,
      orientation: initialOrientation
    });

    // Configure the home button to fly back to the initial view
  viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
  viewer.scene.camera.flyTo({
    destination: initialPosition,
    orientation: initialOrientation,
    duration: 3.0 // Duration in seconds
  });
  commandInfo.cancel = true; // Cancel the default home button action
});
    

// get properties of 3D Elements 
/*viewer.screenSpaceEventHandler.setInputAction(function (event) {
    var pickedFeature = viewer.scene.pick(event.position);
    if (pickedFeature) {
        console.log('Picked feature _content:', pickedFeature._content);
        if (pickedFeature._content && pickedFeature._content._metadata) {
            console.log('Metadata:', pickedFeature._content._metadata);
        }
    } else {
        console.log('No feature picked.');
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
*/

//PictureExportButton
function exportHighResolutionImage(viewer, width = 1920, height = 1080) {
    const originalWidth = viewer.scene.canvas.width;
    const originalHeight = viewer.scene.canvas.height;

    // Create an offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // Set the resolution of the viewer
    viewer.scene.canvas.width = width;
    viewer.scene.canvas.height = height;
    viewer.scene.render();

    // Get WebGL context and read pixels
    const gl = viewer.scene.context._gl;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Flip the pixel data vertically
    const flippedPixels = new Uint8Array(width * height * 4);
    for (let row = 0; row < height; row++) {
        const srcStart = row * width * 4;
        const destStart = (height - row - 1) * width * 4;
        flippedPixels.set(pixels.subarray(srcStart, srcStart + width * 4), destStart);
    }

    // Create an ImageData object
    const imageData = new ImageData(new Uint8ClampedArray(flippedPixels), width, height);

    // Draw the image on the canvas
    context.putImageData(imageData, 0, 0);

    // Reset viewer resolution
    viewer.scene.canvas.width = originalWidth;
    viewer.scene.canvas.height = originalHeight;
    viewer.scene.render();

    // Create a downloadable link
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'cesium-screenshot.png';
        link.click();
    });
}

document.getElementById('pictureButton').addEventListener('click', () => {
    exportHighResolutionImage(viewer, 3840, 2160); // Example: 4K resolution = 3840 x 2160, 8K resolution = 7680 x 4320
});

//Open Weather API
    
const API_KEY = "5d549d4619d31628eee39cc7e14eb613"; // Replace with your OpenWeather API key
const LAT = 50.9375; // Latitude for Cologne, Germany
const LON = 6.9603; // Longitude for Cologne, Germany

async function fetchCologneWeather() {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Populate weather data
        
        document.getElementById("description").textContent = data.weather[0].description;
        document.getElementById("temperature").textContent = `${(data.main.temp - 273.15).toFixed(1)}°C`;
        document.getElementById("rainValue").textContent = data.rain ? `${data.rain["1h"] || 0} mm` : "0 mm";
        document.getElementById("wind-speed").textContent = `${data.wind.speed} m/s`;
        document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
        document.getElementById("humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("cloud-cover").textContent = `${data.clouds.all}%`;


        // Add weather icon
        const iconCode = data.weather[0].icon;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        document.getElementById("weather-icon2").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

         // Update the weather icon inside the button
         const weatherIcon = document.getElementById("weather-icon2");
         weatherIcon.src = iconUrl;
         weatherIcon.alt = data.weather[0].description; // Update alt text for accessibility
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Fetch weather data on page load

fetchCologneWeather();

//Current Weather
// Toggle dashboard visibility
document.getElementById("currentWeatherButton").addEventListener("click", () => {
    const dashboard = document.getElementById("dashboard");
    const isVisible = dashboard.style.display === "block";

    if (isVisible) {
        dashboard.style.display = "none";
        //document.getElementById("toggle-button").textContent = "Show Weather";
    } else {
        dashboard.style.display = "block";
        //document.getElementById("toggle-button").textContent = "Hide Weather";
        fetchCologneWeather(); // Fetch weather data when showing the dashboard
    }
});


// Favoritenauswahl
let FavoritenAuswahl = false;
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

function generateRandomId() {
    return Math.floor(Math.random() * 1000000);
}

// Array to keep track of FavoritenMarker entities
var FavoritenMarkersArray = [];
var favoriteCounter = 0;

// Load saved FavoritenMarker on startup
loadFavorites();

// Update the favorite counter display
function updateFavoriteCounter() {
    document.getElementById('counterButton').innerHTML = `<strong>Favorites: ${favoriteCounter}</strong>`;
    if (favoriteCounter > 0) {
        document.getElementById('counterButton').style.display = 'inline-block';
        document.getElementById('deleteFavorites').style.display = 'inline-block';
    } else {
        document.getElementById('counterButton').style.display = 'none';
        document.getElementById('deleteFavorites').style.display = 'none';
    }
        
}

// Function to show the input field and enable FavoritenAuswahl
function showFavoriteInput() {
    document.getElementById('favoriteInput').style.display = 'block';
    document.getElementById('favoriteInput').focus();
}

// Function to hide the input field and disable FavoritenAuswahl
function hideFavoriteInput() {
    document.getElementById('favoriteInput').style.display = 'none';
    document.getElementById('favoriteInput').value = ''; // Clear the input field
}



// Add a click event listener to the viewer to place a FavoritenMarker and save coordinates
handler.setInputAction(function (click) {
    if (!FavoritenAuswahl) return;
    
    var earthPosition = viewer.scene.pickPosition(click.position);
    
    if (Cesium.defined(earthPosition)) {
        var cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);

        // Generate a unique ID for this marker
        var id = generateRandomId();

        showFavoriteInput();

        document.getElementById('favoriteInput').addEventListener('keypress', function onEnter(e) {
            if (e.key === 'Enter') {
                // Get the text input from the user
                var text = document.getElementById('favoriteInput').value;

                // Add a FavoritenMarker at the clicked position with the generated id
                var FavoritenMarker = addFavoritenMarker(earthPosition, latitude, longitude, text, id);

                // Save coordinates to local storage with the id
                saveCoordinate(latitude, longitude, text, id);

                // Increment and update the favorite counter
                favoriteCounter++;
                updateFavoriteCounter();

                // Hide the input field after setting the favorite
                hideFavoriteInput();

                // Remove the event listener after use
                document.getElementById('favoriteInput').removeEventListener('keypress', onEnter);
            }
        });
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// Function to add a FavoritenMarker to the viewer and keep track of it
function addFavoritenMarker(position, latitude, longitude, text, id) {
    var FavoritenMarker = viewer.entities.add({
        position: position,
        billboard: {
            image: new Cesium.PinBuilder().fromMakiIconId("star", Cesium.Color.fromCssColorString('#242a2d'), 48),
            width: 50,
            height: 50,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, Number.POSITIVE_INFINITY)
        },
        id: id,  // Use the provided id here
        properties: {
            latitude: latitude,
            longitude: longitude,
            text: text
        },
        customInfobox: true // to enable custom infobox
    });
    
    FavoritenMarkersArray.push(FavoritenMarker);
    return FavoritenMarker;
}

// Function to save coordinates to local storage
function saveCoordinate(lat, lng, text, id) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push({ lat: lat, lng: lng, text: text, id: id });
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Function to load saved coordinates from local storage and display them
function loadFavorites() {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(function (coord) {
        var position = Cesium.Cartesian3.fromDegrees(coord.lng, coord.lat);
        var marker = addFavoritenMarker(position, coord.lat, coord.lng, coord.text, coord.id);

        // Safely load the image from localStorage and set it in the infobox content
        const imageDataUrl = localStorage.getItem('favoriteImage-' + coord.id);
        if (imageDataUrl && marker && marker.description) {
            // Get the description value safely
            const descriptionPromise = marker.description.getValue();
            if (descriptionPromise && typeof descriptionPromise.then === 'function') {
                descriptionPromise.then(function(content) {
                    if (content) {
                        content = content.replace(
                            '<img id="favoriteImage" src=""',
                            `<a href="${imageDataUrl}" target="_blank"><img id="favoriteImage" src="${imageDataUrl}" style="width: 100%; height: auto; max-width: 400px; max-height: 400px;"/></a>`
                        );
                        marker.description = new Cesium.ConstantProperty(content);

                        // Force the infobox to resize after updating the content
                        forceInfoboxResize();
                    }
                }).catch(function(error) {
                    console.error("Error while updating marker description:", error);
                });
            }
        }
    });

    // Set the counter to the number of loaded favorites
    favoriteCounter = favorites.length;
    updateFavoriteCounter();
}






// Function to clear all FavoritenMarker from the viewer and local storage
function clearMarkers() {
    // Remove only FavoritenMarker entities
    FavoritenMarkersArray.forEach(function (FavoritenMarker) {
        viewer.entities.remove(FavoritenMarker);
    });
    FavoritenMarkersArray = [];  // Clear the FavoritenMarkersArray array
    localStorage.removeItem('favorites');

    // Reset the counter
    favoriteCounter = 0;
    updateFavoriteCounter();
}

// Add an event listener to the clear markers button
// Show the custom confirmation modal
document.getElementById('deleteFavorites').addEventListener('click', function() {
    document.getElementById('confirmationModal').style.display = 'flex';
});

// Handle the OK button in the custom modal
document.getElementById('confirmDelete').addEventListener('click', function() {
    clearMarkers();
    document.getElementById('confirmationModal').style.display = 'none';
});

// Handle the Cancel button in the custom modal
document.getElementById('cancelDelete').addEventListener('click', function() {
    document.getElementById('confirmationModal').style.display = 'none';
});

// Add an event listener to delete individual FavoritenMarker on right-click
handler.setInputAction(function (click) {
    var pickedObject = viewer.scene.pick(click.position);
    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
        var FavoritenMarker = pickedObject.id;

        // Check if this entity is a favorite marker by checking for specific properties
        if (Cesium.defined(FavoritenMarker.properties) && 
            Cesium.defined(FavoritenMarker.properties.latitude) && 
            Cesium.defined(FavoritenMarker.properties.longitude)) {

            var lat = FavoritenMarker.properties.latitude.getValue();
            var lng = FavoritenMarker.properties.longitude.getValue();

            // Remove the marker entity from the viewer
            viewer.entities.remove(FavoritenMarker);

            // Remove the marker from the FavoritenMarkersArray
            FavoritenMarkersArray = FavoritenMarkersArray.filter(marker => marker !== FavoritenMarker);

            // Remove the marker coordinates from local storage
            var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favorites = favorites.filter(coord => coord.lat !== lat || coord.lng !== lng);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            localStorage.removeItem('favoriteImage-' + FavoritenMarker.id);

            // Decrement and update the favorite counter
            favoriteCounter--;
            updateFavoriteCounter();

            console.log('Favorite marker deleted:', FavoritenMarker);
        }
    }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);


// Add attributes to the Cesium infobox for the new features
viewer.selectedEntityChanged.addEventListener(function () {
    var entity = viewer.selectedEntity;
    if (Cesium.defined(entity)) {
        if (entity.customInfobox) {
            var id = entity.id;
            var latitude = entity.properties.latitude.getValue();
            var longitude = entity.properties.longitude.getValue();
            var text = entity.properties.text.getValue();

            var imageDataUrl = localStorage.getItem('favoriteImage-' + id) || '';

            // Create infobox content
            var infoboxContent = `
                <table>
                    <tr><td>ID:</td><td>${id}</td></tr>
                    <tr><td>Latitude:</td><td>${latitude}</td></tr>
                    <tr><td>Longitude:</td><td>${longitude}</td></tr>
                    <tr><td>Kommentar:</td><td>${text}</td></tr>
                    <tr><td>Image:</td><td>
                        <a href="javascript:void(0)" id="imageLink">
                            <img id="favoriteImage" src="${imageDataUrl}" style="width: 100%; height: auto; max-width: 400px; max-height: 400px; cursor: pointer;"/>
                        </a>
                    </td></tr>
                    <tr><td>Upload Image:</td><td><input type="file" id="imageUpload" accept="image/*"></td></tr>
                </table>
            `;

            entity.description = new Cesium.ConstantProperty(infoboxContent);
            entity.name = "Favorit";

            setTimeout(() => {
                const iframe = document.querySelector('.cesium-infoBox-iframe');
                if (iframe) {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const imageUploadElement = iframeDoc.getElementById('imageUpload');
                    const imageLinkElement = iframeDoc.getElementById('imageLink');

                    if (imageUploadElement) {
                        imageUploadElement.addEventListener('change', function(event) {
                            const file = event.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = function(e) {
                                    const newImageDataUrl = e.target.result;
                                    localStorage.setItem('favoriteImage-' + id, newImageDataUrl);

                                    const favoriteImageElement = iframeDoc.getElementById('favoriteImage');
                                    if (favoriteImageElement) {
                                        favoriteImageElement.src = newImageDataUrl;

                                        // Convert data URL to Blob and create an Object URL
                                        const byteString = atob(newImageDataUrl.split(',')[1]);
                                        const mimeString = newImageDataUrl.split(',')[0].split(':')[1].split(';')[0];
                                        const arrayBuffer = new ArrayBuffer(byteString.length);
                                        const intArray = new Uint8Array(arrayBuffer);
                                        for (let i = 0; i < byteString.length; i++) {
                                            intArray[i] = byteString.charCodeAt(i);
                                        }
                                        const blob = new Blob([intArray], { type: mimeString });
                                        const objectUrl = URL.createObjectURL(blob);
                                        
                                        // Update the link's href
                                        imageLinkElement.href = objectUrl;
                                        imageLinkElement.target = '_blank';
                                        imageLinkElement.onclick = function() {
                                            window.open(objectUrl, '_blank');
                                        };

                                        // Force the infobox to resize after updating the image
                                        forceInfoboxResize();
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                        });
                    }

                    // If the image is already present, set up the link
                    if (imageLinkElement && imageDataUrl) {
                        const byteString = atob(imageDataUrl.split(',')[1]);
                        const mimeString = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
                        const arrayBuffer = new ArrayBuffer(byteString.length);
                        const intArray = new Uint8Array(arrayBuffer);
                        for (let i = 0; i < byteString.length; i++) {
                            intArray[i] = byteString.charCodeAt(i);
                        }
                        const blob = new Blob([intArray], { type: mimeString });
                        const objectUrl = URL.createObjectURL(blob);

                        // Update the link's href
                        imageLinkElement.href = objectUrl;
                        imageLinkElement.target = '_blank';
                        imageLinkElement.onclick = function() {
                            window.open(objectUrl, '_blank');
                        };
                    }

                    forceInfoboxResize();
                }
            }, 100);
        }
    }
});




function forceInfoboxResize() {
    const iframe = document.querySelector('.cesium-infoBox-iframe');
    if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        setTimeout(() => {
            iframe.style.height = iframeDoc.body.scrollHeight + 'px';
        }, 0);
    }
}





// Infobox for Polygons: Add attributes to the Cesium infobox for the new features
viewer.selectedEntityChanged.addEventListener(function () {
    var entity = viewer.selectedEntity;
    if (Cesium.defined(entity)) {
        // Check if the entity has the customInfobox property
        if (entity.customInfobox2) {
            var id = entity.id;
            

            // Create infobox content
            var infoboxContent2 = `
                <table>
                    <tr><td>ID:</td><td>${id}</td></tr>
                    
                </table>
            `;

            // Set the infobox description
            entity.description = new Cesium.ConstantProperty(infoboxContent2);
            entity.name = "Polygon";
        }
    }
});
// Event listeners for starting and stopping favorite selection mode
document.getElementById('startFavorites').addEventListener('click', function () {
    document.getElementById('startFavorites').style.display = 'none';
    document.getElementById('stopFavorites').style.display = 'inline-block';
    showAllMarkers();
    document.getElementById('FavoritenCheckbox').checked = true;
    FavoritenAuswahl = true;
    toggleView(-90, 0.01, 1200);
    document.getElementById('zweid3dButton').style.display = "none";
    viewer.infoBox.container.style.display = 'none'; // Make sure Infobox does not show up when elements are clicked
    document.getElementById('drawPolygonButton').style.display = 'none'; //disable draw Polygon while Favorite Selection
    
  });

document.getElementById('stopFavorites').addEventListener('click', function () {
    document.getElementById('startFavorites').style.display = 'inline-block';
    document.getElementById('stopFavorites').style.display = 'none';
    showAllMarkers();
    document.getElementById('FavoritenCheckbox').checked = true;
    FavoritenAuswahl = false;
    toggleView(-15, -0.01, 600);
    document.getElementById('zweid3dButton').style.display = "block";
    viewer.infoBox.container.style.display = 'block'; // Make sure Infobox shows up again when elements are clicked
    hideFavoriteInput();
    document.getElementById('drawPolygonButton').style.display = 'inline-block'; //enable draw Polygon after Favorite Selection
});


// Polygon Tool 
 //Activate Polygon Tool
 document.getElementById('startPolygon').addEventListener('click', function() {
    toggleView(-90, 0.01, 1200); //andere functionality noch mit einbauen??? Start/ Stopp button?
    document.getElementById('drawPolygon').style.display = 'inline-block';
    document.getElementById('colorSelect').style.display = 'inline-block';
    document.getElementById('stopPolygon').style.display = 'inline-block';
    document.getElementById('zweid3dButton').style.display = "none";
    document.getElementById('startPolygon').style.display = "none";
    LoD2Koeln.show = false;
    document.getElementById('LoD2Checkbox').checked = false;
    document.getElementById('FavoritenAuswahlButton').style.display = 'none'; //disable Favoriten Auswahl

  });

  //Deactivate Polygon Tool
  document.getElementById('stopPolygon').addEventListener('click', function() {
    toggleView(-15, -0.01, 600);
    document.getElementById('drawPolygon').style.display = 'none';
    document.getElementById('colorSelect').style.display = 'none';
    document.getElementById('stopPolygon').style.display = 'none';
    document.getElementById('zweid3dButton').style.display = "block";
    document.getElementById('startPolygon').style.display = "inline-block";
    LoD2Koeln.show = true;
    document.getElementById('LoD2Checkbox').checked = true;
    document.getElementById('FavoritenAuswahlButton').style.display = 'inline-block'; //enable Favoriten Auswahl
  });

  //Polygon Function
  var polygonEntitiesArray = [];

// Update the polygon counter display
function updatePolygonCounter() {
    document.getElementById('counterButton2').innerHTML = `<strong>Polygone: ${polygonEntitiesArray.length}</strong>`;
    if (polygonEntitiesArray.length > 0) {
        document.getElementById('counterButton2').style.display = 'inline-block';
        document.getElementById('deletePolygon').style.display = 'inline-block';
    } else {
        document.getElementById('counterButton2').style.display = 'none';
        document.getElementById('deletePolygon').style.display = 'none';
    }
}

//Draw Helper
var drawHelper = new DrawHelper(viewer);
var toolbar = drawHelper.addToolbar(document.getElementById('cesiumContainer'), {
    buttons: ['polygon']
});
toolbar.addListener('polygonCreated', function(event) {
    var polygon = event.primitive;
    var positions = polygon.positions;
    var id = generateRandomId();  //generate random id for the polygon

    // Convert positions to a JSON-friendly format
    var positionsArray = positions.map(function(cartesian) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        return {
            longitude: Cesium.Math.toDegrees(cartographic.longitude),
            latitude: Cesium.Math.toDegrees(cartographic.latitude),
            height: cartographic.height
        };
    });

    // Get the selected color from the color picker (or wherever you're storing it)
    var selectedColor = document.getElementById('colorSelect').value;

    // Get existing polygons from localStorage
    var savedPolygons = JSON.parse(localStorage.getItem('polygons') || '[]');

    // Add new polygon with its color to the array
    savedPolygons.push({
        positions: positionsArray,
        color: selectedColor,
        customInfobox2: true // to enable custom infobox
    });

    // Save updated polygons array to localStorage
    localStorage.setItem('polygons', JSON.stringify(savedPolygons));

    console.log('Polygon created and saved:', positionsArray, selectedColor);
});

function loadSavedPolygons() {
    var savedPolygons = JSON.parse(localStorage.getItem('polygons') || '[]');
    
    savedPolygons.forEach(function(savedPolygon) {
        var positions = savedPolygon.positions.map(function(position) {
            return Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height);
        });

        var selectedColor = savedPolygon.color;

        var polygonEntity = viewer.entities.add({
          id: savedPolygon.id, // use saved id
            polygon: {
                hierarchy: positions,
                material: Cesium.Color.fromCssColorString(selectedColor).withAlpha(0.5),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
            id: savedPolygon.id, //use saved id,
            customInfobox2: true // to enable custom infobox
        });

        // Add the loaded polygon entity to the array
        polygonEntitiesArray.push(polygonEntity);
    });
    //Update the polygon counter
    updatePolygonCounter();
}

// Call this function when your app starts
loadSavedPolygons();

document.getElementById('drawPolygon').addEventListener('click', function() {
    var selectedColor = document.getElementById('colorSelect').value;
      
    drawHelper.startDrawingPolygon({
        callback: function(positions) {
            console.log('Polygon positions:', positions);
            var id = generateRandomId();  //generate random id for the polygon
            var polygonEntity = viewer.entities.add({
                polygon: {
                    hierarchy: positions,
                    material: Cesium.Color[selectedColor.toUpperCase()].withAlpha(0.5),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
                id: id, //store id as attributes
                customInfobox2: true // to enable custom infobox
            });

            // Add the polygon entity to the array
            polygonEntitiesArray.push(polygonEntity);

            // Save the new polygon to localStorage with its color (if needed)
            var positionsArray = positions.map(function(cartesian) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                return {
                    longitude: Cesium.Math.toDegrees(cartographic.longitude),
                    latitude: Cesium.Math.toDegrees(cartographic.latitude),
                    height: cartographic.height
                };
            });

            var savedPolygons = JSON.parse(localStorage.getItem('polygons') || '[]');
            savedPolygons.push({
                positions: positionsArray,
                color: selectedColor,
                id: id,
                customInfobox2: true // to enable custom infobox
            });
            localStorage.setItem('polygons', JSON.stringify(savedPolygons));

            //Update the polygon counter
            updatePolygonCounter();
        }
        
    });
});

function updateSavedPolygons() {
    var savedPolygons = [];

    polygonEntitiesArray.forEach(function(polygonEntity) {
        var positions = polygonEntity.polygon.hierarchy.getValue().positions;

        var positionsArray = positions.map(function(cartesian) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            return {
                longitude: Cesium.Math.toDegrees(cartographic.longitude),
                latitude: Cesium.Math.toDegrees(cartographic.latitude),
                height: cartographic.height
            };
        });

        savedPolygons.push({
            positions: positionsArray,
            color: polygonEntity.polygon.material.color.getValue().toCssColorString(),
            id: id,
            customInfobox2: true // to enable custom infobox
        });
    });

    localStorage.setItem('polygons', JSON.stringify(savedPolygons));
    //Update the polygon counter
    updatePolygonCounter();
    
}

viewer.screenSpaceEventHandler.setInputAction(function onRightClick(movement) {
    var pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject)) {
        var polygonEntity = pickedObject.id;

        // Check if this entity is a polygon by checking for polygon-specific attributes
        if ( polygonEntitiesArray.includes(polygonEntity)) {
            // Remove the polygon from the viewer
            viewer.entities.remove(polygonEntity);

            // Remove the polygon from the polygonEntitiesArray
            polygonEntitiesArray = polygonEntitiesArray.filter(function(item) {
                return item !== polygonEntity;
            });

            
            // Update the polygon counter after deletion
            updatePolygonCounter();

            // Update saved polygons in localStorage
            updateSavedPolygons();

            

            console.log('Polygon entity deleted:', polygonEntity);
        }
    }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);



//delete all Polygons
function clearPolygons() {
    // Remove only polygon entities
    polygonEntitiesArray.forEach(function(polygonEntity) {
        viewer.entities.remove(polygonEntity);
    });
    
    // Clear the polygonEntitiesArray array
    polygonEntitiesArray = [];

    // Optionally, clear saved polygons from localStorage
    localStorage.removeItem('polygons');

    //Update the polygon counter
    updatePolygonCounter();
    
    console.log('Polygon entities cleared');
}



// Add an event listener to the delete polygons button
// Show the custom confirmation modal
document.getElementById('deletePolygon').addEventListener('click', function() {
    document.getElementById('confirmationModal2').style.display = 'flex';
});

// Handle the OK button in the custom modal
document.getElementById('confirmDelete2').addEventListener('click', function() {
    clearPolygons();
    document.getElementById('confirmationModal2').style.display = 'none';
});

// Handle the Cancel button in the custom modal
document.getElementById('cancelDelete2').addEventListener('click', function() {
    document.getElementById('confirmationModal2').style.display = 'none';
});

//Funktionsleiste Button
document.getElementById('header2').style.display = 'flex';
document.getElementById('Funktionsleiste').addEventListener('click', function() {
  if (document.getElementById('header2').style.display === 'flex') {
  document.getElementById('header2').style.display = 'none';
  } 
  else  {
  document.getElementById('header2').style.display = 'flex';
  
  } 
});
//2D/3D Button  
//Function to switch 
function toggleView(pitchInDegrees, latitudeOffset, heightOffset) {
    var scene = viewer.scene;
    var camera = scene.camera;

    // Get the current camera position in Cartographic coordinates
  const currentPosition = viewer.camera.positionCartographic.clone();

// Calculate the new latitude with the offset
const newLatitude = currentPosition.latitude + Cesium.Math.toRadians(latitudeOffset);

// Calculate the new height with the offset
const newHeight = heightOffset;

// Create the new position with the updated latitude and height
const newPosition = Cesium.Cartesian3.fromRadians(
  currentPosition.longitude,
  newLatitude,
  newHeight
);
// Get the current heading of the camera
const currentHeading = viewer.camera.heading;
// Define the new orientation
const newOrientation = {
    heading: currentHeading,
    pitch: Cesium.Math.toRadians(pitchInDegrees)
  };
  viewer.camera.flyTo({
    //destination: initialPosition,
    //orientation: initialOrientation,
    destination: newPosition,
  orientation: newOrientation,
    duration: 1.0
  })
};

let toggleState= false
// Button Functionality
document.getElementById('zweid3dButton').addEventListener('click', () => {
  if (toggleState) {
        // Call the function with the first set of parameters
        toggleView(-15, -0.01, 600);
    } else {
        // Call the function with the second set of parameters
        toggleView(-90, 0.01, 1200);
    }
    // Toggle the state
    toggleState = !toggleState;
});

//Rain Animation
const rainContainer = document.getElementById('rain');
const startRainButton = document.getElementById('StartRainButton');
const stopRainButton = document.getElementById('StopRainButton');
const lightRainCheckbox = document.getElementById('lightRain');
const heavyRainCheckbox = document.getElementById('heavyRain');

let isRaining = false;
let numberOfDrops = 0;
let speed = 1.2;

startRainButton.addEventListener('click', toggleRain);

// Event listeners to ensure mutual exclusivity
lightRainCheckbox.addEventListener('change', () => {
    if (lightRainCheckbox.checked) {
        heavyRainCheckbox.checked = false;
    }
    updateRainIntensity();
});

heavyRainCheckbox.addEventListener('change', () => {
    if (heavyRainCheckbox.checked) {
        lightRainCheckbox.checked = false;
    }
    updateRainIntensity();
});
 

function toggleRain() {
    isRaining = !isRaining;

    if (isRaining) {
      
         // Enable light rain by default
         lightRainCheckbox.checked = true;
        heavyRainCheckbox.checked = false;
        updateRainIntensity(); // Update the intensity based on the default light rain
        startRain();
        
        //startRainButton.innerHTML = 'Stop Rain';
    } else {
      
        stopRain();
        //startRainButton.innerText = 'Start Rain';
        
    }
    updateButtonState();
}

function startRain() {
  rainContainer.innerHTML = ''; // Clear existing drops if any
  document.getElementById('StartRainButton').style.display = 'none';
  document.getElementById('StopRainButton').style.display = 'inline-block';
  document.getElementById('RainIntensity').style.display = 'inline-block';
    for (let i = 0; i < numberOfDrops; i++) {
        const drop = document.createElement('div');
        drop.classList.add('drop');
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDuration = `${(Math.random() * 0.5 + 0.5) * speed}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        rainContainer.appendChild(drop);
        wmsStarkregenSelten.show = true;
        wmsStarkregenSeltenCheckbox.checked = true;
        document.getElementById('StartRainButton').style.display = 'none';
        document.getElementById('StopRainButton').style.display = 'inline-block';
          
    }
}

function stopRain() {
  
    rainContainer.innerHTML = ''; // Clear all drops
        lightRainCheckbox.checked = false;
        heavyRainCheckbox.checked = false;
        document.getElementById('StartRainButton').style.display = 'inline-block';
        document.getElementById('StopRainButton').style.display = 'none';
        document.getElementById('RainIntensity').style.display = 'none';
    if (wmsStarkregenSeltenCheckbox.checked=true) {
      wmsStarkregenSeltenCheckbox.checked = false, 
      wmsStarkregenSelten.show = false;
      document.getElementById('StartRainButton').style.display = 'inline-block';
      document.getElementById('StopRainButton').style.display = 'none';
        }
    if (wmsStarkregenExtremCheckbox.checked=true) {
      wmsStarkregenExtremCheckbox.checked = false, 
      wmsStarkregenExtrem.show = false; 
      document.getElementById('StartRainButton').style.display = 'inline-block';
      document.getElementById('StopRainButton').style.display = 'none';
    }
    document.getElementById('StartRainButton').style.display = 'inline-block';
    document.getElementById('StopRainButton').style.display = 'none';
}
function updateRainIntensity() {
    if (lightRainCheckbox.checked) {
        numberOfDrops = 250;
        speed = 1.5; // Slower
        heavyRainCheckbox.checked = false;// Ensure the other checkbox is unchecked
        
        wmsStarkregenSeltenCheckbox.checked = true; 
        wmsStarkregenSelten.show = true;
        wmsStarkregenExtremCheckbox.checked = false;
        wmsStarkregenExtrem.show = false
    } else if (heavyRainCheckbox.checked) {
        numberOfDrops = 1000;
        speed = 0.8; // Faster
        lightRainCheckbox.checked = false; // Ensure the other checkbox is unchecked
        wmsStarkregenSeltenCheckbox.checked = false; 
        wmsStarkregenSelten.show = false;
        wmsStarkregenExtremCheckbox.checked = true;
        wmsStarkregenExtrem.show = true
    } 
    
    else {
        // Default rain intensity if no checkbox is selected
        numberOfDrops = 0;
        speed = 1.2;
        startRainButton.style.display = 'inline-block';
        stopRainButton.style.display = 'none';
        stopRain();
        
    }

    if (isRaining) {
        
        startRain(); // Restart the rain with the new intensity
    }
}
function updateButtonState() {
    if (isRaining) {
        startRainButton.style.display = 'none';
        stopRainButton.style.display = 'inline-block';
    } else if (!isRaining) {
        startRainButton.style.display = 'inline-block';
        stopRainButton.style.display = 'none';
    }
}

//Stop Rain Button Functionality
document.getElementById('StopRainButton').addEventListener('click', () => {
    stopRain();
    document.getElementById('StartRainButton').style.display = 'inline-block';
    document.getElementById('StopRainButton').style.display = 'none';
})
   

 //Layer Button
 document.getElementById('layerlist').style.display = 'none';
 document.getElementById('layerbutton').addEventListener('click', () => {
  if (document.getElementById('layerlist').style.display === 'block') {
  document.getElementById('layerlist').style.display = 'none';
  } 
  else  {
  document.getElementById('layerlist').style.display = 'block';
  
  } 
});

//Legend Button
document.getElementById('legend').style.display = 'none';
document.getElementById('legendbutton').addEventListener('click', () => {
  if (document.getElementById('legend').style.display === 'none') {
  document.getElementById('legend').style.display = 'block';
  } 
  else  {
  document.getElementById('legend').style.display = 'none';
  } 
});
//Layers
    // Cesium OSM Buildings
    const OSMbuildingTileset = await Cesium.createOsmBuildingsAsync();
    viewer.scene.primitives.add(OSMbuildingTileset);   

    //GooglePhotorealistic Tiles   --> während Entwicklung deaktivieren!!!
    const GoogletilesetKoeln = await Cesium.Cesium3DTileset.fromUrl(
     "https://tile.googleapis.com/v1/3dtiles/root.json?key=AIzaSyBxBAlQUUqEie5k66Ki7Oc5OFJise2Jud8"
  );
    GoogletilesetKoeln.show = false;
    viewer.scene.primitives.add(GoogletilesetKoeln);
    /*GoogletilesetKoeln.style = new Cesium.Cesium3DTileStyle({
        color: {
            conditions: [
                ['true', 'color("white", 0.9)'] // 0.5 is the opacity level
            ]
        }
    });
    */
//Test to disable certain region of google tileset from showin
/*   
// Define your geographic coordinates
const lati = 50.92324711; // Latitude in degrees
const longi = 6.99193668; // Longitude in degrees
const hei = 200; // Height in meters above the ellipsoid (adjust as needed)

// Convert to Cartesian3
const center = Cesium.Cartesian3.fromDegrees(longi, lati, hei);

// Define the radius of the bounding sphere (in meters)
const radius = 70.0;

// Create the BoundingSphere
const excludeRegion = new Cesium.BoundingSphere(center, radius);

GoogletilesetKoeln.tileVisible = function(tile) {
    // Safeguard: Check if the tile has a boundingVolume
    if (!tile.boundingVolume || !tile.boundingVolume.boundingVolume) {
        return true; // Default to rendering if no bounding volume is defined
    }

    // Retrieve the bounding volume
    const boundingVolume = tile.boundingVolume.boundingVolume;

    // Check if it's a BoundingSphere
    if (boundingVolume instanceof Cesium.BoundingSphere) {
        return !Cesium.BoundingSphere.intersect(excludeRegion, boundingVolume);
    }

    // Default to rendering the tile for unsupported bounding volume types
    return true;
};
// Optional: Fly to the exclusion area for debugging
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longi, lati, hei + 500), // Adjust altitude as needed
});

*/



    //TUV TBau 3D Mesh
    const TUVtileset = await Cesium.Cesium3DTileset.fromIonAssetId(2965765);
    viewer.scene.primitives.add(TUVtileset);
        
// Apply a translation directly to the model matrix
const translation = Cesium.Matrix4.fromTranslation(
    new Cesium.Cartesian3(0, 0, -2.5) // Move down by 2.5 Meters
);

TUVtileset.modelMatrix = Cesium.Matrix4.multiply(
    TUVtileset.modelMatrix,
    translation,
    new Cesium.Matrix4()
);

    
    //Trees
    const treeTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2938772);
    viewer.scene.primitives.add(treeTileset);
    // Set Color
treeTileset.style = new Cesium.Cesium3DTileStyle({
    color: 'color("green")' 
});


// LoD2 Koeln - Add tileset
const LoD2Koeln = await Cesium.Cesium3DTileset.fromIonAssetId(2663459);
viewer.scene.primitives.add(LoD2Koeln);



LoD2Koeln.style = new Cesium.Cesium3DTileStyle({
    show: {
        conditions: [
            ["${Height} === 21.057363068776468", "false"],
            ["${Height} === 17.638531342038092", "false"],
            ["${Height} === 19.71697910877323", "false"],
            ["${Height} === 8.27511435794878", "false"],
            ["${Height} === 6.404158458170514", "false"],
            ["${Height} === 3.1053009679756087", "false"],
            ["${Height} === 4.7372055708840435", "false"],
            ["${Height} === 3.6773117411227076", "false"],
            ["${Height} === 2.6401405746011193", "false"],
            ["${Height} === 8.559914425509533", "false"],
            ["${Height} === 3.5555567227366964", "false"],
            ["${Height} === 2.7300640183191547", "false"],
            ["${Height} === 42.13942282102829", "false"],
            ["true", "true"] // Default: Show everything else
        ]
    }
});

 /* viewer.screenSpaceEventHandler.setInputAction(function (movement) {
    const pickedFeature = viewer.scene.pick(movement.position);
    if (pickedFeature) {
        console.log(pickedFeature.getPropertyIds()); // Logs all property names
        console.log(pickedFeature.getProperty('height')); // Logs the 'gmlid' value
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

*/



// Add a polygon to visualize the bounding box (optional for debugging)
/*viewer.entities.add({
    polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
            west, south,
            east, south,
            east, north,
            west, north,
        ]),
        material: Cesium.Color.YELLOW.withAlpha(0.5),
    },
});
      */
      const wmsHQ10ImageryProvider = new Cesium.WebMapServiceImageryProvider({
            url : 'https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte?',
            layers : '15',
            parameters : {
                service: 'WMS',
                version: '1.1.1',
                request: 'GetMap',
                styles: '',
                format: 'image/png',
                transparent: true
            }
        });
        const wmsHQ10 = viewer.imageryLayers.addImageryProvider(wmsHQ10ImageryProvider);
        

         //HQ100  
      const wmsHQ100ImageryProvider = new Cesium.WebMapServiceImageryProvider({
            url : 'https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte?',
            layers : '10', 
            parameters : {
                service: 'WMS',
                version: '1.1.1',
                request: 'GetMap',
                styles: '',
                format: 'image/png',
                transparent: true
            }
        });
       const wmsHQ100 = viewer.imageryLayers.addImageryProvider(wmsHQ100ImageryProvider);
        
        //HQ500  
      const wmsHQ500ImageryProvider = new Cesium.WebMapServiceImageryProvider({
            url : 'https://www.wms.nrw.de/umwelt/HW_Gefahrenkarte?',
            layers : '5',
            parameters : {
                service: 'WMS',
                version: '1.1.1',
                request: 'GetMap',
                styles: '',
                format: 'image/png',
                transparent: true
            }
        });
       const wmsHQ500 = viewer.imageryLayers.addImageryProvider(wmsHQ500ImageryProvider);
       
  //Hochwasser 3D 
//HQSelten als GEOJSON mit Höhenversatz zur 3D Ansicht
const resource2 = await Cesium.IonResource.fromAssetId(2606015);
const HQselten3D_UG = await Cesium.GeoJsonDataSource.load(resource2, {
  clampToGround: false,
});

viewer.dataSources.add(HQselten3D_UG);

// Iterate through all entities and set extrusion and height.
var entities = HQselten3D_UG.entities.values;
for (var i = 0; i < entities.length; i++) {
  var entity = entities[i];

  if (Cesium.defined(entity.polygon)) {
    // Set the base height and extruded height.
    entity.polygon.height = 100.5; // Base height in meters.
    entity.polygon.extrudedHeight = -10; // Extruded height in meters.

    // Optional: Set the material of the polygon.
    entity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.5);

    // Optional: Set the outline color and width.
    entity.polygon.outline = false;
    entity.polygon.outlineColor = Cesium.Color.BLACK;
    entity.polygon.outlineWidth = 2.0;
  }
}


//HQSelten als GEOJSON mit Höhenversatz zur 3D Ansicht
const resource1 = await Cesium.IonResource.fromAssetId(2606014);
const HQselten3D = await Cesium.GeoJsonDataSource.load(resource1, {
  clampToGround: false,
});

viewer.dataSources.add(HQselten3D);

// Iterate through all entities and set extrusion and height.
var entities = HQselten3D.entities.values;
for (var i = 0; i < entities.length; i++) {
  var entity = entities[i];

  if (Cesium.defined(entity.polygon)) {
    // Set the base height and extruded height.
    entity.polygon.height = 100.5; // Base height in meters.
    entity.polygon.extrudedHeight = -10; // Extruded height in meters.

    // Optional: Set the material of the polygon.
    entity.polygon.material = Cesium.Color.BLUE.withAlpha(0.6);

    // Optional: Set the outline color and width.
    entity.polygon.outline = false;
    entity.polygon.outlineColor = Cesium.Color.BLACK;
    entity.polygon.outlineWidth = 2.0;
  }
}



//HQExtrem als GEOJSON mit Höhenversatz zur 3D Ansicht
const resource = await Cesium.IonResource.fromAssetId(2606016);
const HQextrem3D = await Cesium.GeoJsonDataSource.load(resource, {
  clampToGround: false,
});

viewer.dataSources.add(HQextrem3D);

// Iterate through all entities and set extrusion and height.
var entities = HQextrem3D.entities.values;
for (var i = 0; i < entities.length; i++) {
  var entity = entities[i];

  if (Cesium.defined(entity.polygon)) {
    // Set the base height and extruded height.
    entity.polygon.height = 103.5; // Base height in meters.
    entity.polygon.extrudedHeight = -10; // Extruded height in meters.
    //entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;

    // Optional: Set the material of the polygon.
    entity.polygon.material = Cesium.Color.BLUE.withAlpha(0.6);

    // Optional: Set the outline color and width.
    entity.polygon.outline = false;
    entity.polygon.outlineColor = Cesium.Color.BLACK;
    entity.polygon.outlineWidth = 2.0;
  }
}

// Hide the data source after it has been added and processed
HQextrem3D.show = false;
HQselten3D.show = false;
HQselten3D_UG.show = false;


       //Starkregen WMS  --> unter Hochwasser damit die Layer über Hochwasser liegen
      //Seltenes Ereignis
      const wmsStarkregenSeltenImageryProvider = new Cesium.WebMapServiceImageryProvider({
            url : 'https://sgx.geodatenzentrum.de/wms_starkregen?',
            layers : 'wasserhoehen_selten',
            parameters : {
                service: 'WMS',
                version: '1.1.1',
                request: 'GetMap',
                styles: '',
                format: 'image/png',
                transparent: true
            }
        });
       const wmsStarkregenSelten = viewer.imageryLayers.addImageryProvider(wmsStarkregenSeltenImageryProvider);
       //viewer.imageryLayers.raiseToTop(wmsStarkregenSelten);
      
      /* const screenSpaceImagery = viewer.scene.primitives.add(
        new Cesium.ScreenSpaceImagery({ imageryProvider: wmsStarkregenSeltenImageryProvider })
    );*/


        //Starkregen Extrem
      const wmsStarkregenExtremImageryProvider = new Cesium.WebMapServiceImageryProvider({
            url : 'https://sgx.geodatenzentrum.de/wms_starkregen?',
            layers : 'wasserhoehen_extrem',
            parameters : {
                service: 'WMS',
                version: '1.1.1',
                request: 'GetMap',
                styles: '',
                format: 'image/png',
                transparent: true
            }
        });
       const wmsStarkregenExtrem =viewer.imageryLayers.addImageryProvider(wmsStarkregenExtremImageryProvider);

      //GeoJSON Features
        //Pegel Punkt Feature
        //var geoJsonUrl = 'data/RheinPegel_Koeln_4326.geojson';

// Load GeoJSON data into the viewer
        // As Entity
        const RheinPegel = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(6.96340097,50.93693404),
            billboard: {
                image: 'img/Hochwasser_Pegel.png',
                scale: 1, 
                height: 50,
                width: 35,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // Clamps the billboard to the ground
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // Align the bottom of the billboard with the coordinate
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // Ensure the billboard is always visible
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, Number.POSITIVE_INFINITY) // Always display the billboard
                
            }
            /*label: {
                text: 'Rhein Pegel Köln', // The text of the label
                font: '14pt sans-serif', // The font of the label text
                fillColor: Cesium.Color.WHITE, // The color of the label text
                outlineColor: Cesium.Color.BLACK, // The outline color of the label text
                outlineWidth: 2, // The outline width of the label text
                style: Cesium.LabelStyle.FILL_AND_OUTLINE, // The style of the label text
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // Align the bottom of the label with the coordinate
                pixelOffset: new Cesium.Cartesian2(0, -40), // Offset the label to be above the billboard
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // Ensure the label is always visible
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, Number.POSITIVE_INFINITY) // Always display the label
  
            }
            */
        })
        //Set Name and Content für Rheinpegel Box
        RheinPegel.name= "Rhein River Gauge Cologne";
        RheinPegel.description= ` <iframe id="custom-iframe" width="100%" height="555px" style="background-color: white; border: 3px solid black;" src="https://www.pegelonline.wsv.de/charts/OnlineVisualisierungGanglinie?pegeluuid=a6ee8177-107b-47dd-bcfd-30960ccc6e9c" frameborder="0" allowfullscreen></iframe>`;
          //<p> Weitere Informationen: 
          //<a href="https://www.pegelonline.wsv.de/gast/pegeltabelle"> Rhein Pegel Köln</a>
          //</p>
          //`;

       
          
        
    //initial layer configuration
    OSMbuildingTileset.show = false;
    //GoogletilesetKoeln.show = true;
    LoD2Koeln.show = true;
        // Important for WMS services --> need to be stored as const to be able to use the .show property 
    wmsStarkregenSelten.show = false; 
    wmsStarkregenExtrem.show = false;
    wmsHQ10.show = false;
    wmsHQ100.show = false;
    wmsHQ500.show = false;
    
    RheinPegel.show = true;

    //Starkregen Wasserflächen KML aus HEC RAS
       // Load the Cesium.IonResource from the asset ID
      /* const resource1 = await Cesium.IonResource.fromAssetId(2601695);
          const KMLHECRAS = await Cesium.KmlDataSource.load(resource1,{
            clampToGround: true,
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
          });
          viewer.dataSources.add(KMLHECRAS);
          
        

          //Load KML as converted to GeoJSON
         /* const resource = await Cesium.IonResource.fromAssetId(2592262);
          const geojsonHECRAS = await Cesium.GeoJsonDataSource.load(resource,{
            clampToGround: true
          });
          viewer.dataSources.add(geojsonHECRAS);
*/
    //hide/show layers
      //OSM
       document.getElementById('OSMCheckbox').addEventListener('change', () => {
        OSMbuildingTileset.show = !OSMbuildingTileset.show;
        });

      //Google Photorealistic
      document.getElementById('GooglePhotorealisticCheckbox').addEventListener('change', () => {
        GoogletilesetKoeln.show = !GoogletilesetKoeln.show;
        });

        //TÜV TBau
      document.getElementById('TUVtilesetCheckBox').addEventListener('change', () => {
        TUVtileset.show = !TUVtileset.show;
        });
      //LoD2
      document.getElementById('LoD2Checkbox').addEventListener('change', () => {
        LoD2Koeln.show = !LoD2Koeln.show;
        });

      //Trees
      document.getElementById('TreeCheckBox').addEventListener('change', () => {
        treeTileset.show = !treeTileset.show;
        });
      //Starkregen WMS
         //Selten
      document.getElementById('wmsStarkregenSeltenCheckbox').addEventListener('change', () => {
        wmsStarkregenSelten.show = !wmsStarkregenSelten.show;
        });
      //Extrem
      document.getElementById('wmsStarkregenExtremCheckbox').addEventListener('change', () => {
        wmsStarkregenExtrem.show = !wmsStarkregenExtrem.show;
        });

   //Rheinpegel
   document.getElementById('RheinPegelCheckbox').addEventListener('change', () => {
        RheinPegel.show = !RheinPegel.show;
        });


  // Hochwasser 3D
         //HQ10
      document.getElementById('HochwasserSelten3D').addEventListener('change', () => {
        HQselten3D.show = !HQselten3D.show;
        });
      //HQ100
      document.getElementById('HochwasserSelten3D_UG').addEventListener('change', () => {
        HQselten3D_UG.show = !HQselten3D_UG.show;
        });
      //HQ500
      document.getElementById('HochwasserExtrem3D').addEventListener('change', () => {
        HQextrem3D.show = !HQextrem3D.show;
        });


    //Favoriten
// Function to show all markers
function showAllMarkers() {
    for (var i = 0; i < FavoritenMarkersArray.length; i++) {
        FavoritenMarkersArray[i].show = true;
    }
}

// Function to hide all markers
function hideAllMarkers() {
    for (var i = 0; i < FavoritenMarkersArray.length; i++) {
        FavoritenMarkersArray[i].show = false;
    }
}

//Favoriten
    document.getElementById('FavoritenCheckbox').addEventListener('change', () => {
      
        FavoritenMarkersArray.show = !FavoritenMarkersArray.show;
        if (FavoritenMarkersArray.show) {
          hideAllMarkers();
          document.getElementById('FavoritenCheckbox').checked = false;
        } else {
          showAllMarkers();
          document.getElementById('FavoritenCheckbox').checked = true;
        }
        });


    //Polygone
    // Event listener for the checkbox to show/hide all polygons
document.getElementById('PolygonCheckbox').addEventListener('change', (event) => {
    const isChecked = event.target.checked;
    
    if (isChecked) {
        showAllPolygons();
    } else {
        hideAllPolygons();
    }
});

// Function to show all polygons
function showAllPolygons() {
    polygonEntitiesArray.forEach(function(polygonEntity) {
        polygonEntity.show = true;
    });
}

// Function to hide all polygons
function hideAllPolygons() {
    polygonEntitiesArray.forEach(function(polygonEntity) {
        polygonEntity.show = false;
    });
}


//Trees
    

        //Hochwasser mit Slider
        document.getElementById('layerSlider').addEventListener('change', (event) => {
          if (layerSlider.value ==='0') {
            wmsHQ10.show = true;
            wmsHQ100.show = false;
            wmsHQ500.show = false;
            HochwasserCheckbox.checked === true;
          }
          else if (layerSlider.value ==='1') {
            wmsHQ10.show = false;
            wmsHQ100.show = true;
            wmsHQ500.show = false;
            HochwasserCheckbox.checked === true;
          }
          else if (layerSlider.value ==='2') {
            wmsHQ10.show = false;
            wmsHQ100.show = false;
            wmsHQ500.show = true;
            HochwasserCheckbox.checked === true;
          }
          
      });
     
        function updateLayers(value) {
                if (value === '0') {
                    wmsHQ10.show = true;
                    wmsHQ100.show = false;
                    wmsHQ500.show = false;
                    HochwasserCheckbox.checked = true;
                } else if (value === '1') {
                    wmsHQ10.show = false;
                    wmsHQ100.show = true;
                    wmsHQ500.show = false;
                    HochwasserCheckbox.checked = true;
                } else if (value === '2') {
                    wmsHQ10.show = false;
                    wmsHQ100.show = false;
                    wmsHQ500.show = true;
                    HochwasserCheckbox.checked = true;
                }
            };
            //updateLayers(layerSlider.value);

            // Event listener for slider input changes
            layerSlider.addEventListener('input', (event) => {
                updateLayers(event.target.value);
            });

            // Event listener for checkbox changes
            HochwasserCheckbox.addEventListener('change', (event) => {
                if (HochwasserCheckbox.checked) {
                    layerSlider.value = '0';
                    updateLayers('0');
                }
                else if (HochwasserCheckbox.checked === false) {
                    layerSlider.value = '0';
                    wmsHQ10.show = false;
                    wmsHQ100.show = false;
                    wmsHQ500.show = false;
                }
            });

     
            //Boat Animation
let polyline; // Declare polyline in the global scope
let boatEntity; // Declare boatEntity in the global scope

  async function animateBoat() {
    
  const boat =  await Cesium.IonResource.fromAssetId(2699733);
  
  
  
  // Define the position of the boat using Cartesian3
  const position = Cesium.Cartesian3.fromDegrees(6.966, 50.945);

  // Define the heading, pitch, and roll (in radians) for the orientation
  const heading = Cesium.Math.toRadians(90); // Heading: rotation around the vertical axis (Z-axis)
  const pitch = Cesium.Math.toRadians(0); // Pitch: rotation around the lateral axis (X-axis)
  const roll = Cesium.Math.toRadians(0); // Roll: rotation around the longitudinal axis (Y-axis)

  // Create the orientation quaternion from heading, pitch, and roll
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(heading, pitch, roll));


  // Add the boat entity with position, orientation, and scale
  boatEntity = viewer.entities.add({
    position: position,
    orientation: orientation,
    model: {
      uri: boat,
      scale: 50,  // Adjust the scale as needed
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      color: Cesium.Color.GOLD,
    },
  });

  // Set the viewer to track the boat entity
  //viewer.trackedEntity = boatEntity;

//waypoints for the boat
const waypoints = [
    Cesium.Cartesian3.fromDegrees(6.966, 50.945),
    Cesium.Cartesian3.fromDegrees(6.966, 50.935),
    // Add more waypoints as needed
];
 //waypoints for the boat as line
 polyline = viewer.entities.add({
    polyline: {
        positions: waypoints,
        width: 5,
        material: Cesium.Color.TRANSPARENT,
        clampToGround: true  // Clamps the polyline to the terrain
    }
});
//boatEntity.show = false;

//Animation
// Animation
const start = Cesium.JulianDate.now();
const stop = Cesium.JulianDate.addSeconds(start, 100, new Cesium.JulianDate());

viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // Loop at the end
viewer.clock.multiplier = 1; // Adjust speed as needed

const positionProperty = new Cesium.SampledPositionProperty();

// Enable interpolation (for smooth motion between samples)
positionProperty.setInterpolationOptions({
    interpolationDegree: 5, // Adjust the degree of interpolation (1 is linear, higher values give smoother results)
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation // Choose an interpolation algorithm
});

// Enable extrapolation (continue moving even outside sample time range)
positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
positionProperty.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;

for (let i = 0; i < waypoints.length; i++) {
    const time = Cesium.JulianDate.addSeconds(start, i * 10, new Cesium.JulianDate());
    positionProperty.addSample(time, waypoints[i]);
}

boatEntity.position = positionProperty;

// Ensure the boat faces the direction of travel
boatEntity.orientation = new Cesium.VelocityOrientationProperty(positionProperty);

viewer.clock.shouldAnimate = true;
}

document.getElementById('boat').addEventListener('click', () => {
  if (polyline) {
        console.log('Removing polyline');
        viewer.entities.remove(polyline); // Remove the polyline from the viewer
        polyline = null; // Clear the reference
    }

    if (boatEntity) {
        console.log('Removing boat');
        viewer.entities.remove(boatEntity); // Remove the boat entity from the viewer
        boatEntity = null; // Clear the reference
    }
  animateBoat();
  document.getElementById('startBoat').style.display = 'inline-block';
  document.getElementById('stopBoat').style.display = 'inline-block';

});
document.getElementById('startBoat').addEventListener('click', () => {
  if (polyline) {
        console.log('Removing polyline');
        viewer.entities.remove(polyline); // Remove the polyline from the viewer
        polyline = null; // Clear the reference
    }

    if (boatEntity) {
        console.log('Removing boat');
        viewer.entities.remove(boatEntity); // Remove the boat entity from the viewer
        boatEntity = null; // Clear the reference
    }
    animateBoat();
});
document.getElementById('stopBoat').addEventListener('click', () => {
    

  if (polyline) {
        console.log('Removing polyline');
        viewer.entities.remove(polyline); // Remove the polyline from the viewer
        polyline = null; // Clear the reference
    }

    if (boatEntity) {
        console.log('Removing boat');
        viewer.entities.remove(boatEntity); // Remove the boat entity from the viewer
        boatEntity = null; // Clear the reference
    }
    viewer.clock.shouldAnimate = false;
    document.getElementById('startBoat').style.display = 'none';
  document.getElementById('stopBoat').style.display = 'none';
});
// Boat as 3D Tileset
/*
const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2699753, {
    //This tileset doesn't have a location, so we're using a modelMatrix to place it at 0, 0 instead of drawing at the center of the earth
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(6.958, 50.930, 200),
    ),
  });
  viewer.scene.primitives.add(tileset);
  await viewer.zoomTo(tileset);

  // Apply the default style if it exists
  const extras = tileset.asset.extras;
  if (
    Cesium.defined(extras) &&
    Cesium.defined(extras.ion) &&
    Cesium.defined(extras.ion.defaultStyle)
  ) {
    tileset.style = new Cesium.Cesium3DTileStyle(extras.ion.defaultStyle);
  }
  */

  //Building Filter
  // Event listener for the "Apply Filter" button click
document.getElementById('filterButton').addEventListener('click', function() {
    clearSelection(); // Optional: Clear previous selection before applying the new filter
    const heightValue = parseFloat(document.getElementById('heightInput').value);
    filterTilesByHeight(heightValue);
});

// Event listener for the "Clear Selection" button click
document.getElementById('deleteFilter').addEventListener('click', function() {
    clearSelection();
     // Reset the input field to blank
     document.getElementById('heightInput').value = '';
});

// Function to filter tiles by "Height" attribute
function filterTilesByHeight(height) {
    LoD2Koeln.tileVisible.addEventListener(function(tile) {
        let meetsHeightCriteria = false;
        
        if (tile.content) {
            // Loop through features if they exist in the tile
            const featuresLength = tile.content.featuresLength;
            for (let i = 0; i < featuresLength; i++) {
                const feature = tile.content.getFeature(i);
                const featureHeight = feature.getProperty('Height');

                if (featureHeight >= height) {
                    meetsHeightCriteria = true;
                    break;
                }
            }
        }

        // Highlight the tile if it meets the height criteria
        if (meetsHeightCriteria) {
            tile.color = Cesium.Color.RED.withAlpha(0.5);
        } else {
            tile.color = Cesium.Color.WHITE.withAlpha(1.0);
        }
    });
}

// Function to reset the color of all tiles to white
function clearSelection() {
    LoD2Koeln.tileVisible.addEventListener(function(tile) {
        tile.color = Cesium.Color.WHITE.withAlpha(1.0);
    });
}

//Current Location
 // Create callback for browser's geolocation
function fly(position) {
    const longitude = position.coords.longitude;
    const latitude = position.coords.latitude;
    
    // Fly to the user's location
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1000.0),
    });

    // Add a marker at the user's current position
    viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        billboard: {
            image: 'data:image/png;base64,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',
            width: 50,
            height: 50,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, Number.POSITIVE_INFINITY)
        }
    });
}

// Ask browser for location, and fly there on button click
document.getElementById("locationButton").addEventListener("click", function() {
    navigator.geolocation.getCurrentPosition(fly);
});


//Fly to TUV
document.getElementById("TUVButton").addEventListener("click", function() {
    const initialPosition = Cesium.Cartesian3.fromDegrees(6.99193205, 50.91923387, 300); // Long, Lat, Height
    const initialOrientation = {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-15.0),
    };
        viewer.camera.flyTo({
          destination:initialPosition,
          orientation: initialOrientation
        });
});



//Measure Function
var camera = viewer.camera;
        var scene = viewer.scene;
        var globe = scene.globe;
        var ellipsoid = Cesium.Ellipsoid.WGS84;
        var geodesic = new Cesium.EllipsoidGeodesic();
            

        var isMeasuring = false; // Flag to track the measurement mode
var points, polylines;
var measureHandler; // New handler specifically for measurement
var distanceLabel, verticalLabel, horizontalLabel; // Labels for measurement

document.getElementById('measureButton').addEventListener('click', function() {
    isMeasuring = !isMeasuring; // Toggle measurement mode

    if (isMeasuring) {
        // Initialize collections and handler when measuring is activated
        points = scene.primitives.add(new Cesium.PointPrimitiveCollection());
        polylines = scene.primitives.add(new Cesium.PolylineCollection());
        measureHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        document.getElementById('deleteMeasure').style.display = 'inline-block';
        // Add distance label
        var point1, point2;
        var point1GeoPosition, point2GeoPosition;
        var polyline1, polyline2, polyline3;
        var LINEPOINTCOLOR = Cesium.Color.RED;

        var label = {
            font: '14px monospace',
            showBackground: true,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(0, 0),
            eyeOffset: new Cesium.Cartesian3(0, 0, -50),
            fillColor: Cesium.Color.WHITE,
        };

        function addDistanceLabel(point1, point2, height) {
            point1.cartographic = ellipsoid.cartesianToCartographic(point1.position);
            point2.cartographic = ellipsoid.cartesianToCartographic(point2.position);
            point1.longitude = parseFloat(Cesium.Math.toDegrees(point1.position.x));
            point1.latitude = parseFloat(Cesium.Math.toDegrees(point1.position.y));
            point2.longitude = parseFloat(Cesium.Math.toDegrees(point2.position.x));
            point2.latitude = parseFloat(Cesium.Math.toDegrees(point2.position.y));
            label.text = getHorizontalDistanceString(point1, point2);
            horizontalLabel = viewer.entities.add({
                position: getMidpoint(point1, point2, point1GeoPosition.height),
                label: label
            });
            label.text = getDistanceString(point1, point2);
            distanceLabel = viewer.entities.add({
                position: getMidpoint(point1, point2, height),
                label: label
            });
            label.text = getVerticalDistanceString();
            verticalLabel = viewer.entities.add({
                position: getMidpoint(point2, point2, height),
                label: label
            });
        }

        function getHorizontalDistanceString(point1, point2) {
            geodesic.setEndPoints(point1.cartographic, point2.cartographic);
            var meters = geodesic.surfaceDistance.toFixed(2);
            if (meters >= 1000) {
                return (meters / 1000).toFixed(1) + ' км';
            }
            return meters + ' м';
        }

        function getVerticalDistanceString() {
            var heights = [point1GeoPosition.height, point2GeoPosition.height];
            var meters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
            if (meters >= 1000) {
                return (meters / 1000).toFixed(1) + ' км';
            }
            return meters.toFixed(2) + ' м';
        }

        function getDistanceString(point1, point2) {
            geodesic.setEndPoints(point1.cartographic, point2.cartographic);
            var horizontalMeters = geodesic.surfaceDistance.toFixed(2);
            var heights = [point1GeoPosition.height, point2GeoPosition.height];
            var verticalMeters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
            var meters = Math.pow((Math.pow(horizontalMeters, 2) + Math.pow(verticalMeters, 2)), 0.5);

            if (meters >= 1000) {
                return (meters / 1000).toFixed(1) + ' км';
            }
            return meters.toFixed(2) + ' м';
        }

        function getMidpoint(point1, point2, height) {
            var scratch = new Cesium.Cartographic();
            geodesic.setEndPoints(point1.cartographic, point2.cartographic);
            var midpointCartographic = geodesic.interpolateUsingFraction(0.5, scratch);
            return Cesium.Cartesian3.fromRadians(midpointCartographic.longitude, midpointCartographic.latitude, height);
        }

        measureHandler.setInputAction(function(click) {
            if (isMeasuring && scene.mode !== Cesium.SceneMode.MORPHING) {
                var pickedObject = scene.pick(click.position);
                if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                    var cartesian = viewer.scene.pickPosition(click.position);
                    if (Cesium.defined(cartesian)) {
                        if (points.length === 2) {
                            points.removeAll();
                            polylines.removeAll();
                            removeLabels();
                        }
                        // Add the first point
                        if (points.length === 0) {
                            point1 = points.add({
                                position: new Cesium.Cartesian3(cartesian.x, cartesian.y, cartesian.z),
                                color: LINEPOINTCOLOR
                            });
                        }
                        // Add the second point and lines
                        else if (points.length === 1) {
                            point2 = points.add({
                                position: new Cesium.Cartesian3(cartesian.x, cartesian.y, cartesian.z),
                                color: LINEPOINTCOLOR
                            });
                            point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
                            point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);

                            var pl1Positions = [
                                new Cesium.Cartesian3.fromRadians(point1GeoPosition.longitude, point1GeoPosition.latitude, point1GeoPosition.height),
                                new Cesium.Cartesian3.fromRadians(point2GeoPosition.longitude, point2GeoPosition.latitude, point2GeoPosition.height)
                            ];
                            var pl2Positions = [
                                new Cesium.Cartesian3.fromRadians(point2GeoPosition.longitude, point2GeoPosition.latitude, point2GeoPosition.height),
                                new Cesium.Cartesian3.fromRadians(point2GeoPosition.longitude, point2GeoPosition.latitude, point1GeoPosition.height)
                            ];
                            var pl3Positions = [
                                new Cesium.Cartesian3.fromRadians(point1GeoPosition.longitude, point1GeoPosition.latitude, point1GeoPosition.height),
                                new Cesium.Cartesian3.fromRadians(point2GeoPosition.longitude, point2GeoPosition.latitude, point1GeoPosition.height)
                            ];

                            polyline1 = polylines.add({
                                show: true,
                                positions: pl1Positions,
                                width: 1,
                                material: new Cesium.Material({
                                    fabric: {
                                        type: 'Color',
                                        uniforms: {
                                            color: LINEPOINTCOLOR
                                        }
                                    }
                                })
                            });
                            polyline2 = polylines.add({
                                show: true,
                                positions: pl2Positions,
                                width: 1,
                                material: new Cesium.Material({
                                    fabric: {
                                        type: 'PolylineDash',
                                        uniforms: {
                                            color: LINEPOINTCOLOR,
                                        }
                                    },
                                })
                            });
                            polyline3 = polylines.add({
                                show: true,
                                positions: pl3Positions,
                                width: 1,
                                material: new Cesium.Material({
                                    fabric: {
                                        type: 'PolylineDash',
                                        uniforms: {
                                            color: LINEPOINTCOLOR,
                                        }
                                    },
                                })
                            });
                            var labelZ;
                            if (point2GeoPosition.height >= point1GeoPosition.height) {
                                labelZ = point1GeoPosition.height + (point2GeoPosition.height - point1GeoPosition.height) / 2.0;
                            } else {
                                labelZ = point2GeoPosition.height + (point1GeoPosition.height - point2GeoPosition.height) / 2.0;
                            };

                            addDistanceLabel(point1, point2, labelZ);

                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } else {
        // Clear any ongoing measurements and remove handlers when measuring is deactivated
        if (points) points.removeAll();
        if (polylines) polylines.removeAll();
        if (measureHandler) measureHandler.destroy();
        removeLabels();
        document.getElementById('deleteMeasure').style.display = 'none';
    }
});

// Function to remove all distance labels
function removeLabels() {
    if (viewer && viewer.entities) {
        if (distanceLabel) viewer.entities.remove(distanceLabel);
        if (horizontalLabel) viewer.entities.remove(horizontalLabel);
        if (verticalLabel) viewer.entities.remove(verticalLabel);

        distanceLabel = null;
        horizontalLabel = null;
        verticalLabel = null;
    }
}
