/* Two Leaflet maps — positions based on CRWWD sewer project maps */
(function () {

  // Shared tile layers
  function addTiles(map) {
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri', maxZoom: 20
    }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB', maxZoom: 20, pane: 'overlayPane'
    }).addTo(map);
  }

  // Shared icons
  var losF = L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;background:#dc2626;border-radius:50%;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.5);color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:22px;">F</div>',
    iconSize: [22, 22], iconAnchor: [11, 11]
  });
  var losE = L.divIcon({
    className: '',
    html: '<div style="width:20px;height:20px;background:#ea580c;border-radius:50%;border:3px solid #fff;box-shadow:0 0 5px rgba(0,0,0,0.4);color:#fff;font-size:10px;font-weight:700;text-align:center;line-height:20px;">E</div>',
    iconSize: [20, 20], iconAnchor: [10, 10]
  });
  var vcIcon = L.divIcon({
    className: '',
    html: '<div style="width:20px;height:20px;background:#ea580c;border-radius:50%;border:3px solid #fff;box-shadow:0 0 5px rgba(0,0,0,0.4);color:#fff;font-size:10px;font-weight:700;text-align:center;line-height:20px;">!</div>',
    iconSize: [20, 20], iconAnchor: [10, 10]
  });
  var problemIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#7c3aed;border-radius:50%;border:3px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.4);color:#fff;font-size:10px;font-weight:700;text-align:center;line-height:18px;">!</div>',
    iconSize: [18, 18], iconAnchor: [9, 9]
  });

  // ========================================
  // MAP 1: CORRIDOR OVERVIEW (179th)
  // ========================================
  var corridorEl = document.getElementById('map-corridor');
  if (corridorEl) {
    var corridor = L.map('map-corridor', { center: [45.7490, -122.6300], zoom: 13 });
    addTiles(corridor);

    // --- Developments north of 179th ---

    // Ramble Creek Phase 5 — large, north of 179th
    L.polygon([
      [45.7570, -122.6370], [45.7570, -122.6280],
      [45.7520, -122.6280], [45.7520, -122.6370]
    ], { color: '#2563eb', weight: 2, fillColor: '#2563eb', fillOpacity: 0.22 })
      .bindPopup('<b>Ramble Creek Subdivision Phase 5</b><br>Large residential &mdash; North of NE 179th St').addTo(corridor);

    // Ramble Creek Phase 8 — north of 179th, near 50th
    L.polygon([
      [45.7565, -122.6270], [45.7565, -122.6240],
      [45.7520, -122.6240], [45.7520, -122.6270]
    ], { color: '#3b82f6', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.22 })
      .bindPopup('<b>Ramble Creek Phase 8</b><br>Near NE 50th Ave').addTo(corridor);

    // Mill Creek Terrace — small, northwest
    L.polygon([
      [45.7550, -122.6430], [45.7550, -122.6390],
      [45.7525, -122.6390], [45.7525, -122.6430]
    ], { color: '#8b5cf6', weight: 2, fillColor: '#8b5cf6', fillOpacity: 0.22 })
      .bindPopup('<b>Mill Creek Terrace Subdivision</b>').addTo(corridor);

    // --- Developments between 179th & 174th ---

    // Kozy Manor Estates — far west, south of 179th
    L.polygon([
      [45.7508, -122.6425], [45.7508, -122.6385],
      [45.7475, -122.6385], [45.7475, -122.6425]
    ], { color: '#0d9488', weight: 2, fillColor: '#0d9488', fillOpacity: 0.25 })
      .bindPopup('<b>Kozy Manor Estates</b><br>TIS: Feb 2025<br>South of 179th, near NE 34th Ave').addTo(corridor);

    // Ramble Creek Phase 7 — center, south of 179th
    L.polygon([
      [45.7498, -122.6350], [45.7498, -122.6280],
      [45.7475, -122.6280], [45.7475, -122.6350]
    ], { color: '#2563eb', weight: 2, fillColor: '#2563eb', fillOpacity: 0.20 })
      .bindPopup('<b>Ramble Creek Phase 7</b><br>Between NE 40th &amp; 47th Ave').addTo(corridor);

    // Mill Creek Meadows — east, south of 179th
    L.polygon([
      [45.7490, -122.6280], [45.7490, -122.6250],
      [45.7470, -122.6250], [45.7470, -122.6280]
    ], { color: '#7c3aed', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.22 })
      .bindPopup('<b>Mill Creek Meadows</b><br>Near NE 47th&ndash;50th Ave').addTo(corridor);

    // --- On/South of 174th ---

    // 174th St Sub
    L.polygon([
      [45.7470, -122.6355], [45.7470, -122.6280],
      [45.7445, -122.6280], [45.7445, -122.6355]
    ], { color: '#7f1d1d', weight: 2, fillColor: '#7f1d1d', fillOpacity: 0.25 })
      .bindPopup('<b>174th Street Subdivision</b><br>103 lots &mdash; Pre-application').addTo(corridor);

    // Viers PUD
    L.polygon([
      [45.7470, -122.6275], [45.7470, -122.6245],
      [45.7445, -122.6245], [45.7445, -122.6275]
    ], { color: '#ea580c', weight: 2, fillColor: '#ea580c', fillOpacity: 0.22 })
      .bindPopup('<b>Viers PUD</b><br>84 lots &mdash; Approved').addTo(corridor);

    // Mill Creek Estates
    L.polygon([
      [45.7468, -122.6420], [45.7468, -122.6380],
      [45.7445, -122.6380], [45.7445, -122.6420]
    ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.22 })
      .bindPopup('<b>Mill Creek Estates</b><br>43 lots &mdash; Pre-application').addTo(corridor);

    // Salmon Creek Ridge / M+H
    L.polygon([
      [45.7445, -122.6425], [45.7445, -122.6370],
      [45.7418, -122.6370], [45.7418, -122.6425]
    ], { color: '#ca8a04', weight: 2.5, fillColor: '#eab308', fillOpacity: 0.25 })
      .bindPopup('<b>Salmon Creek Ridge (M+H)</b><br>72 lots &mdash; Under construction').addTo(corridor);

    // Mt. Vista Logistics — 100% south of 174th
    L.polygon([
      [45.7468, -122.6245], [45.7468, -122.6170],
      [45.7415, -122.6170], [45.7415, -122.6245]
    ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.18 })
      .bindPopup('<b>Mt. Vista Logistics Center</b><br>583,318 SF warehouse (Panattoni)<br>160&ndash;240 heavy truck trips/day<br>TIS: Jan 2023').addTo(corridor);

    // --- Roads ---
    L.polyline([
      [45.7468, -122.6430], [45.7468, -122.6170]
    ], { color: '#dc2626', weight: 4, opacity: 0.7 })
      .bindPopup('<b>NE 174th Street</b><br>&lt;20 ft wide &mdash; no sidewalks, shoulders, or lighting').addTo(corridor);

    L.polyline([
      [45.7520, -122.6250], [45.7410, -122.6250]
    ], { color: '#f97316', weight: 4, opacity: 0.6, dashArray: '10,8' })
      .bindPopup('<b>NE 50th Ave &mdash; CLOSED</b><br>80-day closure (Mar 2026)').addTo(corridor);

    // --- Failing intersections ---
    // 179th / Delfel — FAILING NOW
    L.marker([45.7505, -122.6550], { icon: losF })
      .bindPopup('<b>NE 179th / Delfel Rd</b><br>LOS F &mdash; FAILING NOW (existing 2025)<br>V/C 1.05&ndash;1.33 on adjacent segments').addTo(corridor);

    // I-5 / 179th — V/C > 1.0
    L.marker([45.7505, -122.6600], { icon: vcIcon })
      .bindPopup('<b>I-5 NB Ramps / NE 179th</b><br>V/C &gt;1.0 &mdash; over capacity by 2028').addTo(corridor);

    // 179th / 15th — V/C > 1.0
    L.marker([45.7505, -122.6470], { icon: vcIcon })
      .bindPopup('<b>NE 179th / NE 15th Ave</b><br>V/C &gt;1.0 &mdash; over capacity by 2028').addTo(corridor);

    // 179th / 50th — LOS F
    L.marker([45.7505, -122.6250], { icon: losF })
      .bindPopup('<b>NE 179th / NE 50th Ave</b><br>LOS F (2027&ndash;2028)<br>Fails even after planned upgrades').addTo(corridor);

    // 50th / 159th — LOS E
    L.marker([45.7380, -122.6250], { icon: losE })
      .bindPopup('<b>NE 50th Ave / NE 159th</b><br>LOS E &mdash; one more car pushes to failure').addTo(corridor);

    L.control.scale({ imperial: true, metric: false }).addTo(corridor);
  }

  // ========================================
  // MAP 2: 174TH STREET DETAIL
  // ========================================
  var detailEl = document.getElementById('map-174th');
  if (detailEl) {
    var detail = L.map('map-174th', { center: [45.7475, -122.6320], zoom: 15 });
    addTiles(detail);

    // --- Between 179th and 174th ---

    // Kozy Manor Estates — far west
    L.polygon([
      [45.7508, -122.6425], [45.7508, -122.6385],
      [45.7475, -122.6385], [45.7475, -122.6425]
    ], { color: '#0d9488', weight: 2, fillColor: '#0d9488', fillOpacity: 0.25 })
      .bindPopup('<b>Kozy Manor Estates Subdivision</b><br>TIS: Feb 2025<br>South of NE 179th, near NE 34th Ave').addTo(detail);

    // Ramble Creek Phase 7 — center
    L.polygon([
      [45.7498, -122.6350], [45.7498, -122.6280],
      [45.7475, -122.6280], [45.7475, -122.6350]
    ], { color: '#2563eb', weight: 2, fillColor: '#2563eb', fillOpacity: 0.20 })
      .bindPopup('<b>Ramble Creek Subdivision Phase 7</b><br>Between NE 40th Ave &amp; NE 47th Ave').addTo(detail);

    // Mill Creek Meadows — east
    L.polygon([
      [45.7490, -122.6280], [45.7490, -122.6250],
      [45.7470, -122.6250], [45.7470, -122.6280]
    ], { color: '#7c3aed', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.22 })
      .bindPopup('<b>Mill Creek Meadows Subdivision</b><br>Near NE 47th&ndash;50th Ave').addTo(detail);

    // --- On / South of 174th ---

    // Mill Creek Estates — far west
    L.polygon([
      [45.7468, -122.6420], [45.7468, -122.6380],
      [45.7445, -122.6380], [45.7445, -122.6420]
    ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.28 })
      .bindPopup('<b>Mill Creek Estates</b><br>43 lots &mdash; Pre-application<br>Zoning: R1-10').addTo(detail);

    // Salmon Creek Ridge / M+H — below Mill Creek Estates
    L.polygon([
      [45.7445, -122.6425], [45.7445, -122.6370],
      [45.7418, -122.6370], [45.7418, -122.6425]
    ], { color: '#ca8a04', weight: 2.5, fillColor: '#eab308', fillOpacity: 0.28 })
      .bindPopup('<b>Salmon Creek Ridge (M+H)</b><br>72 lots &mdash; Under construction<br>Zoning: R1-10').addTo(detail);

    // 174th Street Subdivision — center
    L.polygon([
      [45.7470, -122.6355], [45.7470, -122.6280],
      [45.7445, -122.6280], [45.7445, -122.6355]
    ], { color: '#7f1d1d', weight: 2, fillColor: '#7f1d1d', fillOpacity: 0.28 })
      .bindPopup('<b>174th Street Subdivision</b><br>103 lots &mdash; Pre-application<br><b>Exceeds 100-lot max for single-access roads</b>').addTo(detail);

    // Viers PUD — east
    L.polygon([
      [45.7470, -122.6275], [45.7470, -122.6245],
      [45.7445, -122.6245], [45.7445, -122.6275]
    ], { color: '#ea580c', weight: 2, fillColor: '#ea580c', fillOpacity: 0.25 })
      .bindPopup('<b>Viers Subdivision (PUD)</b><br>84 lots &mdash; Approved<br>Zoning: R1-20').addTo(detail);

    // Mt. Vista Logistics — south of 174th, east of 50th
    L.polygon([
      [45.7468, -122.6245], [45.7468, -122.6170],
      [45.7415, -122.6170], [45.7415, -122.6245]
    ], { color: '#dc2626', weight: 2, fillColor: '#dc2626', fillOpacity: 0.20 })
      .bindPopup('<b>Mt. Vista Logistics Center</b><br>583,318 SF warehouse on 33 acres (Panattoni)<br>108 dock doors, 160&ndash;240 heavy truck trips/day<br>All traffic via NE 50th Ave &amp; NE 179th St').addTo(detail);

    // --- Roads ---
    L.polyline([
      [45.7468, -122.6430], [45.7468, -122.6170]
    ], { color: '#dc2626', weight: 5, opacity: 0.8 })
      .bindPopup('<b>NE 174th Street</b><br>Width: &lt;20 ft (required: 32&ndash;36 ft)<br>No sidewalks, shoulders, bike lanes, or lighting').addTo(detail);

    L.polyline([
      [45.7520, -122.6250], [45.7410, -122.6250]
    ], { color: '#f97316', weight: 5, opacity: 0.7, dashArray: '10,8' })
      .bindPopup('<b>NE 50th Avenue &mdash; CLOSED</b><br>80-day closure starting March 9, 2026').addTo(detail);

    // --- Intersections ---
    L.marker([45.7505, -122.6250], { icon: losF })
      .bindPopup('<b>NE 179th St / NE 50th Ave</b><br>LOS F (2027&ndash;2028)<br>Fails even after planned upgrades').addTo(detail);

    L.marker([45.7468, -122.6250], { icon: problemIcon })
      .bindPopup('<b>NE 50th Ave &amp; 174th St</b><br>Poor visibility, hilly terrain<br>V/C 1.13 on 50th Ave segment').addTo(detail);

    L.marker([45.7468, -122.6350], { icon: problemIcon })
      .bindPopup('<b>NE 40th Ave &amp; 174th St</b><br>All ~3,065 daily trips funnel through here').addTo(detail);

    L.control.scale({ imperial: true, metric: false }).addTo(detail);
  }

})();
