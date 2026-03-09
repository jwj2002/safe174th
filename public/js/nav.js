/* Shared navigation — injected into all pages */
(function () {
  var path = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');

  var pages = [
    { href: '/', label: 'Home' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/facts', label: 'Facts' },
    { href: '/sign', label: 'Sign' },
    { href: '/take-action', label: 'Take Action' }
  ];

  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  var inner = document.createElement('div');
  inner.className = 'nav-inner';

  // Brand
  var brand = document.createElement('a');
  brand.href = '/';
  brand.className = 'nav-brand';
  brand.textContent = 'safe174th.com';
  inner.appendChild(brand);

  // Toggle button (mobile)
  var toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Menu');
  toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
  inner.appendChild(toggle);

  // Links
  var ul = document.createElement('ul');
  ul.className = 'nav-links';
  pages.forEach(function (p) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = p.href;
    a.textContent = p.label;
    if (path === p.href || (p.href !== '/' && path.indexOf(p.href) === 0)) {
      a.className = 'active';
    }
    li.appendChild(a);
    ul.appendChild(li);
  });
  inner.appendChild(ul);

  nav.appendChild(inner);

  // Mobile toggle
  toggle.addEventListener('click', function () {
    ul.classList.toggle('open');
  });
})();
