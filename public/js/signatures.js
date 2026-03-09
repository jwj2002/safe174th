/* Signature form + signer list */
(function () {
  // Load count + signer list
  function loadSignatures() {
    fetch('/api/signatures').then(function (r) { return r.json(); }).then(function (d) {
      var countEl = document.getElementById('sig-count');
      if (countEl && d.count > 0) {
        countEl.innerHTML = '<strong>' + d.count + '</strong> neighbor' + (d.count !== 1 ? 's have' : ' has') + ' signed';
      }

      var listEl = document.getElementById('signer-list');
      if (listEl && d.signers && d.signers.length > 0) {
        listEl.innerHTML = d.signers.map(function (s) {
          return '<div style="padding: 6px 0; border-bottom: 1px solid var(--slate-100);">' +
            '<strong>' + escapeHtml(s.first_name) + '</strong> — ' + escapeHtml(s.street) +
            '</div>';
        }).join('');
      } else if (listEl) {
        listEl.innerHTML = '<p style="color: var(--slate-400);">Be the first to sign!</p>';
      }
    }).catch(function () {});
  }

  loadSignatures();

  // Form submission
  var form = document.getElementById('sign-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var result = document.getElementById('sign-result');
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing...';

    var payload = {
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      street: form.street.value,
      email: form.email.value || null,
      show_public: form.show_public.checked
    };

    fetch('/api/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (res.ok) {
          result.innerHTML = '<div class="form-success"><strong>Check your email!</strong> We sent a confirmation link to verify your signature. Your signature will count once you click the link.</div>';
          form.style.display = 'none';
        } else {
          result.innerHTML = '<div class="form-error">' + escapeHtml(res.data.error) + '</div>';
          btn.disabled = false;
          btn.textContent = 'Sign the Petition';
        }
      }).catch(function () {
        result.innerHTML = '<div class="form-error">Network error. Please try again.</div>';
        btn.disabled = false;
        btn.textContent = 'Sign the Petition';
      });
  });

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
