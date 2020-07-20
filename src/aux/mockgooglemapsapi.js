export const setupGoogleMapsAPIMock = () => {
  const google = {
    maps: {
      Animation: {
        BOUNCE: 1,
        DROP: 2,
        en: 4,
        gn: 3,
      },
      BicyclingLayer: class {
        constructor() {}
        getMap() {
          return null;
        }
        setMap(map) {}
      },
      Circle: class {
        constructor(options) {}
        getBounds() {}
        getCenter() {}
        getDraggable() {}
        getEditable() {}
        getMap() {}
        getRadius() {}
        getVisible() {}
        setCenter(center) {}
        setDraggable(draggable) {}
        setEditable(editable) {}
        setMap(map) {}
        setOptions(options) {}
        setRadius(radius) {}
        setVisible(visible) {}
      },
      ControlPosition: {
        BOTTOM: 11,
        BOTTOM_CENTER: 11,
        BOTTOM_LEFT: 10,
        BOTTOM_RIGHT: 12,
        CENTER: 13,
        LEFT: 5,
        LEFT_BOTTOM: 6,
        LEFT_CENTER: 4,
        LEFT_TOP: 5,
        RIGHT: 7,
        RIGHT_BOTTOM: 9,
        RIGHT_CENTER: 8,
        RIGHT_TOP: 7,
        TOP: 2,
        TOP_CENTER: 2,
        TOP_LEFT: 1,
        TOP_RIGHT: 3,
      },
      Data: class {
        constructor(options) {}
        add(feature) {}
        addGeoJson(geoJson, options) {}
        contains(feature) {}
        forEach(callback) {}
        getControlPosition() {}
        getControls() {}
        getDrawingMode() {}
        getFeatureById(id) {}
        getMap() {}
        getStyle() {}
        loadGeoJson(url, options, callback) {}
        overrideStyle(feature, style) {}
        remove(feature) {}
        revertStyle(feature) {}
        setControlPosition(controlPosition) {}
        setControls(controls) {}
        setDrawingMode(drawingMode) {}
        setMap(map) {}
        setStyle(style) {}
        toGeoJson(callback) {}
      },
      DirectionsRenderer: class {
        constructor(options) {}
        getDirections() {}
        getMap() {}
        getPanel() {}
        getRouteIndex() {}
        setDirections(directions) {}
        setMap(map) {}
        setOptions(options) {}
        setPanel(panel) {}
        setRouteIndex(routeIndex) {}
      },
      DirectionsService: class {
        constructor() {}
        route(request, callback) {}
      },
      DirectionsStatus: {
        INVALID_REQUEST: 'INVALID_REQUEST',
        MAX_WAYPOINTS_EXCEEDED: 'MAX_WAYPOINTS_EXCEEDED',
        NOT_FOUND: 'NOT_FOUND',
        OK: 'OK',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
        REQUEST_DENIED: 'REQUEST_DENIED',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
        ZERO_RESULTS: 'ZERO_RESULTS',
      },
      DirectionsTravelMode: {
        BICYCLING: 'BICYCLING',
        DRIVING: 'DRIVING',
        TRANSIT: 'TRANSIT',
        TWO_WHEELER: 'TWO_WHEELER',
        WALKING: 'WALKING',
      },
      DirectionsUnitSystem: {
        IMPERIAL: 1,
        METRIC: 0,
      },
      DistanceMatrixElementStatus: {
        NOT_FOUND: 'NOT_FOUND',
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS',
      },
      DistanceMatrixService: class {
        constructor() {}
        getDistanceMatrix(request, callback) {}
      },
      DistanceMatrixStatus: {
        INVALID_REQUEST: 'INVALID_REQUEST',
        MAX_DIMENSIONS_EXCEEDED: 'MAX_DIMENSIONS_EXCEEDED',
        MAX_ELEMENTS_EXCEEDED: 'MAX_ELEMENTS_EXCEEDED',
        OK: 'OK',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
        REQUEST_DENIED: 'REQUEST_DENIED',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
      },
      ElevationService: class {
        constructor() {}
        getElevationAlongPath(request, callback) {}
        getElevationForLocations(request, callback) {}
      },
      ElevationStatus: {
        INVALID_REQUEST: 'INVALID_REQUEST',
        OK: 'OK',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
        REQUEST_DENIED: 'REQUEST_DENIED',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
      },
      FusionTablesLayer: class {
        constructor() {}
      },
      Geocoder: class {
        constructor() {}
        geocode(request, callback) {}
      },
      GeocoderLocationType: {
        APPROXIMATE: 'APPROXIMATE',
        GEOMETRIC_CENTER: 'GEOMETRIC_CENTER',
        RANGE_INTERPOLATED: 'RANGE_INTERPOLATED',
        ROOFTOP: 'ROOFTOP',
      },
      GeocoderStatus: {
        ERROR: 'ERROR',
        INVALID_REQUEST: 'INVALID_REQUEST',
        OK: 'OK',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
        REQUEST_DENIED: 'REQUEST_DENIED',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
        ZERO_RESULTS: 'ZERO_RESULTS',
      },
      GroundOverlay: class {
        constructor(url, bounds, opts) {}
        getBounds() {}
        getMap() {}
        getOpacity() {}
        getUrl() {}
        setMap(map) {}
        setOpacity(opacity) {}
      },
      ImageMapType: class {
        constructor(opts) {}
        getOpacity() {}
        getTile(tileCoord, zoom, ownerDocument) {}
        releaseTile(tileDiv) {}
        setOpacity(opacity) {}
      },
      InfoWindow: class {
        constructor(opts) {}
        close() {}
        getContent() {}
        getPosition() {}
        getZIndex() {}
        open(map, anchor) {}
        setContent(content) {}
        setOptions(options) {}
        setPosition(position) {}
        setZIndex(zIndex) {}
      },
      KmlLayer: class {
        constructor(opts) {}
        getDefaultViewport() {}
        getMap() {}
        getMetadata() {}
        getStatus() {}
        getUrl() {}
        getZIndex() {}
        setMap(map) {}
        setOptions(options) {}
        setUrl(url) {}
        setZIndex(zIndex) {}
      },
      KmlLayerStatus: {
        DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
        DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',
        FETCH_ERROR: 'FETCH_ERROR',
        INVALID_DOCUMENT: 'INVALID_DOCUMENT',
        INVALID_REQUEST: 'INVALID_REQUEST',
        LIMITS_EXCEEDED: 'LIMITS_EXCEEDED',
        OK: 'OK',
        TIMED_OUT: 'TIMED_OUT',
        UNKNOWN: 'UNKNOWN',
      },
      LatLng: class {
        constructor(lat, lng, noWrap) {}
        equals(other) {}
        lat() {}
        lng() {}
        toJSON() {}
        toString() {}
        toUrlValue(precision) {}
      },
      LatLngBounds: class {
        constructor(sw, ne) {}
        contains(latLng) {}
        equals(other) {}
        extend(point) {}
        getCenter() {}
        getNorthEast() {}
        getSouthWest() {}
        intersects(other) {}
        isEmpty() {}
        toJSON() {}
        toSpan() {}
        toString() {}
        toUrlValue(precision) {}
        union(other) {}
      },
      MVCArray: class {
        constructor(array) {}
        clear() {}
        forEach(callback) {}
        getArray() {}
        getAt(i) {}
        getLength() {}
        insertAt(i, elem) {}
        pop() {}
        push(elem) {}
        removeAt(i) {}
        setAt(i, elem) {}
      },
      MVCObject: class {
        constructor() {}
        addListener(eventName, handler) {}
        bindTo(key, target, targetKey, noNotify) {}
        get(key) {}
        notify(key) {}
        set(key, value) {}
        setValues(values) {}
        unbind(key) {}
        unbindAll() {}
      },
      Map: class {
        constructor(mapDiv, opts) {}
        fitBounds(bounds, padding) {}
        getBounds() {}
        getCenter() {}
        getClickableIcons() {}
        getDiv() {}
        getHeading() {}
        getMapTypeId() {}
        getProjection() {}
        getStreetView() {}
        getTilt() {}
        getZoom() {}
        panBy(x, y) {}
        panTo(latLng) {}
        panToBounds(latLngBounds, padding) {}
        setCenter(latlng) {}
        setClickableIcons(value) {}
        setHeading(heading) {}
        setMapTypeId(mapTypeId) {}
        setOptions(options) {}
        setStreetView(panorama) {}
        setTilt(tilt) {}
        setZoom(zoom) {}
      },
      MapTypeControlStyle: {
        DEFAULT: 0,
        DROPDOWN_MENU: 2,
        HORIZONTAL_BAR: 1,
        INSET: 3,
        INSET_LARGE: 4,
      },
      MapTypeId: {
        HYBRID: 'HYBRID',
        ROADMAP: 'ROADMAP',
        SATELLITE: 'SATELLITE',
        TERRAIN: 'TERRAIN',
      },
      MapTypeRegistry: class {
        constructor() {}
        set(id, mapType) {}
      },
      Marker: class {
        constructor(opts) {}
        getAnimation() {}
        getClickable() {}
        getCursor() {}
        getDraggable() {}
        getIcon() {}
        getLabel() {}
        getMap() {}
        getOpacity() {}
        getPosition() {}
        getShape() {}
        getTitle() {}
        getVisible() {}
        getZIndex() {}
        setAnimation(animation) {}
        setClickable(flag) {}
        setCursor(cursor) {}
        setDraggable(flag) {}
        setIcon(icon) {}
        setLabel(label) {}
        setMap(map) {}
        setOpacity(opacity) {}
        setOptions(options) {}
        setPosition(latlng) {}
        setShape(shape) {}
        setTitle(title) {}
        setVisible(visible) {}
        setZIndex(zIndex) {}
      },
      MarkerImage: class {
        constructor(opts) {}
      },
      MaxZoomService: class {
        constructor() {}
        getMaxZoomAtLatLng(latlng, callback) {}
      },
      MaxZoomStatus: {
        ERROR: 'ERROR',
        OK: 'OK',
      },
      NavigationControlStyle: {
        ANDROID: 2,
        DEFAULT: 0,
        SMALL: 1,
        ZOOM_PAN: 3,
      },
      OverlayView: class {
        constructor() {}
        static preventMapHitsAndGesturesFrom(element) {}
        static preventMapHitsFrom(element) {}
        draw() {}
        getMap() {}
        getPanes() {}
        getProjection() {}
        onAdd() {}
        onRemove() {}
        setMap(map) {}
      },
      Point: class {
        constructor(x, y) {}
        equals(other) {}
        toString() {}
      },
      Polygon: class {
        constructor(opts) {}
        getDraggable() {}
        getEditable() {}
        getMap() {}
        getPath() {}
        getPaths() {}
        getVisible() {}
        setDraggable(draggable) {}
        setEditable(editable) {}
        setMap(map) {}
        setOptions(options) {}
        setPath(path) {}
        setPaths(paths) {}
        setVisible(visible) {}
      },
      Polyline: class {
        constructor(opts) {}
        getDraggable() {}
        getEditable() {}
        getMap() {}
        getPath() {}
        getVisible() {}
        setDraggable(draggable) {}
        setEditable(editable) {}
        setMap(map) {}
        setOptions(options) {}
        setPath(path) {}
        setVisible(visible) {}
      },
      Rectangle: class {
        constructor(opts) {}
        getBounds() {}
        getDraggable() {}
        getEditable() {}
        getMap() {}
        getVisible() {}
        setBounds(bounds) {}
        setDraggable(draggable) {}
        setEditable(editable) {}
        setMap(map) {}
        setOptions(options) {}
        setVisible(visible) {}
      },
      SaveWidget: class {
        constructor() {}
      },
      ScaleControlStyle: {
        DEFAULT: 0,
      },
      Size: class {
        constructor(width, height, widthUnit, heightUnit) {}
        equals(other) {}
        toString() {}
      },
      StreetViewCoverageLayer: class {
        constructor() {}
        getMap() {}
        setMap(map) {}
      },
      StreetViewPanorama: class {
        constructor(container, opts) {}
        getLinks() {}
        getLocation() {}
        getMotionTracking() {}
        getPano() {}
        getPhotographerPov() {}
        getPosition() {}
        getPov() {}
        getStatus() {}
        getVisible() {}
        getZoom() {}
        registerPanoProvider(provider, opt_options) {}
        setLinks(links) {}
        setMotionTracking(motionTracking) {}
        setOptions(options) {}
        setPano(pano) {}
        setPosition(latLng) {}
        setPov(pov) {}
        setVisible(flag) {}
        setZoom(zoom) {}
      },
      StreetViewPreference: {
        BEST: 'BEST',
        NEAREST: 'NEAREST',
      },
      StreetViewService: class {
        constructor() {}
        getPanorama(request, callback) {}
      },
      StreetViewSource: {
        DEFAULT: 'DEFAULT',
        OUTDOOR: 'OUTDOOR',
      },
      StreetViewStatus: {
        OK: 'OK',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
        ZERO_RESULTS: 'ZERO_RESULTS',
      },
      StrokePosition: {
        CENTER: 0,
        INSIDE: 1,
        OUTSIDE: 2,
      },
      StyledMapType: class {
        constructor(styles, options) {}
        getTile(tileCoord, zoom, ownerDocument) {}
        releaseTile(tile) {}
      },
      SymbolPath: {
        BACKWARD_CLOSED_ARROW: 3,
        BACKWARD_OPEN_ARROW: 4,
        CIRCLE: 0,
        FORWARD_CLOSED_ARROW: 1,
        FORWARD_OPEN_ARROW: 2,
      },
      TrafficLayer: class {
        constructor(opts) {}
        getMap() {}
        setMap(map) {}
        setOptions(options) {}
      },
      TrafficModel: {
        BEST_GUESS: 'BEST_GUESS',
        OPTIMISTIC: 'OPTIMISTIC',
        PESSIMISTIC: 'PESSIMISTIC',
      },
      TransitLayer: class {
        constructor() {}
        getMap() {}
        setMap(map) {}
      },
      TransitMode: {
        BUS: 'BUS',
        RAIL: 'RAIL',
        SUBWAY: 'SUBWAY',
        TRAIN: 'TRAIN',
        TRAM: 'TRAM',
      },
      TransitRoutePreference: {
        FEWER_TRANSFERS: 'FEWER_TRANSFERS',
        LESS_WALKING: 'LESS_WALKING',
      },
      TravelMode: {
        BICYCLING: 'BICYCLING',
        DRIVING: 'DRIVING',
        TRANSIT: 'TRANSIT',
        TWO_WHEELER: 'TWO_WHEELER',
        WALKING: 'WALKING',
      },
      UnitSystem: {
        IMPERIAL: 1,
        METRIC: 0,
      },
      ZoomControlStyle: {
        DEFAULT: 0,
        LARGE: 2,
        SMALL: 1,
        ej: 3,
      },
      drawing: {
        DrawingManager: class {
          constructor(options) {}
          getDrawingMode() {}
          getMap() {}
          setDrawingMode(drawingMode) {}
          setMap(map) {}
          setOptions(options) {}
        },
        OverlayType: {
          CIRCLE: 'CIRCLE',
          MARKER: 'MARKER',
          POLYGON: 'POLYGON',
          POLYLINE: 'POLYLINE',
          RECTANGLE: 'RECTANGLE',
        },
      },
      event: {
        Zc: () => {},
        addDomListener: (instance, eventName, handler, capture) => {},
        addDomListenerOnce: (instance, eventName, handler, capture) => {},
        addListener: (instance, eventName, handler) => {},
        addListenerOnce: (instance, eventName, handler) => {},
        ai: () => {},
        bind: (key, target) => {},
        clearInstanceListeners: (instance) => {},
        clearListeners: (instance, eventName) => {},
        forward: () => {},
        hasListeners: () => {},
        removeListener: (listener) => {},
        sa: () => {},
        trigger: (instance, eventName, eventArgs) => {},
        va: () => {},
      },
      geometry: {
        encoding: {
          Ol: () => {},
          Ph: () => {},
          Pl: () => {},
          decodePath: (encodedPath) => {},
          encodePath: (path) => {},
        },
        poly: {
          containsLocation: (point, polygon) => {},
          isLocationOnEdge: (point, poly, tolerance) => {},
        },
        spherical: {
          Fj: () => {},
          Gj: () => {},
          computeArea: (path, radius) => {},
          computeDistanceBetween: (from, to, radius) => {},
          computeHeading: (from, to) => {},
          computeLength: (path, radius) => {},
          computeOffset: (from, distance, heading, radius) => {},
          computeOffsetOrigin: (to, distance, heading, radius) => {},
          computeSignedArea: (loop, radius) => {},
          interpolate: (from, to, fraction) => {},
          mf: () => {},
          uk: () => {},
        },
      },
      places: {
        Autocomplete: class {
          constructor(inputField, opts) {}
          getBounds() {}
          getFields() {}
          getPlace() {}
          setBounds(bounds) {}
          setComponentRestrictions(restrictions) {}
          setFields(fields) {}
          setOptions(options) {}
          setTypes(types) {}
        },
        AutocompleteService: class {
          constructor() {}
          getPlacePredictions(request, callback) {}
          getQueryPredictions(request, callback) {}
        },
        AutocompleteSessionToken: class {
          constructor() {}
        },
        PlacesService: class {
          constructor(attrContainer) {}
          findPlaceFromPhoneNumber(request, callback) {}
          findPlaceFromQuery(request, callback) {}
          getDetails(request, callback) {}
          nearbySearch(request, callback) {}
          textSearch(request, callback) {}
        },
        PlacesServiceStatus: {
          INVALID_REQUEST: 'INVALID_REQUEST',
          NOT_FOUND: 'NOT_FOUND',
          OK: 'OK',
          OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
          REQUEST_DENIED: 'REQUEST_DENIED',
          UNKNOWN_ERROR: 'UNKNOWN_ERROR',
          ZERO_RESULTS: 'ZERO_RESULTS',
        },
        RankBy: {
          DISTANCE: 1,
          PROMINENCE: 0,
        },
        RatingLevel: {
          EXCELLENT: 2,
          EXTRAORDINARY: 3,
          GOOD: 0,
          VERY_GOOD: 1,
        },
        SearchBox: class {
          constructor(inputField, opts) {}
          getBounds() {}
          getPlaces() {}
          setBounds(bounds) {}
        },
      },
      version: 'weekly',
      visualization: {
        DynamicMapsEngineLayer: class {
          constructor() {}
        },
        HeatmapLayer: class {
          constructor(opts) {}
          getData() {}
          getMap() {}
          setData(data) {}
          setMap(map) {}
          setOptions(options) {}
        },
        MapsEngineLayer: class {
          constructor() {}
        },
        MapsEngineStatus: {
          INVALID_LAYER: 'INVALID_LAYER',
          OK: 'OK',
          UNKNOWN_ERROR: 'UNKNOWN_ERROR',
        },
      },
    },
  };
  window.google = google;
};
