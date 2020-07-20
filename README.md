# Supercluster Adapter for Google Maps JavaScript API v3

The Supercluster adapter for Google Maps JavaScript API v3 brings functionality of the [supercluster](https://github.com/mapbox/supercluster) a very fast geospatial point clustering library to Google Maps.

The library accepts a standard GeoJSON [FeatureCollection][feature-collection]. The feature collection might contain any geometry features. All features with a [Point][point] geometry will be clusterized with a supercluster while all non-Point features will be added to the Google Maps Data Layer. The library provides several callbacks that allow customize point or cluster markers as well as data layer features appearence and behavior.

## Getting started

The Supercluster adapter library can be served from the firebase host. Add the following script tag in your html file.

    <script src="https://maps-tools-242a6.firebaseapp.com/clusterer/supercluster/index.js">
    </script>

Please note that this library depends on the Google Maps JavaScript API, so it should be initialized once the Google Maps JavaScript API is fully loaded.

Typically Google Maps JavaScript API is loaded in asynchronous way as specified in the official documentation

    <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=[YOUR_API_KEY]]&callback=initMap">
    </script>

That means we must include clusterer initialization code inside initMap() callback function after map object initialization.

E.g.

    function initMap() {
      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center:  {lat: 41.3850639, lng: 2.1734035}
      });

      google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
        SuperClusterAdapter.getClusterer().then(Clusterer => {
          if (Clusterer) {
            const clusterer = new Clusterer.Builder(map)
              .withRadius(80)
              .withMaxZoom(19)
              .withMinZoom(0)
              .build();

            fetch(URL_TO_GET_GEOJSON_DATA).then(response => {
              return response.json();
            }).then(data => {
              clusterer.load(data);
            }).catch(err => {
              console.log("Cannot fetch GeoJSON data for this example");
            });
          }
        });
      });
    }

In this example the clusterer iniatialization was carried out as a response to `tilesloaded` event of map instance. This event is triggered when all tiles of Google Maps are loaded and map is ready to be used.

Note that clusterer is loaded asynchronously, so the logic should be implemented once MarkerClusterer.getClusterer() promise is resolved.

### Setting up clusterer

In order to set up a clusterer you should call `SuperClusterAdapter.getClusterer()` method that returns a promise. Once resolved the promise you will have a Clusterer class that should be used to create an instance of clusterer object.

Code snippet is the following

    SuperClusterAdapter.getClusterer().then(Clusterer => {
      if (Clusterer) {
        // TODO: create instance of clusterer
      }
    });

### Create instance of clusterer

In order to create instance of clusterer you must call Builder, the Builder accepts an instance of google.maps.Map as a constructor parameter and allows call several chained functions to establish parameters of clusterer.

    const clusterer = new Clusterer.Builder(map)
        .withRadius(80)
        .withMaxZoom(19)
        .withMinZoom(0)
        .build();

### Builder

The Builder class supports a set of public methods that allow customize the clusterer.

#### withRadius(radius: number)

Defines cluster radius, in pixels. Default value is 40.

#### withMaxZoom(maxZoom: number)

Maximum zoom level at which clusters are generated. Default: 17.

#### withMinZoom(minZoom: number)

Minimum zoom level at which clusters are generated. Default: 0.

#### withStyles(styles: IStyle[])

Defines styles for clusters such as images, fonts or text colors.

##### Interface IStyle

This interface is used to style the cluster's icons. There is default implementation of styles, but you can override it applying array of styles in Builder object

    interface IStyle {
        url: string;                // Url of icon to use
        height: number;             // Height of icon
        width: number;              // Width of icon
        textColor?: string;         // Text color of cluster label
        fontFamily?: string;        // Font family of cluster label
        textSize?: number;          // Text size of cluster label
        fontWeight?: string;        // Font weight of cluster label
        anchor?: number[] | null;   // Anchor of cluster icon
    }

#### withImagePath(imagePath: string)

Specifies the URL path where the cluster images are located.

#### withImageExtension(imageExtension: string)

Specifies extension of cluster images

#### withZoomOnClick(zoomOnClick: boolean)

Specifies if map should zoom in after clicking the cluster icon. Default: true.

#### withCustomMarkerIcon(customIcon: (pointFeature: GeoJSON.Feature<GeoJSON.Point>) => string)

You can specify a callback function that will be used to set a custom icon on individual markers that are not clusterized. This function receives a GeoJSON [Feature][feature] with a [Point][point] geometry, it should return the URL that represents a marker icon.

E.g.

    function customMarkerIcon(feature) {
      if (feature.properties.iconUrl) {
        return feature.properties.iconUrl;
      } else {
        return "http://maps.google.com/mapfiles/kml/paddle/pink-blank.png";
      }
    }

    const clusterer = new Clusterer.Builder(map)
        .withCustomMarkerIcon(customMarkerIcon)
        .build();

#### withMarkerClick(markerClick: (marker: google.maps.Marker, event: google.maps.MouseEvent) => void)

You can define a callback function to respond the click events on individual markers that are not clustered. This function receives two parameters. The first is the Google Maps [Marker][marker] and the second is Google Maps [MouseEvent][mouseevent]. It might be useful to show [Info Window][info-window] of individual markers

E.g.

    function onMarkerClick(marker, event) {
      infoWindow.close();
      var title = marker.getTitle();
      var content = `<h2>${title}</h2>`;
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    }

    const clusterer = new Clusterer.Builder(map)
        .withMarkerClick(onMarkerClick)
        .build();

#### withFeatureClick(featureClick: (event: google.maps.Data.MouseEvent) => void)

You can define callback function to handle clicks on non-point features of your [FeatureCollection][feature-collection]. This function receives one parameter of type [Data.MouseEvent][data-mouseevent].

E.g.

    function onFeatureClick(event) {
      infoWindow.close();
      if (event.feature) {
        var title = event.feature.getProperty("name");
        var content = `<h2>${title}</h2>`;
        infoWindow.setOptions({
          content: content,
          position: event.latLng,
          map: map
        });
        infoWindow.open(map);
      }
    }

    const clusterer = new Clusterer.Builder(map)
        .withFeatureClick(onFeatureClick)
        .build();

#### withFeatureStyle(featureStyle: google.maps.Data.StylingFunction)

You can define a [Styling Function][styling-function] for non-point features handled by Google Maps Data Layer.

E.g.

    function featureStyle(feature) {
      var options = {
        fillColor: feature.getProperty("color"),
        fillOpacity: 0.5,
        strokeColor: feature.getProperty("color"),
        strokeOpacity: 1,
        strokeWeight: 2
      };
      return options;
    }

    const clusterer = new Clusterer.Builder(map)
        .withFeatureStyle(featureStyle)
        .build();

#### withServerSideFeatureToSuperCluster(transform: (feature: any) => Supercluster.ClusterFeature<Supercluster.AnyProps> | Supercluster.PointFeature<Supercluster.AnyProps>)

In some situations you may have a server-side clustering and retrieve clustered data from your endpoint. In order to show this data using the supercluster library you should apply a callbackfunction that transforms items from your server response to supercluster feature.

E.g.

    function itemToSuperclusterFeature(item) {
      var res = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.point.longitude, item.point.latitude]
        },
        properties: {
        }
      };
      if (item.positionsInside > 1) { // Cluster
        res.properties.cluster = true;
        res.properties.cluster_id = getNewId();
        res.properties.point_count = item.positionsInside;
        res.properties.point_count_abbreviated = abbreviateNumber(item.positionsInside);
      } else {  // Point
        res.properties.id = item.assetMapPosition.id;
        res.properties.name = item.assetMapPosition.assetName;
      }
      return res;
    }

    const clusterer = new Clusterer.Builder(map)
        .withServerSideFeatureToSuperCluster(itemToSuperclusterFeature)
        .build();

Please note that for clusters you have to define mandatory properties `cluster, cluster_id, point_count, point_count_abbreviated`. The feature that you return is a GeoJSON [Feature][feature] with [Point][point] geometry.

#### withOverlapMarkerSpiderfier(oms: OverlappingMarkerSpiderfier)

The Supercluster adapter can be used in conjunction with the [Overlapping Marker Spiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier).

In order to use the Overlapping Marker Spiderfier include the following script in your html page

`<script src="https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js"></script>`

Initialize the instance of spiderfier once you have initialized a map instance. E.g.

    var oms = new OverlappingMarkerSpiderfier(map, {
      markersWontMove: true,
      markersWontHide: true,
      basicFormatEvents: true,
      ignoreMapClick: true,
      keepSpiderfied: true
    });

Pass instance of spidefier to the supercluster adapter builder:

    const clusterer = new Clusterer.Builder(map)
        .withOverlapMarkerSpiderfier(oms)
        .build();

Enjoy.

### Loading features to clusterer

In order to load features to cluster you should use method

`load(geoJson: GeoJSON.FeatureCollection)`

E.g.

    fetch(URL_TO_GET_GEOJSON_DATA).then(response => {
      return response.json();
    }).then(data => {
      clusterer.load(data);
    }).catch(err => {
      console.log("Cannot fetch GeoJSON data for this example");
    });

In order to display clusters calculated by your endpoint on server-side you should call method

`drawServerSideCalculatedClusters(features: any[])`

E.g.

    fetch(URL_TO_GET_SERVERSIDE_DATA).then(response => {
      return response.text();
    }).then(data => {
      var jsonData = JSON.parse(data);
      clusterer.drawServerSideCalculatedClusters(jsonData.mapPositions);
    }).catch(err => {
      console.log("Cannot fetch data for this example");
    });

### Other public methods available on clusterer object

#### setVisible(v: boolean)

Allows set visibility of clusterer

#### destroy()

Destroys clusterer

#### getFeaturesBounds(): google.maps.LatLngBounds

Returns bounds for all features loaded to supercluster

## Demo

The live demo is available at https://maps-tools-242a6.firebaseapp.com/clusterer/demos/supercluster.html

## Licence

The source code of this library is licensed under the MIT License.


[feature-collection]: https://tools.ietf.org/html/rfc7946#section-3.3
[feature]: https://tools.ietf.org/html/rfc7946#section-3.2
[point]: https://tools.ietf.org/html/rfc7946#section-3.1.2
[marker]: https://developers.google.com/maps/documentation/javascript/reference/marker#Marker
[mouseevent]: https://developers.google.com/maps/documentation/javascript/reference/map#MouseEvent
[info-window]: https://developers.google.com/maps/documentation/javascript/reference/info-window
[data-mouseevent]: https://developers.google.com/maps/documentation/javascript/reference/data#Data.MouseEvent
[styling-function]: https://developers.google.com/maps/documentation/javascript/reference/data#Data.StylingFunction
