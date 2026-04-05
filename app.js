(() => {
  const inputPesquisa = document.getElementById('pesquisa');
  const listaCancoes = document.getElementById('lista-cancoes');
  const semResultados = document.getElementById('sem-resultados');
  const termoSemResultado = document.getElementById('termo-sem-resultado');
  const contadorCancoes = document.getElementById('contador-cancoes');
  const tagsFiltroContainer = document.getElementById('tags-filtro');
  const modal = document.getElementById('modal');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalLetra = document.getElementById('modal-letra');
  const modalTagsEl = document.getElementById('modal-tags');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = modal.querySelector('.modal-backdrop');

  let tagAtiva = null;

  // ── Collect all unique tags ──────────────────────────────────────────────
  const todasTags = [...new Set(cancoes.flatMap((c) => c.tags))].sort();

  function renderTags() {
    tagsFiltroContainer.innerHTML = '';
    const btnTodas = document.createElement('button');
    btnTodas.className = 'tag-btn' + (tagAtiva === null ? ' ativa' : '');
    btnTodas.textContent = 'Todas';
    btnTodas.addEventListener('click', () => {
      tagAtiva = null;
      inputPesquisa.value = '';
      renderCancoes();
      setTagsAtivas();
    });
    tagsFiltroContainer.appendChild(btnTodas);

    todasTags.forEach((tag) => {
      const btn = document.createElement('button');
      btn.className = 'tag-btn' + (tagAtiva === tag ? ' ativa' : '');
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        tagAtiva = tagAtiva === tag ? null : tag;
        inputPesquisa.value = '';
        renderCancoes();
        setTagsAtivas();
      });
      tagsFiltroContainer.appendChild(btn);
    });
  }

  function setTagsAtivas() {
    tagsFiltroContainer.querySelectorAll('.tag-btn').forEach((btn, i) => {
      if (i === 0) btn.classList.toggle('ativa', tagAtiva === null);
      else btn.classList.toggle('ativa', btn.textContent === tagAtiva);
    });
  }

  // ── Render songs ─────────────────────────────────────────────────────────
  function renderCancoes(termo = '') {
    const termoBusca = termo.trim().toLowerCase();

    let filtradas = cancoes;
    if (tagAtiva)
      filtradas = filtradas.filter((c) => c.tags.includes(tagAtiva));
    if (termoBusca) {
      filtradas = filtradas.filter(
        (c) =>
          c.title.toLowerCase().includes(termoBusca) ||
          c.lyrics.toLowerCase().includes(termoBusca) ||
          c.tags.some((t) => t.toLowerCase().includes(termoBusca)),
      );
    }

    listaCancoes.innerHTML = '';

    if (filtradas.length === 0) {
      semResultados.classList.remove('hidden');
      termoSemResultado.textContent = termoBusca || tagAtiva || '';
      contadorCancoes.textContent = '0 canções';
      return;
    }

    semResultados.classList.add('hidden');
    contadorCancoes.textContent = `${filtradas.length} canç${filtradas.length !== 1 ? 'ões' : 'ão'}`;

    filtradas.forEach((cancao, index) => {
      const card = document.createElement('article');
      card.className = 'cancao-card';
      card.style.animationDelay = `${index * 40}ms`;

      const primeiraEstrofe = cancao.lyrics.split('\n\n')[0];
      const linhas = primeiraEstrofe.split('\n').slice(0, 4).join('\n');
      const temMais = cancao.lyrics.split('\n').length > 4;

      card.innerHTML = `
        <div class="card-numero">${String(cancao.id).padStart(2, '0')}</div>
        <div class="card-body">
          <h3 class="card-titulo">${cancao.title}</h3>
          <div class="card-tags">${cancao.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
          <pre class="card-preview">${linhas}${temMais ? '\n<span class="reticencias">...</span>' : ''}</pre>
        </div>
        <button class="card-btn-ver" aria-label="Ver letra completa de ${cancao.title}">VER LETRA</button>
      `;

      card
        .querySelector('.card-btn-ver')
        .addEventListener('click', () => abrirModal(cancao));
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.card-btn-ver')) abrirModal(cancao);
      });

      listaCancoes.appendChild(card);
    });
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  function abrirModal(cancao) {
    modalTitulo.textContent = cancao.title;
    modalLetra.textContent = cancao.lyrics;
    modalTagsEl.innerHTML = cancao.tags
      .map((t) => `<span class="tag">${t}</span>`)
      .join('');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function fecharModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', fecharModal);
  modalBackdrop.addEventListener('click', fecharModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden'))
      fecharModal();
  });

  // ── Search ───────────────────────────────────────────────────────────────
  let searchFocused = false;

  inputPesquisa.addEventListener('input', () => {
    tagAtiva = null;
    setTagsAtivas();
    renderCancoes(inputPesquisa.value);
  });

  inputPesquisa.addEventListener('focus', () => {
    searchFocused = true;
  });
  inputPesquisa.addEventListener('blur', () => {
    searchFocused = false;
  });

  inputPesquisa.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const secao = document.getElementById('cancoes');
      secao.scrollIntoView({ behavior: 'smooth' });
      renderCancoes(inputPesquisa.value);
    }
  });

  // ── Ctrl + K keybind ─────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      if (document.activeElement === inputPesquisa) {
        inputPesquisa.blur();
      } else {
        inputPesquisa.focus();
        inputPesquisa.select();
      }
    }
  });

  // ── "Ver canções" button ──────────────────────────────────────────────────
  document.getElementById('btn-ver-cancoes').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('cancoes').scrollIntoView({ behavior: 'smooth' });
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  renderTags();
  renderCancoes();
})();
