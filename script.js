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
  '.workflow-inner, .skills-heading, .skill-card, .section-head, .case-study, .about-inner, .contact > *'
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
  const [owner, repository] = (element.dataset.repo || '').split('/');
  const repositoryUrl = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
  const showFallback = () => {
    const label = document.createElement('span');
    label.textContent = `${repository || 'Repository'} details unavailable · `;
    const link = document.createElement('a');
    link.href = repositoryUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'View on GitHub';
    element.replaceChildren(label, link);
    element.classList.add('is-unavailable');
  };

  if (!owner || !repository || !('AbortController' in window)) {
    showFallback();
    return;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal
    });
    if (!response.ok) throw new Error('GitHub repository details are unavailable.');

    const repo = await response.json();
    const language = repo.language || 'No language specified';
    const stars = new Intl.NumberFormat().format(repo.stargazers_count);
    const updated = new Date(repo.updated_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    element.textContent = `${repository} · ${language} · ${stars} ${repo.stargazers_count === 1 ? 'star' : 'stars'} · Updated ${updated} · `;
    const link = document.createElement('a');
    link.href = repositoryUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'View on GitHub';
    element.append(link);
    element.classList.add('is-live');
  } catch {
    showFallback();
  } finally {
    window.clearTimeout(timeout);
  }
}

document.querySelectorAll('[data-repo]').forEach(updateRepositoryDetails);
