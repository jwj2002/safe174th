/* Community feedback form + feed */
(function () {
  function loadFeedback() {
    fetch('/api/feedback').then(function (r) { return r.json(); }).then(function (d) {
      var feed = document.getElementById('feedback-feed');
      if (!feed) return;

      if (!d.feedback || d.feedback.length === 0) {
        feed.innerHTML = '<p style="color: var(--slate-400); font-size: 14px;">No stories yet. Be the first to share!</p>';
        return;
      }

      feed.innerHTML = d.feedback.map(function (f) {
        var date = new Date(f.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        var name = f.name ? escapeHtml(f.name) : 'Anonymous neighbor';
        return '<div class="feedback-card">' +
          '<div class="feedback-meta">' + name + ' — ' + date + '</div>' +
          '<div class="feedback-content">' + escapeHtml(f.content) + '</div>' +
          '</div>';
      }).join('');
    }).catch(function () {
      var feed = document.getElementById('feedback-feed');
      if (feed) feed.innerHTML = '<p style="color: var(--slate-400);">Unable to load stories.</p>';
    });
  }

  loadFeedback();

  var form = document.getElementById('feedback-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var result = document.getElementById('feedback-result');
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    var payload = {
      name: form.name.value || null,
      street: form.street.value || null,
      content: form.content.value
    };

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (res.ok) {
          result.innerHTML = '<div class="form-success">Thank you! Your story has been submitted and will appear after review.</div>';
          form.style.display = 'none';
        } else {
          result.innerHTML = '<div class="form-error">' + escapeHtml(res.data.error) + '</div>';
          btn.disabled = false;
          btn.textContent = 'Submit Your Story';
        }
      }).catch(function () {
        result.innerHTML = '<div class="form-error">Network error. Please try again.</div>';
        btn.disabled = false;
        btn.textContent = 'Submit Your Story';
      });
  });

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
