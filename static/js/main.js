document.addEventListener('DOMContentLoaded', () => {
    // --- UTILITY ---
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatText(str) {
        const safe = escapeHtml(str || '');
        return safe.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
    }

    // --- DATI STATICI & STATO ---
    let postsData = [];
    let currentPage = 1;
    let isLoading = false;
    let hasMore = true;
    const feedContainer = document.getElementById('feed-container');
    const profilePostsContainer = document.getElementById('profile-posts-container');
    const loadingIndicator = document.getElementById('loading-indicator');

    // --- FUNZIONI DI CARICAMENTO ---
    async function fetchPosts(reset = false) {
        if (isLoading || (!hasMore && !reset)) return;
        isLoading = true;
        
        if (reset) {
            currentPage = 1;
            hasMore = true;
            postsData = [];
            if (feedContainer) feedContainer.innerHTML = '';
        }

        if (loadingIndicator) loadingIndicator.style.display = 'block';
        
        try {
            const response = await fetch(`/api/posts?page=${currentPage}&limit=10`);
            if (!response.ok) {
                hasMore = false;
                if (feedContainer) {
                    feedContainer.innerHTML = `
                        <div class="text-center p-4 text-secondary" style="grid-column: 1 / -1;">
                            > ERRORE_CARICAMENTO_POST
                        </div>
                    `;
                }
                return;
            }
            const data = await response.json();
            
            if (data.posts && data.posts.length > 0) {
                postsData = [...postsData, ...data.posts];
                renderFeed(data.posts, false);
                currentPage++;
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error('Errore nel caricamento dei post:', error);
        } finally {
            isLoading = false;
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    // --- MASONRY LAYOUT LOGIC ---
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const item = entry.target;
            const container = item.parentElement;
            if (container) {
                resizeGridItem(container, item);
            }
        }
    });

    function resizeGridItem(container, item) {
        if (!container || !item) return;
        const styles = window.getComputedStyle(container);
        const rowHeight = parseInt(styles.getPropertyValue('grid-auto-rows')) || 10;
        const rowGap = parseInt(styles.getPropertyValue('grid-row-gap')) || parseInt(styles.getPropertyValue('gap')) || 0;
        
        // Se è un post solo testo, vogliamo che sia esattamente la metà (span 12)
        // Se è un post con media, vogliamo che sia lo standard (span 24)
        // A meno che non sia espanso
        const isExpanded = item.querySelector('.post-caption.expanded');
        let rowSpan;

        if (isExpanded) {
            const content = item.firstElementChild;
            const contentHeight = content.getBoundingClientRect().height;
            const padding = parseInt(window.getComputedStyle(item).paddingTop) + parseInt(window.getComputedStyle(item).paddingBottom);
            rowSpan = Math.ceil((contentHeight + padding + rowGap) / (rowHeight + rowGap));
        } else {
            if (item.classList.contains('post-text-only')) {
                rowSpan = 13;
            } else {
                rowSpan = 26;
            }
        }
        
        const currentSpan = item.style.gridRowEnd;
        const newSpan = `span ${rowSpan}`;
        if (currentSpan !== newSpan) {
            item.style.gridRowEnd = newSpan;
        }
    }

    function resizeAllGridItems(container) {
        if (!container) return;
        const allItems = container.getElementsByClassName('terminal-card');
        for (let x = 0; x < allItems.length; x++) {
            resizeGridItem(container, allItems[x]);
        }
    }

    // --- FUNZIONI DI RENDERING ---
    function createPostElement(post) {
        const div = document.createElement('div');
        
        const hasMedia = !!post.Content;
        const hasText = post.Description && post.Description.trim().length > 0;
        
        let postTypeClass = 'post-standard';
        if (hasMedia && !hasText) {
            postTypeClass = 'post-media-only';
        } else if (!hasMedia && hasText) {
            postTypeClass = 'post-text-only';
        }
        
        div.className = `terminal-card ${postTypeClass}`;
        div.dataset.postId = String(post.id);
        div.dataset.description = post.Description || '';
        
        const dateStr = post.created_at || '';
        const displayScore = post.likes || 0;
        const userVote = post.user_vote || 0;
        const canEdit = !!post.can_edit;
        const canDelete = !!post.can_delete;
        
        const actionsHtml = (canEdit || canDelete) ? `<button class="btn-icon no-rotate post-actions" type="button" data-id="${post.id}" data-can-edit="${canEdit ? 1 : 0}" data-can-delete="${canDelete ? 1 : 0}" title="Azioni">⋮</button>` : '';

        let mediaHtml = '';
        if (hasMedia) {
            mediaHtml = `
                <div class="post-media-section">
                    <div class="media-container" onclick="openLightboxMedia('${post.Content}', 'image')">
                        <img src="${post.Content}" alt="Post media" onload="this.closest('.terminal-card').dispatchEvent(new Event('mediaLoaded'))">
                    </div>
                </div>
                <div class="post-divider"></div>
            `;
        }

        let captionHtml = '';
        if (hasText) {
            const textHtml = formatText(post.Description);
            const shouldTruncate = (post.Description || '').length > 220;
            captionHtml = `
                <div class="post-caption ${shouldTruncate ? '' : 'expanded'}" data-post-id="${post.id}">
                    <div class="post-caption-text">${textHtml}</div>
                    ${shouldTruncate ? `<button class="caption-toggle" type="button" data-post-id="${post.id}">…</button>` : ''}
                </div>
            `;
        }

        div.innerHTML = `
            <div class="post-layout">
                ${mediaHtml}
                <div class="post-content-section">
                    <div class="post-header">
                        <span class="user" style="cursor: pointer;" onclick="window.location.href='/${post.user}'">@${post.user}</span>
                        <div class="header-right">
                            <span class="time">[${dateStr}]</span>
                            <span class="score">PAPARELL: <span class="score-value" data-id="${post.id}">${displayScore}</span></span>
                            ${actionsHtml}
                        </div>
                    </div>
                    ${captionHtml}
                </div>
                <div class="post-side-controls">
                    <div class="controls-stack">
                        <button class="btn-score btn-plus ${userVote === 1 ? 'active' : ''}" data-id="${post.id}" data-vote="1">+</button>
                        <button class="btn-score btn-minus ${userVote === -1 ? 'active' : ''}" data-id="${post.id}" data-vote="-1">-</button>
                    </div>
                </div>
            </div>
        `;

        const caption = div.querySelector('.post-caption');
        if (caption) caption.dataset.raw = post.Description || '';

        // Osserva i cambiamenti di dimensione
        resizeObserver.observe(div);
        
        return div;
    }

    function renderFeed(posts, clear = true) {
        if (!feedContainer) return;
        if (clear) {
            feedContainer.innerHTML = '';
            // Reset scroll position if clearing
            feedContainer.scrollTop = 0;
        }
        
        posts.forEach(post => {
            const el = createPostElement(post);
            feedContainer.appendChild(el);
            // Il resize viene gestito dal ResizeObserver aggiunto in createPostElement
        });
    }

    // Scroll infinito
    if (feedContainer) {
        let scrollTimeout;
        feedContainer.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(() => {
                if (feedContainer.scrollTop + feedContainer.clientHeight >= feedContainer.scrollHeight - 200) {
                    if (!isLoading && hasMore) {
                        fetchPosts();
                    }
                }
                scrollTimeout = null;
            }, 100);
        });
    }

    window.addEventListener('resize', () => {
        resizeAllGridItems(feedContainer);
        resizeAllGridItems(profilePostsContainer);
    });
    resizeAllGridItems(profilePostsContainer);

    // --- FILTRI ---
    const btnMixed = document.getElementById('filter-mixed');
    const btnTextOnly = document.getElementById('filter-text');
    const btnMediaOnly = document.getElementById('filter-media');

    function setActiveFilter(activeBtn) {
        [btnMixed, btnTextOnly, btnMediaOnly].forEach(btn => { if(btn) btn.classList.remove('active'); });
        if(activeBtn) activeBtn.classList.add('active');
    }

    if (btnMixed) btnMixed.addEventListener('click', () => {
        setActiveFilter(btnMixed);
        renderFeed(postsData);
    });

    if (btnTextOnly) btnTextOnly.addEventListener('click', () => {
        setActiveFilter(btnTextOnly);
        const filtered = postsData.filter(p => !p.Content && p.Description);
        renderFeed(filtered);
    });

    if (btnMediaOnly) btnMediaOnly.addEventListener('click', () => {
        setActiveFilter(btnMediaOnly);
        const filtered = postsData.filter(p => p.Content && !p.Description);
        renderFeed(filtered);
    });

    // --- REFRESH ---
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            btnRefresh.style.transform = 'rotate(360deg)';
            fetchPosts(true).then(() => {
                setTimeout(() => { btnRefresh.style.transform = 'rotate(0deg)'; }, 500);
            });
        });
    }

    // --- LIGHTBOX ---
    const lightbox = document.getElementById('lightbox');
    const lightboxWrapper = lightbox ? lightbox.querySelector('.lightbox-content-wrapper') : null;
    const lightboxClose = document.querySelector('.lightbox-close');

    window.openLightboxMedia = function(src, type) {
        if (!lightboxWrapper) return;
        lightboxWrapper.innerHTML = '';
        const img = document.createElement('img');
        img.src = src;
        img.className = 'lightbox-media';
        lightboxWrapper.appendChild(img);
        lightbox.classList.add('active');
    };

    window.openLightboxText = function(text, user, time) {
        if (!lightboxWrapper) return;
        lightboxWrapper.innerHTML = `
            <div class="terminal-card post-standard" style="width: 100%; max-width: 600px; margin: auto;">
                <div class="post-content-section">
                    <div class="post-header">
                        <span class="user">@${user}</span>
                        <span class="time">[${time}]</span>
                    </div>
                    <div class="post-caption" style="max-height: none; -webkit-line-clamp: unset;">
                        ${formatText(text)}
                    </div>
                </div>
            </div>
        `;
        lightbox.classList.add('active');
    };

    if (lightboxClose) lightboxClose.onclick = () => lightbox.classList.remove('active');
    if (lightbox) lightbox.onclick = (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); };

    // --- SEARCH (Simulato) ---
    const btnSearch = document.getElementById('btn-search');
    if (btnSearch) {
        btnSearch.addEventListener('click', function handleSearch() {
            const container = this.parentElement;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'btn-control';
            input.style.width = '100%';
            input.style.height = '100%';
            input.placeholder = 'Cerca...';
            container.innerHTML = '';
            container.appendChild(input);
            input.focus();

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = input.value.toLowerCase();
                    if (feedContainer) {
                        const filtered = postsData.filter(p => 
                            (p.Description && p.Description.toLowerCase().includes(query)) || 
                            (p.user && p.user.toLowerCase().includes(query))
                        );
                        renderFeed(filtered);
                    } else if (profilePostsContainer) {
                        const cards = Array.from(profilePostsContainer.querySelectorAll('.terminal-card'));
                        cards.forEach((card) => {
                            const text = (card.dataset.description || '').toLowerCase();
                            const shouldShow = !query || text.includes(query);
                            card.style.display = shouldShow ? '' : 'none';
                        });
                        resizeAllGridItems(profilePostsContainer);
                    }
                    // Ripristina bottone
                    container.innerHTML = `<button class="btn-control" id="btn-search" style="width:100%; height:100%; border:1px solid var(--border-color);">CERCA</button>`;
                    document.getElementById('btn-search').addEventListener('click', handleSearch);
                }
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    if (!feedContainer && profilePostsContainer) {
                        const cards = Array.from(profilePostsContainer.querySelectorAll('.terminal-card'));
                        cards.forEach((card) => { card.style.display = ''; });
                        resizeAllGridItems(profilePostsContainer);
                    }
                    container.innerHTML = `<button class="btn-control" id="btn-search" style="width:100%; height:100%; border:1px solid var(--border-color);">CERCA</button>`;
                    document.getElementById('btn-search').addEventListener('click', handleSearch);
                }
            });
        });
    }

    // --- TEMA ---
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
        const themes = ['dark', 'light'];
        let currentThemeIdx = localStorage.getItem('theme-idx') ? parseInt(localStorage.getItem('theme-idx')) : 0;
        if (Number.isNaN(currentThemeIdx) || currentThemeIdx > 1) currentThemeIdx = 0;
        
        const updateThemeIcon = (idx) => {
            const theme = themes[idx];
            if (theme === 'dark') {
                btnTheme.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
            } else if (theme === 'light') {
                btnTheme.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
            }
        };

        // Inizializza tema salvato
        document.documentElement.setAttribute('data-theme', themes[currentThemeIdx]);
        updateThemeIcon(currentThemeIdx);

        btnTheme.addEventListener('click', () => {
            currentThemeIdx = (currentThemeIdx + 1) % themes.length;
            const theme = themes[currentThemeIdx];
            document.documentElement.setAttribute('data-theme', theme);
            updateThemeIcon(currentThemeIdx);
            localStorage.setItem('theme-idx', currentThemeIdx);
        });
    }

    // --- VOTING (Simulato via POST API) ---
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-score');
        if (!btn) return;

        const postId = btn.getAttribute('data-id');
        const vote = parseInt(btn.getAttribute('data-vote'));
        
        try {
            const response = await fetch(`/like/${postId}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote: vote })
            });
            
            if (response.ok) {
                const data = await response.json();
                const scoreEl = document.querySelector(`.score-value[data-id="${postId}"]`);
                if (scoreEl) {
                    scoreEl.textContent = data.new_score;
                }
                
                // Aggiorna stato bottoni per questo post
                const parent = btn.closest('.controls-stack, .media-only-buttons');
                const plusBtn = parent.querySelector('.btn-plus');
                const minusBtn = parent.querySelector('.btn-minus');
                
                plusBtn.classList.toggle('active', data.user_vote === 1);
                minusBtn.classList.toggle('active', data.user_vote === -1);

            } else if (response.status === 401) {
                window.location.href = '/access';
            } else {
                const errorData = await response.json();
                if (errorData.error) {
                    alert(errorData.error);
                }
            }
        } catch (error) {
            console.error('Errore nel voto:', error);
        }
    });

    function getCardDescription(card) {
        if (!card) return '';
        const raw = card.dataset.description || '';
        const trimmed = raw.trim();
        if (trimmed.startsWith('"') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                return JSON.parse(trimmed);
            } catch (e) {
                return raw;
            }
        }
        return raw;
    }

    async function refreshAfterPostChange() {
        if (feedContainer) {
            await fetchPosts(true);
            return;
        }
        window.location.reload();
    }

    function ensureEditModal() {
        let modalEl = document.getElementById('modalEditPost');
        if (!modalEl) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <div class="modal fade" id="modalEditPost" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-theme bg-panel">
                            <div class="modal-header border-bottom-theme">
                                <h5 class="modal-title terminal-header m-0">> MODIFICA_POST</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label for="edit-post-description" class="form-label text-secondary">> TESTO</label>
                                    <textarea class="form-control bg-dark text-white border-theme" id="edit-post-description" rows="5"></textarea>
                                </div>
                                <div class="text-end d-flex justify-content-end gap-2">
                                    <button type="button" class="btn btn-terminal" id="btn-edit-save">SALVA</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(wrapper.firstElementChild);
            modalEl = document.getElementById('modalEditPost');
        }

        const textarea = modalEl.querySelector('#edit-post-description');
        const saveBtn = modalEl.querySelector('#btn-edit-save');
        const modal = (window.bootstrap && window.bootstrap.Modal) ? new window.bootstrap.Modal(modalEl) : null;
        return { modalEl, textarea, saveBtn, modal };
    }

    let editingPostId = null;
    let isSavingEdit = false;

    document.addEventListener('click', async (e) => {
        const toggleBtn = e.target.closest('.caption-toggle');
        if (toggleBtn) {
            const caption = toggleBtn.closest('.post-caption');
            if (!caption) return;
            caption.classList.toggle('expanded');
            const card = caption.closest('.terminal-card');
            const container = card ? card.parentElement : null;
            if (container && card) resizeGridItem(container, card);
            return;
        }

        const actionsBtn = e.target.closest('.post-actions');
        if (!actionsBtn) return;

        const postId = actionsBtn.getAttribute('data-id');
        const canEdit = actionsBtn.getAttribute('data-can-edit') === '1';
        const canDelete = actionsBtn.getAttribute('data-can-delete') === '1';
        const card = actionsBtn.closest('.terminal-card');

        let choice = null;
        if (canEdit && canDelete) choice = (window.prompt('Scrivi "m" per modificare o "e" per eliminare') || '').trim().toLowerCase();
        else if (canEdit) choice = 'm';
        else if (canDelete) choice = 'e';

        if (choice === 'e' && canDelete) {
            if (!window.confirm('Eliminare questo post?')) return;
            try {
                const res = await fetch(`/delete-post/${postId}`, { method: 'POST' });
                if (res.status === 401) {
                    window.location.href = '/access';
                    return;
                }
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    if (data && data.error) alert(data.error);
                    return;
                }
                await refreshAfterPostChange();
            } catch (err) {
                console.error(err);
            }
            return;
        }

        if (choice === 'm' && canEdit) {
            const { textarea, saveBtn, modal } = ensureEditModal();
            editingPostId = postId;
            textarea.value = getCardDescription(card);
            if (modal) modal.show();
            else textarea.focus();

            if (!saveBtn.dataset.bound) {
                saveBtn.dataset.bound = '1';
                saveBtn.addEventListener('click', async () => {
                    if (!editingPostId || isSavingEdit) return;
                    isSavingEdit = true;
                    try {
                        const res = await fetch(`/edit-post/${editingPostId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ description: textarea.value })
                        });
                        if (res.status === 401) {
                            window.location.href = '/access';
                            return;
                        }
                        if (!res.ok) {
                            const data = await res.json().catch(() => ({}));
                            if (data && data.error) alert(data.error);
                            return;
                        }
                        if (modal) modal.hide();
                        await refreshAfterPostChange();
                    } catch (err) {
                        console.error(err);
                    } finally {
                        isSavingEdit = false;
                    }
                });
            }
        }
    });

    // --- TRENDS & NOTIFICHE ---
    let trendFilter = 'all';

    async function fetchTrends() {
        try {
            const response = await fetch(`/api/trends?filter=${trendFilter}`);
            const data = await response.json();
            const trendingList = document.getElementById('trending-list');
            if (!trendingList) return;

            if (data.trends && data.trends.length > 0) {
                trendingList.innerHTML = data.trends.map((post, idx) => `
                    <div class="trending-item p-2 border-bottom-theme" style="cursor:pointer;" onclick="window.location.href='/${post.user}'">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-secondary" style="font-size: 0.8rem;">#${idx + 1} @${post.user}</span>
                            <span class="badge-terminal">${post.likes} PAPARELL</span>
                        </div>
                        <div class="text-truncate" style="font-size: 0.9rem;">
                            ${post.Description || 'Post multimediale'}
                        </div>
                    </div>
                `).join('');
            } else {
                trendingList.innerHTML = '<div class="p-3 text-secondary text-center">Nessuna tendenza.</div>';
            }
        } catch (error) {
            console.error('Errore trends:', error);
        }
    }

    async function fetchNotifications() {
        try {
            const response = await fetch('/api/notifications');
            if (response.status === 401) return; // Non loggato
            
            const data = await response.json();
            const notificationList = document.getElementById('notification-list');
            if (!notificationList) return;

            if (data.new_likes > 0) {
                const li = document.createElement('li');
                li.className = 'p-2 border-bottom-theme notification-item new';
                li.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-warning">!</span>
                        <span>Hai ricevuto <strong>${data.new_likes}</strong> nuove paparell!</span>
                    </div>
                    <small class="text-secondary" style="font-size: 0.7rem;">Proprio ora</small>
                `;
                
                // Rimuovi il messaggio "nessuna notifica" se presente
                const emptyMsg = notificationList.querySelector('.text-secondary');
                if (emptyMsg && emptyMsg.textContent.includes('Nessuna nuova notifica')) {
                    emptyMsg.remove();
                }
                
                notificationList.prepend(li);
                
                // Suono o effetto visivo opzionale (blink)
                li.classList.add('blink');
                setTimeout(() => li.classList.remove('blink'), 3000);
            }
        } catch (error) {
            console.error('Errore notifiche:', error);
        }
    }

    // --- FILTRI TENDENZE ---
    const btnAllTime = document.getElementById('btn-all-time');
    const btnLast24h = document.getElementById('btn-last-24h');

    if (btnAllTime) {
        btnAllTime.addEventListener('click', () => {
            trendFilter = 'all';
            btnAllTime.classList.add('active');
            if (btnLast24h) btnLast24h.classList.remove('active');
            fetchTrends();
        });
    }

    if (btnLast24h) {
        btnLast24h.addEventListener('click', () => {
            trendFilter = '24h';
            btnLast24h.classList.add('active');
            if (btnAllTime) btnAllTime.classList.remove('active');
            fetchTrends();
        });
    }

    // --- INIZIALIZZAZIONE E REFRESH PERIODICO ---
    if (feedContainer) fetchPosts();
    if (document.getElementById('trending-list')) fetchTrends();
    if (document.getElementById('notification-list')) fetchNotifications();

    // Refresh notifiche ogni 60 secondi
    if (document.getElementById('notification-list')) setInterval(fetchNotifications, 60000);
    // Refresh trends ogni 5 minuti
    if (document.getElementById('trending-list')) setInterval(fetchTrends, 300000);
});
