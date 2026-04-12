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
  loadBroadcastStats();
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

/* ---------- Broadcast Email ---------- */

function loadBroadcastStats() {
  fetch('/api/admin/broadcast', { headers: authHeaders() })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById('bcast-eligible').textContent = d.eligible_recipients || 0;
      document.getElementById('bcast-verified').textContent = d.verified_total || 0;
      document.getElementById('bcast-unsub').textContent = d.unsubscribed_total || 0;
      document.getElementById('bcast-batch').textContent = d.batch_limit || 45;
      renderBroadcastHistory(d.recent_broadcasts || []);
    });
}

function renderBroadcastHistory(recent) {
  var container = document.getElementById('bcast-recent');
  while (container.firstChild) container.removeChild(container.firstChild);

  if (recent.length === 0) {
    var p = document.createElement('p');
    p.style.color = 'var(--slate-400)';
    p.style.fontSize = '13px';
    p.textContent = 'No broadcasts sent yet.';
    container.appendChild(p);
    return;
  }

  var table = document.createElement('table');
  var thead = document.createElement('thead');
  var headRow = document.createElement('tr');
  ['Date', 'Subject', 'Sent', 'Failed', 'Batch'].forEach(function (label) {
    var th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  var tbody = document.createElement('tbody');
  recent.forEach(function (b) {
    var tr = document.createElement('tr');
    [
      new Date(b.sent_at).toLocaleString(),
      b.subject,
      String(b.sent_count),
      String(b.failed_count),
      String(b.recipient_count),
    ].forEach(function (val) {
      var td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function bcastLog(line, reset) {
  var el = document.getElementById('bcast-log');
  el.style.display = 'block';
  if (reset) el.textContent = '';
  el.textContent += line + '\n';
  el.scrollTop = el.scrollHeight;
}

function bcastRead() {
  return {
    subject: document.getElementById('bcast-subject').value.trim(),
    html: document.getElementById('bcast-html').value,
    testEmail: document.getElementById('bcast-test-email').value.trim(),
  };
}

function bcastValidate(input) {
  if (!input.subject) { alert('Subject is required.'); return false; }
  if (!input.html) { alert('HTML body is required.'); return false; }
  if (input.html.indexOf('{{UNSUBSCRIBE_URL}}') === -1) {
    alert('HTML must include {{UNSUBSCRIBE_URL}} placeholder for per-recipient unsubscribe link.');
    return false;
  }
  return true;
}

function broadcastDryRun() {
  var input = bcastRead();
  if (!bcastValidate(input)) return;

  bcastLog('Running dry run...', true);
  fetch('/api/admin/broadcast', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ subject: input.subject, html: input.html, mode: 'dry_run' }),
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.error) { bcastLog('ERROR: ' + d.error); return; }
      bcastLog('Would send to: ' + d.would_send_to + ' recipients');
      bcastLog('');
      bcastLog('Sample (first 5):');
      (d.sample || []).forEach(function (s) {
        bcastLog('  - ' + s.name + ' <' + s.email + '>');
      });
      bcastLog('');
      bcastLog('No emails sent. This was a dry run.');
    });
}

function broadcastTest() {
  var input = bcastRead();
  if (!bcastValidate(input)) return;
  if (!input.testEmail) { alert('Enter a Test Email address first.'); return; }

  bcastLog('Sending test to ' + input.testEmail + '...', true);
  fetch('/api/admin/broadcast', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      subject: input.subject,
      html: input.html,
      mode: 'test',
      test_email: input.testEmail,
    }),
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) {
        bcastLog('Test sent successfully to ' + d.sent_to);
        bcastLog('Check that address for the message.');
      } else {
        bcastLog('TEST FAILED: ' + (d.error || 'Unknown error'));
      }
    });
}

function broadcastSend() {
  var input = bcastRead();
  if (!bcastValidate(input)) return;

  var eligible = document.getElementById('bcast-eligible').textContent;
  var phrase = 'SEND ' + eligible;
  var typed = prompt(
    'This will send to ' + eligible + ' recipients and CANNOT be undone.\n\n' +
    'Type exactly this to confirm:\n\n' + phrase
  );
  if (typed !== phrase) {
    bcastLog('Send cancelled — confirmation phrase did not match.', true);
    return;
  }

  var btn = document.getElementById('bcast-send-btn');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  bcastLog('Starting broadcast to ' + eligible + ' recipients...', true);
  broadcastSendBatch(input, 0);
}

function broadcastSendBatch(input, offset) {
  fetch('/api/admin/broadcast', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      subject: input.subject,
      html: input.html,
      mode: 'send',
      confirm: true,
      offset: offset,
    }),
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.error) {
        bcastLog('ERROR: ' + d.error);
        broadcastSendDone();
        return;
      }
      bcastLog('Batch ' + offset + '–' + (offset + d.batch_size - 1) +
               ': sent=' + d.sent + ' failed=' + d.failed);
      if (d.errors && d.errors.length) {
        d.errors.forEach(function (e) {
          bcastLog('  FAIL ' + e.email + ': ' + e.error);
        });
      }
      if (d.done || d.next_offset === null) {
        bcastLog('');
        bcastLog('Broadcast complete. Total eligible: ' + d.total_eligible);
        broadcastSendDone();
        loadBroadcastStats();
      } else {
        broadcastSendBatch(input, d.next_offset);
      }
    })
    .catch(function (e) {
      bcastLog('NETWORK ERROR: ' + e);
      broadcastSendDone();
    });
}

function broadcastSendDone() {
  var btn = document.getElementById('bcast-send-btn');
  btn.disabled = false;
  btn.textContent = 'Send to All Recipients';
}
