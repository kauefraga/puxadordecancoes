(() => {
  const searchInput = document.getElementById('pesquisa');
  const songList = document.getElementById('lista-cancoes');
  const noResults = document.getElementById('sem-resultados');
  const noResultsTerm = document.getElementById('termo-sem-resultado');
  const songCounter = document.getElementById('contador-cancoes');
  const tagFilterContainer = document.getElementById('tags-filtro');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-titulo');
  const modalLyrics = document.getElementById('modal-letra');
  const modalTagsEl = document.getElementById('modal-tags');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = modal.querySelector('.modal-backdrop');

  let activeTag = null;

  // ── Tag slug transformer ─────────────────────────────────────────────────
  function slugify(tag) {
    return tag
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  // ── Collect all unique tags ──────────────────────────────────────────────
  const allTags = [...new Set(songs.flatMap((s) => s.tags))].sort();

  function renderTags() {
    tagFilterContainer.innerHTML = '';

    const btnAll = document.createElement('button');
    btnAll.className = 'tag-btn' + (activeTag === null ? ' ativa' : '');
    btnAll.textContent = 'Todas';
    btnAll.dataset.slug = 'todas';
    btnAll.addEventListener('click', () => {
      activeTag = null;
      searchInput.value = '';
      renderSongs();
      syncActiveTag();
    });
    tagFilterContainer.appendChild(btnAll);

    allTags.forEach((tag) => {
      const btn = document.createElement('button');
      btn.className = 'tag-btn' + (activeTag === tag ? ' ativa' : '');
      btn.textContent = tag;
      btn.dataset.slug = slugify(tag);
      btn.addEventListener('click', () => {
        activeTag = activeTag === tag ? null : tag;
        searchInput.value = '';
        renderSongs();
        syncActiveTag();
      });
      tagFilterContainer.appendChild(btn);
    });
  }

  function syncActiveTag() {
    tagFilterContainer.querySelectorAll('.tag-btn').forEach((btn, i) => {
      if (i === 0) btn.classList.toggle('ativa', activeTag === null);
      else btn.classList.toggle('ativa', btn.textContent === activeTag);
    });
  }

  // ── Render songs ─────────────────────────────────────────────────────────
  function renderSongs(term = '') {
    const query = term.trim().toLowerCase();

    let filtered = songs;
    if (activeTag)
      filtered = filtered.filter((s) => s.tags.includes(activeTag));
    if (query) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.lyrics.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    songList.innerHTML = '';

    if (filtered.length === 0) {
      noResults.classList.remove('hidden');
      noResultsTerm.textContent = query || activeTag || '';
      songCounter.textContent = '0 canções';
      return;
    }

    noResults.classList.add('hidden');
    songCounter.textContent = `${filtered.length} canç${filtered.length !== 1 ? 'ões' : 'ão'}`;

    filtered.forEach((song, index) => {
      const card = document.createElement('article');
      card.className = 'cancao-card';
      card.style.animationDelay = `${index * 40}ms`;

      const firstStanza = song.lyrics.split('\n\n')[0];
      const previewLines = firstStanza.split('\n').slice(0, 4).join('\n');
      const hasMore = song.lyrics.split('\n').length > 4;

      card.innerHTML = `
        <div class="card-numero">${String(song.id).padStart(2, '0')}</div>
        <div class="card-body">
          <h3 class="card-titulo">${song.title}</h3>
          <div class="card-tags">${song.tags.map((t) => `<span class="tag" data-slug="${slugify(t)}">${t}</span>`).join('')}</div>
          <pre class="card-preview">${previewLines}${hasMore ? '\n<span class="reticencias">...</span>' : ''}</pre>
        </div>
        <button class="card-btn-ver" aria-label="Ver letra completa de ${song.title}">VER LETRA</button>
      `;

      card
        .querySelector('.card-btn-ver')
        .addEventListener('click', () => openModal(song));
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.card-btn-ver')) openModal(song);
      });

      songList.appendChild(card);
    });
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  function openModal(song) {
    modalTitle.textContent = song.title;
    modalLyrics.textContent = song.lyrics;
    modalTagsEl.innerHTML = song.tags
      .map((t) => `<span class="tag" data-slug="${slugify(t)}">${t}</span>`)
      .join('');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  // ── Search ───────────────────────────────────────────────────────────────
  searchInput.addEventListener('input', () => {
    activeTag = null;
    syncActiveTag();
    renderSongs(searchInput.value);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('cancoes').scrollIntoView({ behavior: 'smooth' });
      renderSongs(searchInput.value);
    }
  });

  // ── Ctrl + K keybind ─────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      if (document.activeElement === searchInput) {
        searchInput.blur();
      } else {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // ── "Ver canções" button ─────────────────────────────────────────────────
  document.getElementById('btn-ver-cancoes').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('cancoes').scrollIntoView({ behavior: 'smooth' });
  });

  // ── Init ─────────────────────────────────────────────────────────────────
  renderTags();
  renderSongs();
})();
