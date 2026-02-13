// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const isOpen = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // Tab switching
  document.querySelectorAll('.tabs').forEach(tabBar => {
    tabBar.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => {
        // Deactivate all tabs & panels in this group
        tabBar.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        const section = tabBar.closest('.container') || tabBar.parentElement;
        section.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        // Activate clicked tab & matching panel
        btn.classList.add('active');
        const panel = section.querySelector('#tab-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  });
});
