const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.desktop-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  navigation?.classList.toggle('open', !isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open menu');
    navigation.classList.remove('open');
  });
});

const revealTargets = document.querySelectorAll(
  '.workflow-inner, .section-head, .case-study, .about-inner, .contact > *'
);
revealTargets.forEach((element) => element.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((element) => observer.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('visible'));
}

async function updateRepositoryDetails(element) {
  const [owner, repository] = element.dataset.repo.split('/');
  try {
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error('GitHub repository details are unavailable.');

    const repo = await response.json();
    const language = repo.language || 'No language specified';
    const stars = new Intl.NumberFormat().format(repo.stargazers_count);
    const updated = new Date(repo.updated_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    element.textContent = `${language} · ${stars} ${repo.stargazers_count === 1 ? 'star' : 'stars'} · Updated ${updated} on GitHub`;
    element.classList.add('is-live');
  } catch {
    element.textContent = 'Live GitHub details are temporarily unavailable.';
    element.classList.add('is-unavailable');
  }
}

document.querySelectorAll('[data-repo]').forEach(updateRepositoryDetails);
