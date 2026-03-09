/* Leaflet map — extracted from neighborhood_log.html */
(function () {
  var mapEl = document.getElementById('map');
  if (!mapEl) return;

  var map = L.map('map', { center: [45.7470, -122.6335], zoom: 15 });

  var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri', maxZoom: 20
  });
  var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors', maxZoom: 20
  });
  var labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB', maxZoom: 20, pane: 'overlayPane'
  });

  satellite.addTo(map);
  labels.addTo(map);

  // Development overlays
  var originalNeighborhood = L.polygon([
    [45.7490, -122.6380], [45.7490, -122.6310],
    [45.7478, -122.6310], [45.7478, -122.6380]
  ], { color: '#228b22', weight: 2, fillColor: '#228b22', fillOpacity: 0.25, dashArray: '6,4' })
    .bindPopup('<b>Original Fairgrounds Neighborhood</b><br>~20 homes (pre-2019)');

  var mhSubdivision = L.polygon([
    [45.7478, -122.6380], [45.7478, -122.6310],
    [45.7462, -122.6310], [45.7462, -122.6380]
  ], { color: '#eab308', weight: 2, fillColor: '#eab308', fillOpacity: 0.25 })
    .bindPopup('<b>M&H Subdivision (Salmon Creek Reserve)</b><br>72 lots — Under construction');

  var viersSubdivision = L.polygon([
    [45.7490, -122.6308], [45.7490, -122.6230],
    [45.7462, -122.6230], [45.7462, -122.6308]
  ], { color: '#ea580c', weight: 2, fillColor: '#ea580c', fillOpacity: 0.25 })
    .bindPopup('<b>Viers Subdivision (PUD)</b><br>84 lots — Approved');

  var millCreekEstates = L.polygon([
    [45.7477, -122.6350], [45.7477, -122.6320],
    [45.7460, -122.6320], [45.7460, -122.6350]
  ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.30 })
    .bindPopup('<b>Mill Creek Estates</b><br>43 lots — Pre-application');

  var subdivision174 = L.polygon([
    [45.7462, -122.6310], [45.7462, -122.6230],
    [45.7438, -122.6230], [45.7438, -122.6310]
  ], { color: '#7f1d1d', weight: 2, fillColor: '#7f1d1d', fillOpacity: 0.30 })
    .bindPopup('<b>174th Street Subdivision</b><br>103 lots — Pre-application<br><b>Exceeds 100-lot max for single-access roads.</b>');

  var ne174th = L.polyline([
    [45.7477, -122.6400], [45.7477, -122.6200]
  ], { color: '#dc2626', weight: 5, opacity: 0.8 })
    .bindPopup('<b>NE 174th Street</b><br>Width: &lt;20 ft (required: 32–36 ft)<br>~3,065 projected daily trips');

  var ne50thClosure = L.polyline([
    [45.7510, -122.6270], [45.7420, -122.6270]
  ], { color: '#f97316', weight: 5, opacity: 0.7, dashArray: '10,8' })
    .bindPopup('<b>NE 50th Avenue — CLOSED</b><br>80-day closure starting March 9, 2026');

  var intIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#7c3aed;border-radius:50%;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>',
    iconSize: [18, 18], iconAnchor: [9, 9]
  });

  var int1 = L.marker([45.7477, -122.6270], { icon: intIcon })
    .bindPopup('<b>NE 50th Ave & 174th St</b><br>Poor visibility, hilly terrain');
  var int2 = L.marker([45.7477, -122.6295], { icon: intIcon })
    .bindPopup('<b>NE 40th Ave & 174th St</b><br>All ~3,065 daily trips flow through here');

  var layers = {
    'Original Neighborhood (~20)': L.layerGroup([originalNeighborhood]),
    'M&H Subdivision (72)': L.layerGroup([mhSubdivision]),
    'Viers Subdivision (84)': L.layerGroup([viersSubdivision]),
    'Mill Creek Estates (43)': L.layerGroup([millCreekEstates]),
    '174th St Subdivision (103)': L.layerGroup([subdivision174]),
    'NE 174th Street': L.layerGroup([ne174th]),
    'NE 50th Ave Closure': L.layerGroup([ne50thClosure]),
    'Problem Intersections': L.layerGroup([int1, int2])
  };

  Object.values(layers).forEach(function (l) { l.addTo(map); });

  L.control.layers(
    { 'Satellite': satellite, 'Street Map': osm },
    layers
  ).addTo(map);

  L.control.scale({ imperial: true, metric: false }).addTo(map);

  map.on('baselayerchange', function (e) {
    if (e.name === 'Street Map') map.removeLayer(labels);
    else map.addLayer(labels);
  });
})();
