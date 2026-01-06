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
            // [수정] PUUID를 사용하여 매치 리스트 요청 (Server API 변경 대응)
            const m = await fetchJson(`/api/summoner/matches?puuid=${encodeURIComponent(currentPuuid)}&count=${MATCH_COUNT}&start=${currentStart}`);
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
        const version = await window.DD.getVersion();
        const lang = 'ko_KR';

        // TFT 챔피언 데이터 로드 (스킨 이미지 및 위치 보정용)
        let tftChampions = {};
        try {
            const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-champion.json`);
            if (res.ok) {
                const json = await res.json();
                tftChampions = json.data;
            }
        } catch (e) { console.warn('TFT Champion data load failed', e); }

        // item images
        const itemImgs = container.querySelectorAll('img[data-item-id]');
        await Promise.all(Array.from(itemImgs).map(async (img) => {
            const id = img.dataset.itemId;
            // [수정] 로컬 아이템 이미지 사용
            img.src = `img/items/${id}.png`;
            img.style.opacity = 1.0;
            
            // 툴팁 데이터 설정
            const itemData = window.DD.getItemDataById(id);
            if (itemData) {
                const name = itemData.name || `Item ${id}`;
                const desc = (itemData.description || '').replace(/<[^>]*>/g, '');
                img.dataset.tooltip = `${name}\n${desc}`;
            } else {
                img.dataset.tooltip = `Item ${id}`;
            }

            // 이벤트 리스너
            img.addEventListener('mouseenter', (ev) => showTooltip(`<strong>${(img.dataset.tooltip||'')}</strong>`, ev.pageX, ev.pageY));
            img.addEventListener('mousemove', (ev) => showTooltip(`<strong>${(img.dataset.tooltip||'')}</strong>`, ev.pageX, ev.pageY));
            img.addEventListener('mouseleave', hideTooltip);

            // 에러 처리 (로컬 파일 없을 시)
            img.onerror = function() {
                this.style.opacity = 0.3;
            };
        }));

        // unit images (champion/unit)
        // [수정] img 태그 대신 div 배경 이미지 방식으로 변경하여 위치 보정 적용
        const unitDivs = container.querySelectorAll('.unit-img[data-char-id]');
        
        // 챔피언별 얼굴 위치 보정 맵 (main.js와 동일)
        const positionMap = {
            'Taric': 'right top',
            'Ryze': 'center top',
            'Aphelios': 'center top',
            'Nami': 'center top'
        };

        unitDivs.forEach(div => {
            const charId = div.dataset.charId; // 예: "TFT9_Ryze"
            let imageUrl = '';
            let bgPos = 'center 15%';

            // 1. TFT 데이터에서 챔피언 찾기
            if (tftChampions) {
                // 정확히 일치하거나, 접미사로 일치하는 키 찾기 (최신 세트 우선)
                const candidates = Object.keys(tftChampions).filter(key => 
                    key === charId || key.endsWith(`_${charId}`) || (charId.includes('_') && key.endsWith(`_${charId.split('_').pop()}`))
                );

                if (candidates.length > 0) {
                    // 세트 번호 내림차순 정렬
                    candidates.sort((a, b) => {
                        const getSetNum = (k) => {
                            const match = k.match(/TFT(\d+)/);
                            return match ? parseInt(match[1], 10) : 0;
                        };
                        return getSetNum(b) - getSetNum(a);
                    });
                    const championKey = candidates[0];
                    const championData = tftChampions[championKey];
                    
                    // [수정] 로컬 이미지 경로 사용
                    const baseIdRaw = championKey.replace(/^TFT\d+_/, '').toLowerCase();
                    const baseId = baseIdRaw.includes('/') ? baseIdRaw.split('/').pop() : baseIdRaw;
                    imageUrl = `img/champions/${baseId}.png`;
                }
            }

            // 2. TFT 데이터에 없으면 기본 LoL 이미지 사용 (Fallback)
            if (!imageUrl) {
                // try to set localized champ name
                const norm = window.DD.normalizeUnitCharacterId(charId);
                const baseId = norm.toLowerCase();
                imageUrl = `img/champions/${baseId}.png`;
            }

            // [수정] 배경 이미지 대신 img 태그 삽입 (onerror 처리를 위해)
            div.innerHTML = ''; // 기존 내용 제거
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
            
            // 에러 발생 시 처리 (이미지가 없을 경우)
            img.onerror = function() {
                this.style.opacity = 0.3; // 이미지가 없으면 흐리게 표시
            };
            
            div.appendChild(img);
            div.style.opacity = '1';
            div.style.background = 'none'; // 배경 제거

            // 툴팁 설정
            const norm = window.DD.normalizeUnitCharacterId(charId);
            const champData = window.DD.getChampionDataByKey(norm);
            const displayName = champData ? (champData.name || norm) : norm;
            
            div.dataset.tooltip = displayName;
            div.addEventListener('mouseenter', (ev) => showTooltip(`<strong>${div.dataset.tooltip}</strong>`, ev.pageX, ev.pageY));
            div.addEventListener('mousemove', (ev) => showTooltip(`<strong>${div.dataset.tooltip}</strong>`, ev.pageX, ev.pageY));
            div.addEventListener('mouseleave', hideTooltip);
        });

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
        
        // [수정] 시너지(특성)를 스타일 배지로 표시
        // API style: 0=None, 1=Bronze, 2=Silver, 3=Gold, 4=Chromatic
        const traitsHtml = (participant.traits || [])
            .filter(t => (t.tier_current ?? 0) > 0) // 활성화된 특성만
            .sort((a, b) => b.style - a.style || b.num_units - a.num_units) // 높은 등급 우선 정렬
            .map(t => {
                const traitName = (t.name || '').replace(/^TFT\d+_/, ''); // "TFT9_Shurima" -> "Shurima"
                // 한글화는 별도 매핑이 필요하지만 일단 영문 ID 출력 (추후 locale 데이터 활용 가능)
                return `<div class="match-trait style-${t.style}" title="${traitName}"><span>${t.num_units}</span>&nbsp;${traitName}</div>`;
            }).join('');

        const augmentsHtml = (participant.augments || []).map(aug => 
            `<img class="augment-img" data-augment-id="${aug}" alt="${aug}" width="32" height="32" style="opacity:0">`
        ).join('');

        // units -> placeholders (we'll populate images after inserting)
        const units = (participant.units || []).map(u => {
            const uname = (u.character_id || u.name || u.unitId || 'unknown');
            const itemsHtml = (u.items || []).map(it => `<img class="item" data-item-id="${it}" alt="item-${it}" width="28" height="28" style="opacity:0">`).join('');
            return `
                <div class="unit">
                    <div class="unit-img" data-char-id="${uname}" style="width:48px; height:48px; background-color:#333; border-radius:4px; opacity:0; overflow:hidden;"></div>
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
                <div class="match-traits" style="flex-basis: 100%;">${traitsHtml || '<span style="color:#666; font-size:12px;">활성 특성 없음</span>'}</div>
                <div class="unit-list">${units || '<div>유닛 정보 없음</div>'}</div>
                <div style="grid-column:1/-1">${companionHtml}</div>
            </div>
        `;
    }

    init();
});
