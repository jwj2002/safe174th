/* Admin dashboard */
var token = '';

function authenticate() {
  token = document.getElementById('admin-token').value;
  if (!token) return;
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('admin-content').style.display = 'block';
  loadAll();
}

function authHeaders() {
  return { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
}

function loadAll() {
  loadSignatures();
  loadFeedback('pending');
  loadFeedback('approved');
}

function loadSignatures() {
  fetch('/api/admin/signatures', { headers: authHeaders() })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById('total-sigs').textContent = d.count || 0;
      var table = '<table class="dev-table"><thead><tr><th>Name</th><th>Street</th><th>Email</th><th>Date</th></tr></thead><tbody>';
      (d.signatures || []).forEach(function (s) {
        table += '<tr><td>' + esc(s.first_name) + ' ' + esc(s.last_name) + '</td><td>' +
          esc(s.street) + '</td><td>' + esc(s.email || '') + '</td><td>' +
          new Date(s.created_at).toLocaleDateString() + '</td></tr>';
      });
      table += '</tbody></table>';
      document.getElementById('sig-table').innerHTML = table;

      document.getElementById('export-csv').href = '/api/admin/signatures?format=csv&token=' + token;
      document.getElementById('export-csv').onclick = function (e) {
        e.preventDefault();
        fetch('/api/admin/signatures?format=csv', { headers: authHeaders() })
          .then(function (r) { return r.blob(); })
          .then(function (blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = 'signatures.csv'; a.click();
            URL.revokeObjectURL(url);
          });
      };
    });
}

function loadFeedback(status) {
  fetch('/api/admin/feedback?status=' + status, { headers: authHeaders() })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var containerId = status === 'pending' ? 'pending-feed' : 'approved-feed';
      var container = document.getElementById(containerId);

      if (status === 'pending') {
        document.getElementById('pending-count').textContent = (d.feedback || []).length;
      }

      if (!d.feedback || d.feedback.length === 0) {
        container.innerHTML = '<p style="color: var(--slate-400); font-size: 14px;">None</p>';
        return;
      }

      container.innerHTML = d.feedback.map(function (f) {
        var actions = status === 'pending'
          ? '<div style="margin-top: 10px;">' +
            '<button onclick="moderate(' + f.id + ', \'approve\')" class="cta-btn cta-btn-secondary" style="padding: 6px 14px; font-size: 12px; margin-right: 8px;">Approve</button>' +
            '<button onclick="moderate(' + f.id + ', \'reject\')" style="padding: 6px 14px; font-size: 12px; background: var(--slate-200); color: var(--slate-700); border: none; border-radius: 6px; cursor: pointer;">Reject</button>' +
            '</div>'
          : '';
        return '<div class="feedback-card">' +
          '<div class="feedback-meta">' + esc(f.name || 'Anonymous') + ' — ' + esc(f.street || 'No address') +
          ' — ' + new Date(f.created_at).toLocaleDateString() + '</div>' +
          '<div class="feedback-content">' + esc(f.content) + '</div>' +
          actions + '</div>';
      }).join('');
    });
}

function moderate(id, action) {
  fetch('/api/admin/feedback', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ id: id, action: action })
  }).then(function () { loadAll(); });
}

function esc(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
