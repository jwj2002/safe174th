/* Leaflet map — extracted from neighborhood_log.html */
(function () {
  var mapEl = document.getElementById('map');
  if (!mapEl) return;

  var map = L.map('map', { center: [45.7450, -122.6260], zoom: 14 });

  var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri', maxZoom: 20
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
    .bindPopup('<b>M&amp;H Subdivision (Salmon Creek Reserve)</b><br>72 lots &mdash; Under construction');

  var viersSubdivision = L.polygon([
    [45.7490, -122.6308], [45.7490, -122.6230],
    [45.7462, -122.6230], [45.7462, -122.6308]
  ], { color: '#ea580c', weight: 2, fillColor: '#ea580c', fillOpacity: 0.25 })
    .bindPopup('<b>Viers Subdivision (PUD)</b><br>84 lots &mdash; Approved');

  var millCreekEstates = L.polygon([
    [45.7477, -122.6350], [45.7477, -122.6320],
    [45.7460, -122.6320], [45.7460, -122.6350]
  ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.30 })
    .bindPopup('<b>Mill Creek Estates</b><br>43 lots &mdash; Pre-application');

  var subdivision174 = L.polygon([
    [45.7462, -122.6310], [45.7462, -122.6230],
    [45.7438, -122.6230], [45.7438, -122.6310]
  ], { color: '#7f1d1d', weight: 2, fillColor: '#7f1d1d', fillOpacity: 0.30 })
    .bindPopup('<b>174th Street Subdivision</b><br>103 lots &mdash; Pre-application<br><b>Exceeds 100-lot max for single-access roads.</b>');

  // Mt. Vista Logistics Warehouse — 16713-17009 NE 50th Ave (33 acres)
  var mtVistaWarehouse = L.polygon([
    [45.7445, -122.6210], [45.7445, -122.6160],
    [45.7410, -122.6160], [45.7410, -122.6210]
  ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.30 })
    .bindPopup('<b>Mt. Vista Logistics Center</b><br>583,318 SF warehouse on 33 acres (Panattoni)<br>108 dock doors, 160&ndash;240 heavy truck trips/day<br>All traffic routes through NE 50th Ave &amp; NE 179th St');

  var ne174th = L.polyline([
    [45.7477, -122.6400], [45.7477, -122.6200]
  ], { color: '#dc2626', weight: 5, opacity: 0.8 })
    .bindPopup('<b>NE 174th Street</b><br>Width: &lt;20 ft (required: 32&ndash;36 ft)<br>~3,065 projected daily trips');

  var ne50thClosure = L.polyline([
    [45.7510, -122.6270], [45.7420, -122.6270]
  ], { color: '#f97316', weight: 5, opacity: 0.7, dashArray: '10,8' })
    .bindPopup('<b>NE 50th Avenue &mdash; CLOSED</b><br>80-day closure starting March 9, 2026');

  var intIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#7c3aed;border-radius:50%;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>',
    iconSize: [18, 18], iconAnchor: [9, 9]
  });

  var int1 = L.marker([45.7477, -122.6270], { icon: intIcon })
    .bindPopup('<b>NE 50th Ave &amp; 174th St</b><br>Poor visibility, hilly terrain');
  var int2 = L.marker([45.7477, -122.6295], { icon: intIcon })
    .bindPopup('<b>NE 40th Ave &amp; 174th St</b><br>All ~3,065 daily trips flow through here');

  // Add all layers
  var allLayers = [
    originalNeighborhood, mhSubdivision, viersSubdivision,
    millCreekEstates, subdivision174, mtVistaWarehouse,
    ne174th, ne50thClosure, int1, int2
  ];
  allLayers.forEach(function (l) { l.addTo(map); });

  L.control.scale({ imperial: true, metric: false }).addTo(map);
})();
