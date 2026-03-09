/* Leaflet map — extracted from neighborhood_log.html */
(function () {
  var mapEl = document.getElementById('map');
  if (!mapEl) return;

  var map = L.map('map', {
    center: [45.7460, -122.6270],
    zoom: 14,
    zoomControl: false,
    attributionControl: false
  });

  var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20
  });
  var labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    maxZoom: 20, pane: 'overlayPane'
  });

  satellite.addTo(map);
  labels.addTo(map);

  // Development overlays
  L.polygon([
    [45.7490, -122.6380], [45.7490, -122.6310],
    [45.7478, -122.6310], [45.7478, -122.6380]
  ], { color: '#228b22', weight: 2, fillColor: '#228b22', fillOpacity: 0.25, dashArray: '6,4' }).addTo(map);

  L.polygon([
    [45.7478, -122.6380], [45.7478, -122.6310],
    [45.7462, -122.6310], [45.7462, -122.6380]
  ], { color: '#eab308', weight: 2, fillColor: '#eab308', fillOpacity: 0.25 }).addTo(map);

  L.polygon([
    [45.7490, -122.6308], [45.7490, -122.6230],
    [45.7462, -122.6230], [45.7462, -122.6308]
  ], { color: '#ea580c', weight: 2, fillColor: '#ea580c', fillOpacity: 0.25 }).addTo(map);

  L.polygon([
    [45.7477, -122.6350], [45.7477, -122.6320],
    [45.7460, -122.6320], [45.7460, -122.6350]
  ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.30 }).addTo(map);

  L.polygon([
    [45.7462, -122.6310], [45.7462, -122.6230],
    [45.7438, -122.6230], [45.7438, -122.6310]
  ], { color: '#7f1d1d', weight: 2, fillColor: '#7f1d1d', fillOpacity: 0.30 }).addTo(map);

  // Mt. Vista Logistics Warehouse — east of NE 50th Ave, south of developments
  L.polygon([
    [45.7425, -122.6190], [45.7425, -122.6100],
    [45.7375, -122.6100], [45.7375, -122.6190]
  ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.30 }).addTo(map);

  // NE 174th Street
  L.polyline([
    [45.7477, -122.6400], [45.7477, -122.6200]
  ], { color: '#dc2626', weight: 5, opacity: 0.8 }).addTo(map);

  // NE 50th Ave Closure Zone
  L.polyline([
    [45.7510, -122.6270], [45.7420, -122.6270]
  ], { color: '#f97316', weight: 5, opacity: 0.7, dashArray: '10,8' }).addTo(map);

  // Problem Intersections
  var intIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#7c3aed;border-radius:50%;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>',
    iconSize: [18, 18], iconAnchor: [9, 9]
  });
  L.marker([45.7477, -122.6270], { icon: intIcon }).addTo(map);
  L.marker([45.7477, -122.6295], { icon: intIcon }).addTo(map);
})();
