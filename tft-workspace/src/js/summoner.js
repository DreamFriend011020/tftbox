// 전적 페이지: 쿼리 파라미터(name, tag)로 소환사 조회 및 매치 목록/상세 표시
document.addEventListener('DOMContentLoaded', () => {
    const q = new URLSearchParams(window.location.search);
    const name = q.get('name') || '';
    const tag = q.get('tag') || '';

    const summonerCard = document.getElementById('summoner-card');
    const matchList = document.getElementById('match-list');
    const matchFilters = document.getElementById('match-filters');
    const sortSelect = document.getElementById('sort-select');
    const btnLoadMore = document.getElementById('btn-load-more');

    // 상태 관리
    let loadedMatches = [];
    let currentFilter = 'all'; // all, ranked, normal
    let currentSort = 'recent'; // recent, placement
    let currentPuuid = '';
    let currentStart = 0;
    const MATCH_COUNT = 10;

    const QUEUE_MAP = {
        1100: '랭크',
        1090: '일반',
        1130: '초고속 모드',
        1160: '더블 업'
    };

    function el(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild || div;
    }

    function renderError(target, msg) {
        if (target) target.innerHTML = `<div class="search-error">${msg}</div>`;
    }

    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            const err = body.error || body;
            throw new Error(JSON.stringify(err));
        }
        return res.json();
    }

    async function init() {
        if (!name) {
            renderError(summonerCard, '쿼리 파라미터에 name이 필요합니다.');
            return;
        }

        try {
            summonerCard.innerHTML = '소환사 정보 로딩...';
            const s = await fetchJson(`/api/summoner?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`);
            summonerCard.innerHTML = `
                <div class="summoner-card">
                    <h3>${s.name}${s.tag ? (' #' + s.tag) : ''}</h3>
                    <p>레벨: ${s.summonerLevel ?? '-'} | PUUID: ${s.puuid ?? '-'}</p>
                </div>
            `;
            currentPuuid = s.puuid;

            // 초기 매치 로드
            await loadMatches(true);

        } catch (err) {
            renderError(summonerCard, '데이터 로드 실패: ' + err.message);
            matchList.innerHTML = '';
        }
    }

    async function loadMatches(reset = false) {
        if (reset) {
            loadedMatches = [];
            currentStart = 0;
            matchList.innerHTML = '매치 기록 로딩 중...';
            if (btnLoadMore) btnLoadMore.style.display = 'none';
        } else {
            if (btnLoadMore) {
                btnLoadMore.textContent = '로딩 중...';
                btnLoadMore.disabled = true;
            }
        }

        try {
            // start 파라미터 추가
            const m = await fetchJson(`/api/summoner/matches?name=${encodeURIComponent(name)}&count=${MATCH_COUNT}&start=${currentStart}`);
            const ids = m.matchIds || m.matchIds === undefined ? m.matchIds || [] : [];

            if (reset && !ids.length) {
                matchList.innerHTML = '<div class="no-data">최근 매치가 없습니다.</div>';
                return;
            }

            if (ids.length === 0) {
                if (btnLoadMore) btnLoadMore.style.display = 'none'; // 더 이상 없음
                return;
            }

            // 병렬로 매치 상세 정보 요청
            const matchPromises = ids.map(id => fetchJson(`/api/match/${id}`).catch(e => null));
            const matches = await Promise.all(matchPromises);
            
            // 유효한 매치만 필터링하여 추가
            const newMatches = matches.filter(d => d && (d.info || d));
            loadedMatches = loadedMatches.concat(newMatches);
            currentStart += ids.length;

            renderMatches();

            // 더 보기 버튼 상태 복구
            if (btnLoadMore) {
                btnLoadMore.textContent = '더 보기';
                btnLoadMore.disabled = false;
                // 가져온 개수가 요청 개수보다 적으면 끝난 것
                btnLoadMore.style.display = ids.length < MATCH_COUNT ? 'none' : 'block';
            }
        } catch (err) {
            console.error(err);
            if (reset) matchList.innerHTML = '<div class="search-error">매치 로드 중 오류 발생</div>';
        }
    }

    // 필터/정렬 이벤트 리스너
    if (matchFilters) {
        matchFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                // UI 업데이트
                matchFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // 상태 업데이트 및 렌더링
                currentFilter = e.target.dataset.filter;
                renderMatches();
            }
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderMatches();
        });
    }

    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => loadMatches(false));
    }

    function renderMatches() {
        matchList.innerHTML = '';
        
        // 1. 필터링
        let filtered = loadedMatches.filter(m => {
            const qId = (m.info || m).queueId;
            if (currentFilter === 'ranked') return qId === 1100;
            if (currentFilter === 'normal') return qId === 1090;
            return true;
        });

        // 2. 정렬
        filtered.sort((a, b) => {
            const infoA = a.info || a;
            const infoB = b.info || b;
            
            if (currentSort === 'placement') {
                const pA = (infoA.participants || []).find(p => p.puuid === currentPuuid)?.placement || 9;
                const pB = (infoB.participants || []).find(p => p.puuid === currentPuuid)?.placement || 9;
                return pA - pB; // 오름차순 (1등이 위로)
            }
            // default: recent (game_datetime desc)
            return (infoB.game_datetime || 0) - (infoA.game_datetime || 0);
        });

        if (filtered.length === 0) {
            matchList.innerHTML = '<div class="no-data">조건에 맞는 매치가 없습니다.</div>';
            return;
        }

        // 3. 렌더링
        filtered.forEach(detail => {
            const html = renderMatchSummaryHtml(detail, currentPuuid);
            const item = document.createElement('div');
            item.className = 'match-item';
            item.innerHTML = html;
            matchList.appendChild(item);
        });

        // 이미지 로드 (Data Dragon 버전 동기화)
        populateImages(matchList);
    }

    // 툴팁 엘리먼트 (전역 하나만)
    const tooltip = document.createElement('div');
    tooltip.className = 'c-tooltip u-hidden';
    document.body.appendChild(tooltip);

    function showTooltip(html, x, y) {
        tooltip.innerHTML = html;
        tooltip.style.left = (x + 12) + 'px';
        tooltip.style.top = (y + 12) + 'px';
        tooltip.classList.remove('u-hidden');
    }
    function hideTooltip() {
        tooltip.classList.add('u-hidden');
    }

    async function populateImages(container) {
        // ensure locale data loaded (ko_KR)
        await window.DD.loadLocaleData('ko_KR');

        // item images
        const itemImgs = container.querySelectorAll('img[data-item-id]');
        await Promise.all(Array.from(itemImgs).map(async (img) => {
            const id = img.dataset.itemId;
            try {
                const url = await window.DD.getItemImageUrl(id);
                img.src = url;
                img.style.opacity = 1.0;
                // set tooltip data from locale cache
                const itemData = window.DD.getItemDataById(id);
                if (itemData) {
                    const name = itemData.name || `Item ${id}`;
                    const desc = (itemData.description || '').replace(/<[^>]*>/g, ''); // strip HTML
                    img.dataset.tooltip = `${name}\n${desc}`;
                } else {
                    img.dataset.tooltip = `Item ${id}`;
                }
                // listeners
                img.addEventListener('mouseenter', (ev) => {
                    showTooltip(`<strong>${(img.dataset.tooltip||'')}</strong>`, ev.pageX, ev.pageY);
                });
                img.addEventListener('mousemove', (ev) => {
                    showTooltip(`<strong>${(img.dataset.tooltip||'')}</strong>`, ev.pageX, ev.pageY);
                });
                img.addEventListener('mouseleave', hideTooltip);
            } catch (e) {
                img.alt = 'no-item';
            }
        }));

        // unit images (champion/unit)
        const unitImgs = container.querySelectorAll('img[data-char-id]');
        await Promise.all(Array.from(unitImgs).map(async (img) => {
            const charId = img.dataset.charId;
            try {
                const url = await window.DD.getUnitImageUrl(charId);
                img.src = url;
                img.style.opacity = 1.0;
                // try to set localized champ name
                const norm = window.DD.normalizeUnitCharacterId(charId);
                const champData = window.DD.getChampionDataByKey(norm);
                const displayName = champData ? (champData.name || norm) : norm;
                img.dataset.tooltip = displayName;
                img.addEventListener('mouseenter', (ev) => showTooltip(`<strong>${img.dataset.tooltip}</strong>`, ev.pageX, ev.pageY));
                img.addEventListener('mousemove', (ev) => showTooltip(`<strong>${img.dataset.tooltip}</strong>`, ev.pageX, ev.pageY));
                img.addEventListener('mouseleave', hideTooltip);
            } catch (e) {
                img.alt = 'no-unit';
            }
        }));

        // augment images
        const augmentImgs = container.querySelectorAll('img[data-augment-id]');
        await Promise.all(Array.from(augmentImgs).map(async (img) => {
            const id = img.dataset.augmentId;
            try {
                const url = await window.DD.getAugmentImageUrl(id);
                img.src = url;
                img.style.opacity = 1.0;
                const augData = window.DD.getAugmentData(id);
                const name = augData ? augData.name : id;
                const desc = augData ? (augData.description || '').replace(/<[^>]*>/g, '') : '';
                img.dataset.tooltip = `<strong>${name}</strong>\n${desc}`;
                img.addEventListener('mouseenter', (ev) => showTooltip(img.dataset.tooltip, ev.pageX, ev.pageY));
                img.addEventListener('mousemove', (ev) => showTooltip(img.dataset.tooltip, ev.pageX, ev.pageY));
                img.addEventListener('mouseleave', hideTooltip);
            } catch (e) { img.alt = 'aug'; }
        }));

        // companion elements
        const companionElems = container.querySelectorAll('[data-companion-id]');
        Array.from(companionElems).forEach((el) => {
            const cid = el.dataset.companionId;
            window.DD.getUnitImageUrl(cid).then(url => {
                const img = document.createElement('img');
                img.src = url;
                img.width = 48; img.height = 48;
                el.prepend(img);
            }).catch(()=>{});
        });
    }

    function renderMatchSummaryHtml(detail, puuid) {
        const info = detail.info || detail;
        const participant = (info.participants || []).find(p => p.puuid === puuid);
        if (!participant) return `<div>해당 매치에서 소환사 정보를 찾을 수 없습니다.</div>`;

        const queueName = QUEUE_MAP[info.queueId] || '기타';
        const placement = participant.placement ?? participant.companion?.placement ?? '-';
        const gameLength = info.gameLength || info.game_time || 0;
        const timeStr = gameLength ? Math.round(gameLength / 60) + '분' : '-';
        const lastRound = participant.last_round ? `라운드 ${participant.last_round}` : '';
        const traitsHtml = (participant.traits || []).filter(t => (t.tier_current ?? 0) > 0)
            .map(t => `<span class="trait">${(t.name||'').replace(/^TFT_/, '')} ${t.tier_current||''}</span>`).join(' ') || '-';

        const augmentsHtml = (participant.augments || []).map(aug => 
            `<img class="augment-img" data-augment-id="${aug}" alt="${aug}" width="32" height="32" style="opacity:0">`
        ).join('');

        // units -> placeholders (we'll populate images after inserting)
        const units = (participant.units || []).map(u => {
            const uname = (u.character_id || u.name || u.unitId || 'unknown');
            const itemsHtml = (u.items || []).map(it => `<img class="item" data-item-id="${it}" alt="item-${it}" width="28" height="28" style="opacity:0">`).join('');
            return `
                <div class="unit">
                    <img class="unit-img" data-char-id="${uname}" alt="${uname}" width="48" height="48" style="opacity:0">
                    <span class="unit-name">${uname.replace(/^TFT.*_/,'')}</span>
                    <div class="items">${itemsHtml || '-'}</div>
                </div>
            `;
        }).join('');

        const companionHtml = participant.companion ? `<div data-companion-id="${participant.companion.content_ID || participant.companion.name || ''}">동반자: ${participant.companion.content_ID || participant.companion.name || '-'}</div>` : '';

        return `
            <div class="match-summary">
                <div class="match-meta">
                    <div class="queue-type">${queueName}</div>
                    <div class="placement">#${placement}</div>
                    <div class="time">게임시간: ${timeStr}</div>
                    <div class="time">${lastRound}</div>
                </div>
                <div class="match-meta">
                    <div>레벨: ${participant.level ?? '-'}</div>
                    <div>종합 점수: ${participant.total_damage_to_players ?? '-'}</div>
                    <div class="augments">${augmentsHtml}</div>
                </div>
                <div class="traits" style="flex-basis: 100%; margin-top: 8px;">${traitsHtml}</div>
                <div class="unit-list">${units || '<div>유닛 정보 없음</div>'}</div>
                <div style="grid-column:1/-1">${companionHtml}</div>
            </div>
        `;
    }

    init();
});
