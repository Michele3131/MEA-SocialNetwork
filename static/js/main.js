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
    function resizeGridItem(item) {
        const rowHeight = parseInt(window.getComputedStyle(feedContainer).getPropertyValue('grid-auto-rows'));
        const rowGap = parseInt(window.getComputedStyle(feedContainer).getPropertyValue('grid-row-gap'));
        const contentHeight = item.querySelector('.post-layout, .media-only-layout').getBoundingClientRect().height;
        const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
        item.style.gridRowEnd = 'span ' + rowSpan;
    }

    function resizeAllGridItems() {
        if (!feedContainer) return;
        const allItems = feedContainer.getElementsByClassName('terminal-card');
        for (let x = 0; x < allItems.length; x++) {
            resizeGridItem(allItems[x]);
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
        
        const dateStr = post.created_at || '2026-01-14';
        const displayScore = post.likes || 0;
        const userVote = post.user_vote || 0;
        
        if (postTypeClass === 'post-media-only') {
            div.innerHTML = `
                <div class="media-only-layout">
                    <div class="media-only-media" onclick="openLightboxMedia('${post.Content}', 'image')">
                        <img src="${post.Content}" alt="Post media" onload="this.closest('.terminal-card').dispatchEvent(new Event('mediaLoaded'))">
                    </div>
                    <div class="media-only-info">
                        <div class="media-only-meta">
                            <div class="media-only-date">[${dateStr}]</div>
                            <div class="media-only-user" onclick="window.location.href='/${post.user}'" style="cursor:pointer;">@${post.user}</div>
                        </div>
                        <div class="media-only-bottom">
                            <div class="media-only-score">PAPARELL: <span class="score-value" data-id="${post.id}">${displayScore}</span></div>
                            <div class="media-only-buttons">
                                <button class="btn-score btn-plus ${userVote === 1 ? 'active' : ''}" data-id="${post.id}" data-vote="1">+</button>
                                <button class="btn-score btn-minus ${userVote === -1 ? 'active' : ''}" data-id="${post.id}" data-vote="-1">-</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
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
                captionHtml = `
                    <div class="post-caption" onclick="openLightboxText('${escapeHtml(post.Description).replace(/'/g, "\\'")}', '${post.user}', '${post.created_at}')">
                        ${textHtml}
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
        }

        // Trigger resize when media loads
        div.addEventListener('mediaLoaded', () => resizeGridItem(div));
        
        return div;
    }

    function renderFeed(posts, clear = true) {
        if (!feedContainer) return;
        if (clear) feedContainer.innerHTML = '';
        
        posts.forEach(post => {
            const el = createPostElement(post);
            feedContainer.appendChild(el);
            resizeGridItem(el);
        });
    }

    // Scroll infinito
    if (feedContainer) {
        feedContainer.addEventListener('scroll', () => {
            if (feedContainer.scrollTop + feedContainer.clientHeight >= feedContainer.scrollHeight - 100) {
                fetchPosts();
            }
        });
    }

    window.addEventListener('resize', resizeAllGridItems);

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
                    const filtered = postsData.filter(p => 
                        (p.Description && p.Description.toLowerCase().includes(query)) || 
                        (p.user && p.user.toLowerCase().includes(query))
                    );
                    renderFeed(filtered);
                    // Ripristina bottone
                    container.innerHTML = `<button class="btn-control" id="btn-search" style="width:100%; height:100%; border:1px solid var(--border-color);">CERCA</button>`;
                    document.getElementById('btn-search').addEventListener('click', handleSearch);
                }
            });
            input.addEventListener('blur', () => {
                if (!input.value) {
                    container.innerHTML = `<button class="btn-control" id="btn-search" style="width:100%; height:100%; border:1px solid var(--border-color);">CERCA</button>`;
                    document.getElementById('btn-search').addEventListener('click', handleSearch);
                }
            });
        });
    }

    // --- TEMA ---
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
        const themes = ['dark', 'light', 'matrix'];
        let currentThemeIdx = localStorage.getItem('theme-idx') ? parseInt(localStorage.getItem('theme-idx')) : 0;
        
        const updateThemeIcon = (idx) => {
            const theme = themes[idx];
            if (theme === 'dark') {
                btnTheme.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
            } else if (theme === 'light') {
                btnTheme.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
            } else {
                btnTheme.innerHTML = '<span style="font-size: 12px; font-weight: bold;">[M]</span>';
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
    fetchPosts();
    fetchTrends();
    fetchNotifications();

    // Refresh notifiche ogni 60 secondi
    setInterval(fetchNotifications, 60000);
    // Refresh trends ogni 5 minuti
    setInterval(fetchTrends, 300000);
});
