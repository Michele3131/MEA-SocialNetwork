document.addEventListener('DOMContentLoaded', () => {
    // --- UTENTE & CREDITI ---
    const currentUser = {
        tag: '@dev_user',
        balance: 100
    };
    
    function updateProfileUI() {
        const tagEl = document.getElementById('user-tag');
        const balanceEl = document.getElementById('user-balance');
        if(tagEl) tagEl.textContent = currentUser.tag;
        if(balanceEl) balanceEl.textContent = currentUser.balance;
    }
    updateProfileUI();

    // --- DATI MOCKUP ---
    const postsData = [
        {
            id: 1,
            user: '@utente_alpha',
            time: '10:42',
            text: "Benvenuti su MEA. L'interfaccia è stata aggiornata. Pulita, minimale, essenziale.\n\nAbbiamo introdotto nuove funzionalità per migliorare l'esperienza utente. Ora i post hanno dimensioni fisse per garantire un layout armonioso. Se il testo è troppo lungo, verrà troncato automaticamente. Clicca per leggere di più! #design #minimal #update",
            media: 'https://picsum.photos/id/1/600/600',
            mediaType: 'image',
            stats: { views: 1205, likes: 89 },
            interactions: []
        },
        {
            id: 2,
            user: '@neo_dev',
            time: '09:15',
            text: "Il codice è poesia scritta in un linguaggio che solo le macchine comprendono appieno.",
            media: null,
            stats: { views: 450, likes: 32 },
            interactions: []
        },
        {
            id: 3,
            user: '@coffee_lover',
            time: '08:30',
            text: "Primo caffè della giornata. Indispensabile per avviare il sistema. ☕",
            media: 'https://picsum.photos/id/1060/600/600',
            mediaType: 'image',
            stats: { views: 2300, likes: 156 },
            interactions: []
        },
        {
            id: 4,
            user: '@visual_art',
            time: '07:45',
            text: "", // Media Only
            media: 'https://picsum.photos/id/20/600/600',
            mediaType: 'image',
            stats: { views: 5000, likes: 340 },
            interactions: []
        },
        {
            id: 5,
            user: '@photo_daily',
            time: '07:30',
            text: "", // Media Only
            media: 'https://picsum.photos/id/25/600/600',
            mediaType: 'image',
            stats: { views: 4200, likes: 210 },
            interactions: []
        },
        {
            id: 6,
            user: '@long_writer',
            time: '06:00',
            text: "Questo è un post di solo testo molto lungo per testare la funzionalità di troncamento. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. \n\nClicca qui per espandere e leggere tutto il contenuto.",
            media: null,
            stats: { views: 120, likes: 10 },
            interactions: []
        },
        {
            id: 7,
            user: '@retro_gamer',
            time: '05:45',
            text: "Ricordi le notti passate a cercare di superare quel livello impossibile? 🕹️",
            media: 'https://picsum.photos/id/96/600/600',
            mediaType: 'image',
            stats: { views: 890, likes: 145 },
            interactions: []
        },
        {
            id: 8,
            user: '@nature_walk',
            time: '05:15',
            text: "", // Media Only
            media: 'https://picsum.photos/id/28/600/600',
            mediaType: 'image',
            stats: { views: 670, likes: 55 },
            interactions: []
        },
        {
            id: 9,
            user: '@minimalist_guy',
            time: '04:30',
            text: "Less is more.",
            media: null,
            stats: { views: 330, likes: 88 },
            interactions: []
        },
        {
            id: 10,
            user: '@city_lights',
            time: '03:20',
            text: "La città non dorme mai.",
            media: 'https://picsum.photos/id/48/600/600',
            mediaType: 'image',
            stats: { views: 1500, likes: 200 },
            interactions: []
        },
        {
            id: 11,
            user: '@tech_daily',
            time: '02:45',
            text: "Il futuro dell'AI è qui. Guardate cosa può fare questo nuovo modello generativo. Incredibile vero? 🤖✨",
            media: 'https://picsum.photos/id/180/600/600',
            mediaType: 'image',
            stats: { views: 2100, likes: 340 },
            interactions: []
        },
        {
            id: 12,
            user: '@thinker_x',
            time: '02:10',
            text: "A volte il silenzio dice più di mille parole. Fermati un attimo, respira e ascolta ciò che ti circonda.",
            media: null,
            stats: { views: 89, likes: 45 },
            interactions: []
        },
        {
            id: 13,
            user: '@abstract_art',
            time: '01:55',
            text: "",
            media: 'https://picsum.photos/id/104/600/600',
            mediaType: 'image',
            stats: { views: 560, likes: 120 },
            interactions: []
        },
        {
            id: 14,
            user: '@foodie_life',
            time: '01:30',
            text: "Nulla batte una pizza fatta in casa il sabato sera! 🍕🔥 Chi vuole la ricetta?",
            media: 'https://picsum.photos/id/292/600/600',
            mediaType: 'image',
            stats: { views: 3200, likes: 560 },
            interactions: []
        },
        {
            id: 15,
            user: '@dev_status',
            time: '01:15',
            text: "Deploy completato con successo. Ora si va a dormire. 💤",
            media: null,
            stats: { views: 45, likes: 12 },
            interactions: []
        },
        {
            id: 16,
            user: '@green_soul',
            time: '00:45',
            text: "",
            media: 'https://picsum.photos/id/10/600/600',
            mediaType: 'image',
            stats: { views: 1100, likes: 230 },
            interactions: []
        }
    ];

    const scoreState = {};
    const userVotes = {};
    postsData.forEach(p => { scoreState[p.id] = p.stats.likes; });

    const feedContainer = document.getElementById('feed-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // --- FUNZIONI DI RENDERING ---

    function getInitials(username) {
        return username.substring(0, 2).toUpperCase();
    }

    // duckSvg function removed as requested

    function createPostElement(post) {
        const div = document.createElement('div');
        
        // Determina il tipo di post e le classi CSS
        let postTypeClass = 'post-standard';
        const hasMedia = !!post.media;
        const hasText = post.text && post.text.trim().length > 0;

        if (hasMedia && !hasText) {
            postTypeClass = 'post-media-only';
        } else if (!hasMedia && hasText) {
            postTypeClass = 'post-text-only';
        }

        div.className = `terminal-card ${postTypeClass}`;
        
        let mediaHtml = '';
        
        if (hasMedia) {
            mediaHtml = `
                <div class="post-media-section">
                    <div class="media-container" onclick="openLightboxMedia('${post.media}', '${post.mediaType}')">
                        ${post.mediaType === 'video' 
                            ? `<video src="${post.media}"></video>` 
                            : `<img src="${post.media}" alt="Post media">`
                        }
                    </div>
                </div>
            `;
            if (postTypeClass === 'post-standard') {
                mediaHtml += `<div class="post-divider"></div>`;
            }
        }

        function escapeHtml(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
        function formatText(str) {
            const safe = escapeHtml(str || '');
            return safe.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
        }
        const shouldShowEllipsis = hasText && (post.text.length > 160);
        
        let captionHtml = '';
        if (hasText) {
            const textHtml = formatText(post.text);
            const onclickArg = escapeHtml(post.text).replace(/'/g, "\\'");
            captionHtml = `
                <div class="post-caption" title="Clicca per espandere">
                    ${textHtml}${shouldShowEllipsis ? `<span class="caption-ellipsis" onclick="openLightboxText('${onclickArg}', '${post.user}', '${post.time}')">...</span>` : ''}
                </div>
            `;
        }

        const dateStr = post.date || '2026-01-12';
        const displayScore = (post.id in scoreState) ? scoreState[post.id] : post.stats.likes;
        
        // Simple +/- Buttons
        const sideControlsHtml = `
            <div class="post-side-controls">
                <div class="controls-stack">
                    <button class="btn-score btn-plus" data-id="${post.id}" title="Give Paparell">
                        +
                    </button>
                    <button class="btn-score btn-minus" data-id="${post.id}" title="Take Paparell">
                        -
                    </button>
                </div>
            </div>
        `;

        if (postTypeClass === 'post-media-only') {
            div.innerHTML = `
                <div class="media-only-layout">
                    <div class="media-only-media" onclick="openLightboxMedia('${post.media}', '${post.mediaType}')">
                        ${post.mediaType === 'video'
                            ? `<video src="${post.media}"></video>`
                            : `<img src="${post.media}" alt="Post media">`
                        }
                    </div>
                    <div class="media-only-info">
                        <div class="media-only-meta">
                            <div class="media-only-date">[${dateStr} ${post.time}]</div>
                            <div class="media-only-user">${post.user}</div>
                        </div>
                        <div class="media-only-bottom">
                            <div class="media-only-score">PAPARELL: <span class="score-value" data-id="${post.id}">${displayScore}</span></div>
                            <div class="media-only-buttons" style="gap: 6px;">
                                <button class="btn-score btn-plus" data-id="${post.id}" title="Give Paparell">+</button>
                                <button class="btn-score btn-minus" data-id="${post.id}" title="Take Paparell">-</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="post-layout">
                    ${mediaHtml}
                    <div class="post-content-section">
                        <div class="post-header">
                            <span class="user">${post.user}</span>
                            <div class="header-right">
                                <span class="time">[${dateStr} ${post.time}]</span>
                                <span class="score">PAPARELL: <span class="score-value" data-id="${post.id}">${displayScore}</span></span>
                            </div>
                        </div>
                        ${captionHtml}
                    </div>
                    ${sideControlsHtml}
                </div>
            `;
        }

        return div;
    }

    function renderFeed(posts, prepend = false) {
        if (prepend) {
            posts.slice().reverse().forEach(post => {
                const el = createPostElement(post);
                el.classList.add('fade-in-new');
                feedContainer.prepend(el);
            });
        } else {
            posts.forEach(post => {
                feedContainer.appendChild(createPostElement(post));
            });
        }
    }

    // --- SEARCH ---
    const btnSearch = document.getElementById('btn-search');
    if (btnSearch) {
        btnSearch.addEventListener('click', function() {
            const container = this.parentElement;
            // Create input
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'btn-control'; // Reuse style
            input.style.width = '100%';
            input.style.height = '100%';
            input.style.textAlign = 'left';
            input.style.paddingLeft = '10px';
            input.style.backgroundColor = 'var(--panel-bg)';
            input.style.color = 'var(--text-primary)';
            input.style.border = '1px solid var(--border-color)';
            input.placeholder = 'Cerca...';
            
            // Replace button with input
            container.innerHTML = '';
            container.appendChild(input);
            input.focus();
            
            // Handle blur or enter
            const restore = () => {
                container.innerHTML = '';
                const btn = document.createElement('button');
                btn.id = 'btn-search';
                btn.className = 'btn-control';
                btn.style.width = '100%';
                btn.style.height = '100%';
                btn.style.border = '1px solid var(--border-color)';
                btn.textContent = 'CERCA';
                container.appendChild(btn);
                // Re-attach listener (since we replaced the element)
                btn.addEventListener('click', arguments.callee);
            };

            input.addEventListener('blur', () => {
                if(!input.value) restore();
            });
            input.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    alert('Ricerca per: ' + input.value);
                    restore();
                }
            });
        });
    }

    // --- NOTIFICATIONS ---
    function renderNotifications() {
        const list = document.getElementById('notification-list');
        if(!list) return;
        
        // Generate random notifications with timestamps
        const notifications = [
            { user: '@user2', action: 'ha messo mi piace al tuo post', timeOffset: 30 }, // 30s ago
            { user: '@dev_guru', action: 'ha iniziato a seguirti', timeOffset: 3600 * 2 }, // 2h ago
            { user: '@random_bot', action: 'ha smesso di seguirti', timeOffset: 3600 * 25 + 1800 } // 1d 0.5h ago
        ];

        list.innerHTML = '';
        notifications.forEach(n => {
            // Calculate time string
            const now = new Date();
            const time = new Date(now.getTime() - n.timeOffset * 1000);
            
            let timeStr = '';
            const diffSeconds = n.timeOffset;
            const diffDays = Math.floor(diffSeconds / (3600 * 24));
            
            if (diffDays >= 1) {
                const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
                const mins = Math.floor((diffSeconds % 3600) / 60);
                timeStr = `${diffDays}d${hours}h${mins}m`;
            } else {
                // Precise to seconds if < 1 day? Prompt says "orario di ricezione con precisione ai secondi e dopo un giorno diventa preciso al giorno e all'ora"
                // Actually prompt says: "precisione ai secondi e dopo un giorno diventa preciso al giorno e all'ora (per esempio 1d14h36m)"
                // "Precisione ai secondi" implies HH:MM:SS format for < 1 day.
                timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }

            const li = document.createElement('li');
            li.innerHTML = `<span class="blink">></span> [${timeStr}] <span class="user-highlight">${n.user}</span> ${n.action}`;
            list.appendChild(li);
        });
    }
    renderNotifications();

    // --- LOGICA REFRESH ---
    const btnRefresh = document.getElementById('btn-refresh');
    
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            btnRefresh.style.transform = 'rotate(360deg)';
            loadingIndicator.style.display = 'block';
            
            setTimeout(() => {
                btnRefresh.style.transform = 'rotate(0deg)';
                loadingIndicator.style.display = 'none';
                
                const newPost = {
                    id: Date.now(),
                    user: '@new_user',
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    text: "Feed aggiornato! Ecco un nuovo post di testo per verificare il layout ridotto.",
                    media: null,
                    stats: { views: 5, likes: 0 },
                    interactions: []
                };
                
                scoreState[newPost.id] = 0;
                renderFeed([newPost], true);
                feedContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
        });
    }

    // --- INIZIALIZZAZIONE ---
    const btnMixedInit = document.getElementById('filter-mixed');
    if (btnMixedInit) btnMixedInit.classList.add('active');
    renderFeed(postsData);

    // --- FILTRI ---
    const btnMixed = document.getElementById('filter-mixed');
    const btnTextOnly = document.getElementById('filter-text');
    const btnMediaOnly = document.getElementById('filter-media');
    
    function clearFeed() {
        while (feedContainer.firstChild) {
            feedContainer.removeChild(feedContainer.firstChild);
        }
    }
    
    function setActiveFilter(activeBtn) {
        [btnMixed, btnTextOnly, btnMediaOnly].forEach(btn => {
            if(btn) btn.classList.remove('active');
        });
        if(activeBtn) activeBtn.classList.add('active');
    }

    function filterAndRender(type) {
        clearFeed();
        let filtered = postsData;
        if (type === 'mixed') {
            filtered = postsData;
            setActiveFilter(btnMixed);
        } else if (type === 'text') {
            filtered = postsData.filter(p => !p.media && (p.text && p.text.trim().length > 0));
            setActiveFilter(btnTextOnly);
        } else if (type === 'media') {
            filtered = postsData.filter(p => !!p.media && !(p.text && p.text.trim().length > 0));
            setActiveFilter(btnMediaOnly);
        }
        renderFeed(filtered);
    }
    if (btnMixed && btnTextOnly && btnMediaOnly) {
        btnMixed.addEventListener('click', () => filterAndRender('mixed'));
        btnTextOnly.addEventListener('click', () => filterAndRender('text'));
        btnMediaOnly.addEventListener('click', () => filterAndRender('media'));
    }

    // --- VOTING LOGIC ---
    document.addEventListener('click', (e) => {
        const plus = e.target.closest('.btn-plus');
        const minus = e.target.closest('.btn-minus');
        if (!plus && !minus) return;
        
        const btn = plus || minus;
        const id = Number(btn.getAttribute('data-id'));
        const direction = plus ? 1 : -1;
        
        const currentVote = userVotes[id] || 0;
        
        if (currentVote === direction) return; // No change
        
        // Logic:
        // Vote Up (Direction 1):
        //   From 0 -> 1: Cost 1.
        //   From -1 -> 1: Cost 1 (to set +1). The -1 removal is free?
        //   User says "Nel momento in cui si assegna una paparell (più) ... il saldo si abbassa".
        //   So being in state +1 costs 1 point.
        //   If I am in state -1 (cost 0) and go to +1 (cost 1), I pay 1.
        //   If I am in state 0 (cost 0) and go to +1 (cost 1), I pay 1.
        //   If I am in state +1 (cost 1) and go to 0 (cost 0), I get 1 back?
        //   Let's assume NO refunds for now unless explicitly asked, BUT standard credit systems usually refund reserved credits.
        //   Prompt says "saldo ... si abbassa (come se fosse un sistema di crediti)".
        //   If I unvote, I should probably get it back, otherwise I lose credits forever by toggling.
        
        let cost = 0;
        if (direction === 1) {
            // Target is +1.
            // If current is 0, cost is 1.
            // If current is -1, cost is 1.
            cost = 1;
        } else if (direction === -1) {
            // Target is -1.
            // If current is 1, cost is -1 (refund).
            // If current is 0, cost is 0.
            if (currentVote === 1) cost = -1;
            else cost = 0;
        }

        // Validate Balance
        if (cost > 0 && currentUser.balance < cost) {
            alert("Non hai abbastanza Paparell!");
            return;
        }
        
        // Apply
        currentUser.balance -= cost;
        updateProfileUI();
        
        // Update Score
        userVotes[id] = direction;
        
        // Calculate delta for score
        // If 0 -> 1: +1
        // If -1 -> 1: +2
        // If 1 -> -1: -2
        // If 0 -> -1: -1
        const delta = direction - currentVote;
        
        if (!(id in scoreState)) scoreState[id] = 0;
        scoreState[id] += delta;
        
        // Update UI
        const valueEls = document.querySelectorAll(`.score-value[data-id="${id}"]`);
        valueEls.forEach(el => el.textContent = scoreState[id]);
    });

    // --- TRENDS RENDERING ---
    const trendingList = document.getElementById('trending-list');
    function renderTrends(data) {
        if (!trendingList) return;
        trendingList.innerHTML = '';
        
        function escapeHtml(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        data.forEach((post, idx) => {
            const item = document.createElement('div');
            item.className = 'trend-item';
            const preview = post.media ? `<img class="trend-preview" src="${post.media}" alt="">` : '';
            const caption = (post.text && post.text.trim().length > 0) ? post.text : '';
            item.innerHTML = `
                <span class="rank">#${idx + 1}</span>
                ${preview}
                <span class="trend-caption">${caption || 'Post senza didascalia'}</span>
            `;
            const originalContent = item.innerHTML;

            item.addEventListener('click', (e) => {
                if (item.classList.contains('trend-expanded')) return;
                
                item.classList.add('trend-expanded');
                
                // --- Body Construction ---
                let bodyContent = '';
                
                if (post.media) {
                    // Hybrid Media Layout
                    bodyContent = `
                        <div style="display: flex; gap: 10px; height: 100px;">
                            <div class="media-container" style="width: 100px; height: 100px; flex-shrink: 0;" onclick="openLightboxMedia('${post.media}', '${post.mediaType || 'image'}'); event.stopPropagation();">
                                ${post.mediaType === 'video' ? `<video src="${post.media}"></video>` : `<img src="${post.media}" alt="">`}
                            </div>
                            <div class="post-caption" style="-webkit-line-clamp: 4; font-size: 0.85rem;" onclick="openLightboxText('${escapeHtml(post.text || '').replace(/'/g, "\\'")}', '${post.user}', '${post.time}'); event.stopPropagation();">
                                ${post.text || ''}
                            </div>
                        </div>
                    `;
                } else {
                    // Text Only Layout
                    bodyContent = `
                        <div class="post-caption" style="-webkit-line-clamp: 6; font-size: 0.85rem;" onclick="openLightboxText('${escapeHtml(post.text || '').replace(/'/g, "\\'")}', '${post.user}', '${post.time}'); event.stopPropagation();">
                            ${post.text || ''}
                        </div>
                    `;
                }

                // --- Full Expanded Content ---
                const expandedContent = `
                    <div class="trend-expanded-container" style="display: flex; flex-direction: column; width: 100%; gap: 10px;">
                        
                        <!-- Header Line: Arrow | Rank | Score | Controls -->
                        <div class="trend-expanded-header" style="display:flex; justify-content:space-between; align-items:center; width:100%; border-bottom:1px solid var(--border-color); padding-bottom:5px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <button class="trend-collapse-btn" style="background:none; border:none; color:var(--text-primary); cursor:pointer; font-size:1.2rem; padding:0; line-height:1;">←</button>
                                <span class="rank" style="font-weight:bold;">#${idx + 1}</span>
                                <span class="score" style="font-size:0.8rem; color:var(--text-secondary);">PAPARELL: <span class="score-value" data-id="${post.id}">${scoreState[post.id]}</span></span>
                            </div>
                            <div class="trend-header-right" style="display:flex; align-items:center; gap:5px;">
                                 <button class="btn-score btn-plus" data-id="${post.id}" style="width:24px; height:24px; font-size:1rem;" title="Give Paparell">+</button>
                                 <button class="btn-score btn-minus" data-id="${post.id}" style="width:24px; height:24px; font-size:1rem;" title="Take Paparell">-</button>
                            </div>
                        </div>
                        
                        <!-- Body -->
                        ${bodyContent}
                    </div>
                `;

                item.innerHTML = expandedContent;
                
                const collapseBtn = item.querySelector('.trend-collapse-btn');
                collapseBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    item.classList.remove('trend-expanded');
                    item.innerHTML = originalContent;
                });
            });
            trendingList.appendChild(item);
        });
    }
    renderTrends(postsData);


    // --- LIGHTBOX LOGICA ---
    const lightbox = document.getElementById('lightbox');
    
    function clearLightbox() {
        lightbox.innerHTML = `
            <span class="lightbox-close">&times;</span>
            <div class="lightbox-content-wrapper"></div>
        `;
        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
    }

    window.openLightboxMedia = function(src, type) {
        clearLightbox();
        const wrapper = lightbox.querySelector('.lightbox-content-wrapper');
        let content = '';
        if (type === 'video') {
            content = `<video src="${src}" controls autoplay class="lightbox-media"></video>`;
        } else {
            content = `<img src="${src}" class="lightbox-media">`;
        }
        wrapper.innerHTML = content;
        lightbox.classList.add('active');
    };

    window.openLightboxText = function(text, user, time) {
        clearLightbox();
        const wrapper = lightbox.querySelector('.lightbox-content-wrapper');
        wrapper.innerHTML = `
            <div class="terminal-header" style="margin-bottom: 20px;">
                <span>${user}</span>
                <span style="float: right; font-size: 0.8em; color: var(--text-secondary);">${time}</span>
            </div>
            <div class="lightbox-text">${text}</div>
        `;
        lightbox.classList.add('active');
    };

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // --- THEME SWITCHER ---
    const btnTheme = document.getElementById('btn-theme');
    const htmlEl = document.documentElement;
    
    // Sun Icon (for Dark Mode -> switch to Light)
    const sunIcon = `<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
    
    // Moon Icon (for Light Mode -> switch to Dark)
    const moonIcon = `<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;

    function updateThemeIcon() {
        const isDark = htmlEl.getAttribute('data-theme') === 'dark';
        if(btnTheme) btnTheme.innerHTML = isDark ? sunIcon : moonIcon;
    }

    if (btnTheme) {
        updateThemeIcon();
        btnTheme.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', next);
            updateThemeIcon();
        });
    }
});
