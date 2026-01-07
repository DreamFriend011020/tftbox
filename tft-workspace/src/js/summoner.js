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

    // [수정] 검색창 기능 연결 (헤더 또는 메인 스타일 ID 지원)
    const searchInput = document.getElementById('header-search-input') || document.getElementById('summoner-input');
    const searchBtn = document.getElementById('header-search-btn') || document.getElementById('summoner-search-btn');

    if (searchInput && searchBtn) {
        // [추가] 최근 검색 기록 UI 및 로직 (summoner.js)
        const historyContainer = document.createElement('div');
        historyContainer.className = 'search-history';
        Object.assign(historyContainer.style, {
            position: 'absolute', top: '100%', left: '0', right: '0',
            background: '#2c3e50', border: '1px solid #34495e', borderRadius: '0 0 4px 4px',
            zIndex: '1000', display: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        });
        // 부모 요소에 relative가 없으면 위치가 깨질 수 있으므로 체크
        if (searchInput.parentNode) {
            searchInput.parentNode.style.position = 'relative';
            searchInput.parentNode.appendChild(historyContainer);
        }

        const loadHistory = () => JSON.parse(localStorage.getItem('tft_recent_searches') || '[]');
        const saveHistory = (newHistory) => localStorage.setItem('tft_recent_searches', JSON.stringify(newHistory));

        const renderHistory = () => {
            const history = loadHistory();
            if (history.length === 0) {
                historyContainer.style.display = 'none';
                return;
            }
            historyContainer.innerHTML = '';
            history.forEach(query => {
                const item = document.createElement('div');
                Object.assign(item.style, {
                    padding: '10px', cursor: 'pointer', color: '#ecf0f1',
                    borderBottom: '1px solid #34495e', fontSize: '14px', textAlign: 'left'
                });
                item.textContent = query;
                
                item.onmouseenter = () => item.style.background = '#34495e';
                item.onmouseleave = () => item.style.background = 'transparent';
                
                item.onclick = (e) => {
                    e.preventDefault();
                    searchInput.value = query;
                    goSearch();
                };
                historyContainer.appendChild(item);
            });
            historyContainer.style.display = 'block';
        };

        searchInput.addEventListener('focus', renderHistory);
        searchInput.addEventListener('blur', () => setTimeout(() => historyContainer.style.display = 'none', 200));

        const goSearch = () => {
            const val = searchInput.value.trim();
            if (!val) return alert('소환사명#태그를 입력해주세요.');
            const parts = val.split('#');
            if (parts.length < 2) return alert('소환사명#태그 형식을 지켜주세요. (예: Hide on bush#KR1)');
            
            // [추가] 검색어 저장
            let history = loadHistory();
            history = history.filter(h => h !== val);
            history.unshift(val);
            if (history.length > 5) history.pop();
            saveHistory(history);

            const sName = parts.slice(0, -1).join('#');
            const sTag = parts[parts.length - 1];
            window.location.href = `/summoner.html?name=${encodeURIComponent(sName)}&tag=${encodeURIComponent(sTag)}`;
        };
        searchBtn.addEventListener('click', goSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') goSearch();
        });
    }

    // 상태 관리
    let loadedMatches = [];
    let currentFilter = 'all'; // all, ranked, normal
    let currentSort = 'recent'; // recent, placement
    let currentPuuid = '';
    let currentStart = 0;
    const MATCH_COUNT = 10;

    // [추가] TFT 데이터 캐시 (챔피언, 특성)
    let tftChampions = {};
    let tftTraits = {};
    let tftItems = {};

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

    async function init(refresh = false) {
        if (!name) {
            renderError(summonerCard, '쿼리 파라미터에 name이 필요합니다.');
            return;
        }

        try {
            summonerCard.innerHTML = '소환사 정보 로딩...';
            const refreshQuery = refresh ? '&refresh=true' : '';
            const s = await fetchJson(`/api/summoner?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}${refreshQuery}`);
            console.log('Summoner Info:', s); // [디버깅] 소환사 정보 확인
            currentPuuid = s.puuid;

            // [추가] 프로필 아이콘 URL 생성을 위한 버전 조회
            const version = await window.DD.getVersion();
            const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${s.profileIconId}.png`;

            // [추가] 리그 정보 조회 및 HTML 생성
            let leagueHtml = '';
            if (s.id) {
                try {
                    // [수정] ID 인코딩 적용 및 API 호출
                    const leagues = await fetchJson(`/api/summoner/league/${encodeURIComponent(s.id)}`);
                    
                    // [수정] 랭크 데이터 찾기 (솔랭 -> 더블업 순서로 확인)
                    let rankData = leagues.find(l => l.queueType === 'RANKED_TFT');
                    let queueLabel = 'Ranked TFT';
                    
                    if (!rankData) {
                        rankData = leagues.find(l => l.queueType === 'RANKED_TFT_DOUBLE_UP');
                        if (rankData) queueLabel = 'Double Up';
                    }
                    
                    if (rankData) {
                        const tier = rankData.tier; // IRON, BRONZE, ...
                        const rank = rankData.rank; // I, II, III, IV
                        const lp = rankData.leaguePoints;
                        const wins = rankData.wins;
                        const losses = rankData.losses;
                        const totalGames = wins + losses;
                        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
                        
                        // 승률 색상 (50% 이상 빨강, 미만 회색)
                        const winRateColor = winRate >= 50 ? '#e74c3c' : '#95a5a6';
                        
                        // 티어 이미지 (CommunityDragon 사용)
                        const tierImg = `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`;

                        leagueHtml = `
                            <div class="league-info" style="display: flex; align-items: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 20px; border-radius: 8px; min-width: 250px;">
                                <div class="tier-icon" style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center;">
                                    <img src="${tierImg}" alt="${tier}" style="max-width: 100%; max-height: 100%;" onerror="this.style.display='none'">
                                </div>
                                <div style="text-align: left;">
                                    <div style="font-size: 11px; color: #888; margin-bottom: 2px;">${queueLabel}</div>
                                    <div style="font-size: 20px; font-weight: bold; color: #f1c40f; text-transform: capitalize;">${tier.toLowerCase()} ${rank}</div>
                                    <div style="font-size: 14px; color: #ddd; margin-bottom: 2px;">${lp} LP</div>
                                    <div style="font-size: 12px; color: #aaa;">
                                        ${wins}승 ${losses}패 (<span style="color: ${winRateColor}">${winRate}%</span>)
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        leagueHtml = `
                            <div class="league-info" style="display: flex; align-items: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 20px; border-radius: 8px; min-width: 200px;">
                                <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #555; font-size: 24px;">?</div>
                                <div style="text-align: left;">
                                    <div style="font-size: 11px; color: #888;">${queueLabel}</div>
                                    <div style="font-size: 16px; color: #aaa;">Unranked</div>
                                </div>
                            </div>
                        `;
                    }
                } catch (e) {
                    console.warn('League info load failed', e); 
                    leagueHtml = `<div style="padding: 15px; color: #e74c3c; font-size: 14px; background: rgba(0,0,0,0.3); border-radius: 8px;">랭크 정보 로드 실패</div>`;
                }
            } else {
                console.warn('Summoner ID is missing:', s);
                leagueHtml = `
                    <div class="league-info" style="display: flex; align-items: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 20px; border-radius: 8px; min-width: 200px;">
                        <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #555; font-size: 24px;">?</div>
                        <div style="text-align: left;">
                            <div style="font-size: 11px; color: #888;">Ranked TFT</div>
                            <div style="font-size: 14px; color: #aaa;">랭크 정보 없음</div>
                        </div>
                    </div>
                `;
            }

            summonerCard.innerHTML = `
                <div class="summoner-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; background: rgba(0,0,0,0.6); padding: 20px; border-radius: 8px; width: 100%;">
                    <div class="profile-container" style="display: flex; align-items: center; gap: 20px;">
                        <div class="profile-icon-wrapper" style="position: relative;">
                            <img src="${profileIconUrl}" alt="Profile Icon" style="width: 80px; height: 80px; border-radius: 12px; border: 2px solid #c8aa6e;">
                            <div class="level-badge" style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #111; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px; border: 1px solid #444; white-space: nowrap;">Lv.${s.summonerLevel}</div>
                        </div>
                        <div class="profile-info">
                            <h3 style="font-size: 24px; margin: 0 0 5px 0; color: #fff;">${s.name}<span style="color:#999; font-size: 18px; font-weight: normal;"> #${s.tag || ''}</span></h3>
                            <button id="btn-update" style="padding: 6px 12px; background: #3498db; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">전적 갱신</button>
                        </div>
                    </div>
                    ${leagueHtml}
                </div>
            `;

            // [추가] 전적 갱신 버튼 이벤트 연결
            const btnUpdate = document.getElementById('btn-update');
            if (btnUpdate) {
                btnUpdate.addEventListener('click', () => {
                    btnUpdate.disabled = true;
                    btnUpdate.textContent = '갱신 중...';
                    btnUpdate.style.background = '#7f8c8d';
                    init(true); // 캐시 무시하고 새로고침
                });
            }

            // [추가] 정적 데이터(챔피언, 특성) 로드
            await loadStaticData();

            // 초기 매치 로드
            await loadMatches(true);

        } catch (err) {
            renderError(summonerCard, '데이터 로드 실패: ' + err.message);
            matchList.innerHTML = '';
        }
    }

    async function loadStaticData() {
        try {
            const version = await window.DD.getVersion();
            const lang = 'ko_KR';
            
            // 챔피언 데이터 로드
            const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-champion.json`);
            if (champRes.ok) {
                const json = await champRes.json();
                tftChampions = json.data;
            }

            // 특성 데이터 로드
            const traitRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-trait.json`);
            if (traitRes.ok) {
                const json = await traitRes.json();
                tftTraits = json.data;
            }

            // [추가] 아이템 데이터 로드 (챔피언처럼 직접 관리)
            try {
                // 1. 일반 아이템
                const itemRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/item.json`);
                const itemJson = itemRes.ok ? await itemRes.json() : { data: {} };

                // 2. TFT 아이템 (버전 실패 시 Fallback)
                let tftItemJson = { data: {} };
                let tftItemRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-item.json`);
                if (!tftItemRes.ok) tftItemRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/13.21.1/data/${lang}/tft-item.json`);
                if (tftItemRes.ok) tftItemJson = await tftItemRes.json();

                // 병합
                tftItems = { ...itemJson.data, ...tftItemJson.data };
            } catch (e) { console.warn('Item data load failed', e); }
        } catch (e) {
            console.warn('Static data load failed', e);
        }
    }

    // [추가] lolchess.gg 스타일의 상대적 시간 계산 함수
    function timeAgo(timestamp) {
        if (!timestamp) return '';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "년 전";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "달 전";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "일 전";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "시간 전";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "분 전";
        return "방금 전";
    }

    // [추가] 라운드 포맷팅 함수 (1스테이지 4라운드, 이후 7라운드 규칙)
    function formatRound(roundNum) {
        if (!roundNum) return '-';
        const r = parseInt(roundNum, 10);
        if (isNaN(r)) return '-';
        
        if (r <= 4) {
            return `1-${r}`;
        } else {
            const excess = r - 4;
            const stage = 1 + Math.ceil(excess / 7);
            const round = excess % 7 === 0 ? 7 : excess % 7;
            return `${stage}-${round}`;
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
            const qId = (m.info || m).queue_id || (m.info || m).queueId;
            if (currentFilter === 'ranked') return qId === 1100;
            if (currentFilter === 'normal') return qId === 1090;
            return true;
        });

        // [추가] 통계 렌더링 (필터링된 데이터 기준)
        renderStats(filtered);

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
            const summaryHtml = renderMatchSummaryHtml(detail, currentPuuid);
            const item = document.createElement('div');
            item.className = 'match-item';
            
            // 요약 영역 (클릭 시 상세 토글)
            const summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = summaryHtml;
            summaryDiv.style.cursor = 'pointer';
            
            // 상세 영역 (기본 숨김)
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'match-details';
            detailsDiv.style.display = 'none';
            detailsDiv.innerHTML = renderMatchDetailHtml(detail, currentPuuid);

            summaryDiv.addEventListener('click', () => {
                const isHidden = detailsDiv.style.display === 'none';
                detailsDiv.style.display = isHidden ? 'block' : 'none';
            });

            item.appendChild(summaryDiv);
            item.appendChild(detailsDiv);
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
        // tftChampions는 loadStaticData()에서 이미 로드됨

        // item images
        const itemImgs = container.querySelectorAll('img[data-item-id]');
        await Promise.all(Array.from(itemImgs).map(async (img) => {
            const id = img.dataset.itemId;
            
            // [수정] 로컬 tftItems에서 데이터 찾기 (챔피언 로직과 동일하게 직접 제어)
            let itemData = tftItems[id]; // 1. 키로 직접 검색
            if (!itemData) {
                // 2. id 프로퍼티로 검색 (TFT 아이템)
                const key = Object.keys(tftItems).find(k => tftItems[k].id == id);
                if (key) itemData = tftItems[key];
            }

            let fileName = `${id}.png`;
            if (itemData && itemData.image && itemData.image.full) {
                fileName = itemData.image.full;
            }

            // [수정] 로컬 아이템 이미지 사용
            img.src = `img/items/${fileName}`;
            
            // 툴팁 데이터 설정
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
                // 로컬 로드 실패 시 Data Dragon CDN 사용 (Fallback)
                this.onerror = null; // 무한 루프 방지
                // 1차 시도: 일반 아이템 경로
                this.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${fileName}`;
                
                this.onerror = function() {
                    // 2차 시도: TFT 아이템 경로 (일부 특수 아이템)
                    this.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/tft-item/${fileName}`;
                    this.onerror = function() {
                        // 3차 시도: CommunityDragon (lolchess.gg 등에서 많이 사용하는 원본 소스)
                        const cdFileName = fileName.toLowerCase().replace('.png', '') + '.png';
                        this.src = `https://raw.communitydragon.org/latest/game/assets/items/icons2d/${cdFileName}`;
                        
                        this.onerror = function() {
                            // 4차 시도: TFT Standard Items (CDragon)
                            this.src = `https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/standard/${cdFileName}`;
                            
                            this.onerror = function() {
                                // 5차 시도: TFT Radiant Items (CDragon)
                                this.src = `https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/radiant/${cdFileName}`;
                                
                                // 최후의 수단: 투명도 조절
                                this.onerror = function() { this.style.opacity = 0.3; };
                            };
                        };
                    };
                };
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
            if (Object.keys(tftChampions).length > 0) {
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
            let displayName = charId;
            let tooltipHtml = '';
            const baseName = charId.split('_').pop();

            // TFT 데이터 우선 확인
            let tftData = tftChampions[charId];
            if (!tftData) {
                 const key = Object.keys(tftChampions).find(k => k === charId || k.endsWith(`_${baseName}`) || k === baseName);
                 if (key) tftData = tftChampions[key];
            }
            if (tftData) {
                displayName = tftData.name;
                tooltipHtml = `<strong>${displayName}</strong>`;
                if (tftData.ability) {
                    const abilityName = tftData.ability.name || '';
                    const abilityDesc = tftData.ability.desc || '';
                    if (abilityName) tooltipHtml += `<div style="color: #ffd700; font-size: 11px; margin-top: 4px;">${abilityName}</div>`;
                    if (abilityDesc) tooltipHtml += `<div style="font-size: 10px; color: #ccc; margin-top: 4px; max-width: 220px; white-space: normal; line-height: 1.3;">${abilityDesc}</div>`;
                }
            } else {
                displayName = window.DD.normalizeUnitCharacterId(charId);
                tooltipHtml = `<strong>${displayName}</strong>`;
            }
            
            div.dataset.tooltip = tooltipHtml;
            div.addEventListener('mouseenter', (ev) => showTooltip(div.dataset.tooltip, ev.pageX, ev.pageY));
            div.addEventListener('mousemove', (ev) => showTooltip(div.dataset.tooltip, ev.pageX, ev.pageY));
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
        const companionElems = container.querySelectorAll('.companion-root');
        companionElems.forEach((el) => {
            const species = (el.dataset.species || '').toLowerCase();
            const skinId = el.dataset.skinId || '1';
            if (!species) return;
            
            // URL 후보군 (우선순위 순서대로 시도)
            const urls = [
                // 1. 툴팁용 이미지 (가장 깔끔함, 예: tooltip_petpengu_tier1.png)
                `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_${species}_tier${skinId}.png`,
                // 2. 기본 티어 이미지 (예: petpengu_tier1.png)
                `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/${species}_tier${skinId}.png`,
                // 3. 종족 기본 이미지 (예: petpengu.png)
                `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/${species}.png`,
                // 4. 미니 챔피언 등 캐릭터 경로 (예: chibiashe_square.png)
                `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${species}/hud/${species}_square.png`
            ];

            const img = document.createElement('img');
            img.width = 48; img.height = 48;
            img.style.borderRadius = '50%'; // 원형으로 예쁘게 표시
            img.style.border = '2px solid #444';
            
            let currentIdx = 0;
            const tryNext = () => {
                if (currentIdx >= urls.length) return; // 모든 경로 실패 시 포기
                img.src = urls[currentIdx++];
            };

            img.onload = function() {
                el.innerHTML = ''; // 텍스트("동반자: ...")를 지우고 이미지만 표시
                el.appendChild(this);
                el.title = species; // 마우스 오버 시 이름 표시
            };
            img.onerror = function() {
                tryNext(); // 로드 실패 시 다음 URL 시도
            };
            
            tryNext(); // 첫 번째 시도 시작
        });
    }

    function renderMatchSummaryHtml(detail, puuid) {
        const info = detail.info || detail;
        const participant = (info.participants || []).find(p => p.puuid === puuid);
        if (!participant) return `<div>해당 매치에서 소환사 정보를 찾을 수 없습니다.</div>`;

        const queueName = QUEUE_MAP[info.queue_id || info.queueId] || '기타';
        const placement = participant.placement ?? participant.companion?.placement ?? '-';
        
        // [추가] 순위에 따른 왼쪽 테두리 색상 지정
        let rankColor = '#95a5a6'; // 5~8등 (회색)
        if (placement === 1) rankColor = '#f1c40f';      // 1등 (골드)
        else if (placement === 2) rankColor = '#bdc3c7'; // 2등 (실버)
        else if (placement === 3) rankColor = '#cd7f32'; // 3등 (동)
        else if (placement === 4) rankColor = '#2ecc71'; // 4등 (그린)

        const gameLength = info.game_length || info.gameLength || 0;
        const timeStr = gameLength ? Math.round(gameLength / 60) + '분' : '-';
        const lastRoundStr = formatRound(participant.last_round);
        const lastRound = participant.last_round ? `라운드 ${lastRoundStr}` : '';
        const timeAgoStr = timeAgo(info.game_datetime); // [추가] 상대적 시간
        
        // [수정] 시너지(특성)를 스타일 배지로 표시
        // API style: 0=None, 1=Bronze, 2=Silver, 3=Gold, 4=Chromatic
        const traitsHtml = (participant.traits || [])
            .filter(t => (t.tier_current ?? 0) > 0) // 활성화된 특성만
            .sort((a, b) => b.style - a.style || b.num_units - a.num_units) // 높은 등급 우선 정렬
            .map(t => {
                // [수정] 특성 이름 한글화
                let traitName = t.name;
                if (tftTraits[t.name]) traitName = tftTraits[t.name].name;
                else traitName = traitName.replace(/^TFT\d+_/, '');
                
                // [수정] 시너지 스타일(색상) 결정
                let bgColor = '#333';
                let textColor = '#fff';
                
                if (t.tier_total === 1) {
                    bgColor = '#ff8c00'; // 고유 시너지 (주황)
                } else {
                    switch (t.style) {
                        case 1: bgColor = '#a0522d'; break; // Bronze
                        case 2: bgColor = '#95a5a6'; break; // Silver
                        case 3: bgColor = '#f1c40f'; break; // Gold
                        case 4: bgColor = '#f1c40f'; break; // Gold (요청 반영: 6필트오버, 7데마시아 등)
                        case 5: bgColor = '#e056fd'; break; // Prismatic
                        default: bgColor = '#333'; break;
                    }
                }

                return `<div class="match-trait" style="background-color: ${bgColor}; color: ${textColor}; padding: 2px 6px; border-radius: 4px; margin-bottom: 2px; font-size: 11px; display: flex; align-items: center; justify-content: space-between;" title="${traitName}">
                    <span style="font-weight: bold; margin-right: 4px;">${t.num_units}</span>
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;">${traitName}</span>
                </div>`;
            }).join('');

        const augmentsHtml = (participant.augments || []).map(aug => 
            `<img class="augment-img" data-augment-id="${aug}" alt="${aug}" width="24" height="24" style="opacity:0; margin: 1px; border-radius: 4px; border: 1px solid #444;">`
        ).join('');

        // units -> placeholders (we'll populate images after inserting)
        const units = (participant.units || []).map(u => {
            const uname = (u.character_id || u.name || u.unitId || 'unknown');
            
            // [수정] 유닛 이름 한글화 및 별(Star) 표시
            let displayName = uname;
            const baseName = uname.split('_').pop();

            // TFT 데이터에서 이름 찾기
            const key = Object.keys(tftChampions).find(k => k === uname || k.endsWith(`_${baseName}`) || k === baseName);
            if (key && tftChampions[key]) displayName = tftChampions[key].name;
            else displayName = baseName;

            const tier = u.tier || 1;
            const starColor = tier === 3 ? '#ffd700' : (tier === 2 ? '#c0c0c0' : '#cd7f32');
            const starsHtml = tier > 0 ? `<div style="color:${starColor}; font-size:10px; line-height:1; margin-bottom:2px;">${'★'.repeat(tier)}</div>` : '';

            const itemsHtml = (u.items || []).map(it => `<img class="item" data-item-id="${it}" alt="item-${it}" width="16" height="16" style="margin:1px;">`).join('');
            return `
                <div class="unit" style="text-align:center; width:50px;">
                    ${starsHtml}
                    <div class="unit-img" data-char-id="${uname}" style="width:48px; height:48px; background-color:#333; border-radius:4px; opacity:0; overflow:hidden; margin:0 auto;"></div>
                    <span class="unit-name" style="display:block; font-size:11px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${displayName}</span>
                    <div class="items" style="display:flex; justify-content:center; flex-wrap:wrap; margin-top:2px;">${itemsHtml}</div>
                </div>
            `;
        }).join('');

        // [수정] 동반자 정보 상세화 (species, skin_ID 활용)
        const comp = participant.companion || {};
        const species = comp.species || comp.name || '';
        const skinId = comp.skin_ID || 1;
        const companionHtml = species ? 
            `<div class="companion-root" data-species="${species}" data-skin-id="${skinId}" style="width:40px; height:40px; margin-bottom:4px;"></div>` : '';

        // [수정] lolchess.gg 스타일 레이아웃 적용
        return `
            <div class="match-summary" style="display: flex; align-items: center; border-left: 6px solid ${rankColor}; background: rgba(0,0,0,0.4); margin-bottom: 8px; padding: 8px; border-radius: 4px;">
                <!-- 1. 정보 (순위, 모드, 시간) -->
                <div class="match-meta" style="width: 100px; display: flex; flex-direction: column; font-size: 12px; color: #aaa; margin-right: 10px;">
                    <div class="placement" style="font-size: 18px; font-weight: bold; color: #fff;">#${placement}</div>
                    <div class="queue-type" style="font-weight: bold; margin-bottom: 2px;">${queueName}</div>
                    <div class="time-ago">${timeAgoStr}</div>
                    <div class="game-len">${timeStr}</div>
                    <div class="last-round" style="font-size: 11px; color: #888;">${lastRound}</div>
                    <div class="total-damage" style="font-size: 11px; color: #aaa;">피해: ${participant.total_damage_to_players}</div>
                </div>

                <!-- 2. 아바타 & 증강체 -->
                <div class="match-avatar" style="width: 60px; display: flex; flex-direction: column; align-items: center; margin-right: 15px;">
                    ${companionHtml}
                    <div class="augments" style="display: flex; flex-wrap: wrap; justify-content: center; width: 60px;">${augmentsHtml}</div>
                </div>

                <!-- 3. 유닛 리스트 (메인) -->
                <div class="unit-list" style="flex: 1; display: flex; flex-wrap: wrap; gap: 4px;">
                    ${units || '<div style="color:#666; font-size:12px;">유닛 정보 없음</div>'}
                </div>

                <!-- 4. 특성 (우측) -->
                <div class="match-traits" style="width: 140px; display: flex; flex-direction: column; gap: 2px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 10px; margin-left: 10px;">
                    ${traitsHtml || '<span style="color:#666; font-size:12px;">활성 특성 없음</span>'}
                </div>
            </div>
        `;
    }

    function renderMatchDetailHtml(detail, myPuuid) {
        const info = detail.info || detail;
        const participants = info.participants || [];
        
        // 순위순 정렬
        const sorted = [...participants].sort((a, b) => a.placement - b.placement);
        
        // [추가] 그래프 비율 계산을 위한 최대 피해량 구하기
        const maxDamage = Math.max(...participants.map(p => p.total_damage_to_players || 0), 1);

        const rows = sorted.map(p => {
            const isMe = p.puuid === myPuuid;
            const bgStyle = isMe ? 'background-color: rgba(255, 255, 255, 0.05);' : '';
            
            // [추가] 증강체 HTML 생성
            const augmentsHtml = (p.augments || []).map(aug => 
                `<img class="augment-img" data-augment-id="${aug}" alt="${aug}" width="20" height="20" style="margin: 1px; border-radius: 2px; border: 1px solid #444; vertical-align: middle;">`
            ).join('');

            // 특성
            const traits = (p.traits || [])
                .filter(t => t.tier_current > 0)
                .sort((a, b) => b.style - a.style)
                .map(t => {
                    // [수정] 특성 한글화
                    let name = t.name;
                    if (tftTraits[name]) name = tftTraits[name].name;
                    else name = name.replace(/^TFT\d+_/, '');
                    
                    // [추가] 시너지 스타일(색상) 결정 (상세 정보 테이블용)
                    let bgColor = 'transparent';
                    let textColor = '#aaa';
                    let border = '1px solid #444';
                    
                    if (t.tier_total === 1) {
                        bgColor = '#ff8c00'; textColor = '#fff'; border = 'none';
                    } else {
                        switch (t.style) {
                            case 1: bgColor = '#a0522d'; textColor = '#fff'; border = 'none'; break;
                            case 2: bgColor = '#95a5a6'; textColor = '#fff'; border = 'none'; break;
                            case 3: bgColor = '#f1c40f'; textColor = '#000'; border = 'none'; break;
                            case 4: bgColor = '#f1c40f'; textColor = '#000'; border = 'none'; break; // Gold
                            case 5: bgColor = '#e056fd'; textColor = '#fff'; border = 'none'; break; // Prismatic
                        }
                    }

                    return `<span style="display:inline-block; margin-right:4px; margin-bottom:2px; padding:2px 4px; border-radius:3px; font-size:10px; background-color:${bgColor}; color:${textColor}; border:${border};" title="${name}">${t.num_units} ${name}</span>`;
                }).join('');

            // 유닛 (populateImages가 .unit-img 클래스를 처리함)
            const units = (p.units || []).map(u => {
                const charId = u.character_id || u.name || 'unknown';
                // [수정] 별 표시 추가
                const tier = u.tier || 1;
                const starColor = tier === 3 ? '#ffd700' : (tier === 2 ? '#c0c0c0' : '#cd7f32');
                
                // [추가] 상세 정보 내 아이템 표시
                const itemsHtml = (u.items || []).map(it => 
                    `<img class="item" data-item-id="${it}" alt="${it}" width="12" height="12" style="margin:0 1px; vertical-align:bottom;">`
                ).join('');

                return `<div style="display:inline-block; text-align:center; margin-right:6px; vertical-align:top;">
                    <div style="font-size:9px; color:${starColor}; line-height:1;">${'★'.repeat(tier)}</div>
                    <div class="unit-img" data-char-id="${charId}" style="width:32px; height:32px; background:#333; border-radius:4px; vertical-align:middle; margin-bottom:2px;"></div>
                    <div style="min-height:12px; line-height:0;">${itemsHtml}</div>
                </div>`;
            }).join('');

            // [추가] 딜량 그래프 생성
            const damage = p.total_damage_to_players || 0;
            const barWidth = Math.round((damage / maxDamage) * 100);

            return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); ${bgStyle}">
                    <td style="padding: 8px; text-align: center;">#${p.placement}</td>
                    <td style="padding: 8px; text-align: center;">${p.level}</td>
                    <td style="padding: 8px; text-align: center;">${formatRound(p.last_round)}</td>
                    <td style="padding: 8px; text-align: center;">${augmentsHtml}</td>
                    <td style="padding: 8px;">${units}</td>
                    <td style="padding: 8px;">${traits}</td>
                    <td style="padding: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;" title="피해량: ${damage}">
                            <div style="flex: 1; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden;">
                                <div style="width: ${barWidth}%; height: 100%; background: #e74c3c;"></div>
                            </div>
                            <span style="font-size: 11px; min-width: 24px; text-align: right; color: #ddd;">${damage}</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div style="padding: 10px; background-color: rgba(0, 0, 0, 0.2); border-radius: 4px; margin-top: 5px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #ddd;">
                    <thead>
                        <tr style="background-color: rgba(0,0,0,0.3); text-align: left;">
                            <th style="padding: 8px; text-align: center; width: 30px;">#</th>
                            <th style="padding: 8px; text-align: center; width: 30px;">Lv</th>
                            <th style="padding: 8px; text-align: center; width: 40px;">R</th>
                            <th style="padding: 8px; text-align: center;">증강</th>
                            <th style="padding: 8px;">유닛</th>
                            <th style="padding: 8px;">특성</th>
                            <th style="padding: 8px; width: 100px;">피해량</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    // [추가] 통계 렌더링 함수 (MetaTFT 스타일)
    function renderStats(matches) {
        let statsContainer = document.getElementById('match-stats');
        if (!statsContainer) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'match-stats';
            // match-list 바로 위에 삽입
            matchList.parentNode.insertBefore(statsContainer, matchList);
        }

        if (!matches || matches.length === 0) {
            statsContainer.style.display = 'none';
            return;
        }
        statsContainer.style.display = 'block';

        // 통계 변수 초기화
        let totalPlacement = 0;
        let top4Count = 0;
        let winCount = 0;
        const traitCounts = {};
        const unitCounts = {};

        // 데이터 집계
        matches.forEach(m => {
            const info = m.info || m;
            const p = (info.participants || []).find(p => p.puuid === currentPuuid);
            if (!p) return;

            const place = p.placement;
            totalPlacement += place;
            if (place <= 4) top4Count++;
            if (place === 1) winCount++;

            // 특성 집계
            (p.traits || []).forEach(t => {
                if (t.tier_current > 0) {
                    let name = t.name;
                    if (tftTraits[name]) name = tftTraits[name].name;
                    else name = name.replace(/^TFT\d+_/, '');
                    traitCounts[name] = (traitCounts[name] || 0) + 1;
                }
            });

            // 유닛 집계
            (p.units || []).forEach(u => {
                const charId = u.character_id || u.name || 'unknown';
                let name = charId;
                const baseName = charId.split('_').pop();
                const key = Object.keys(tftChampions).find(k => k === charId || k.endsWith(`_${baseName}`) || k === baseName);
                if (key && tftChampions[key]) name = tftChampions[key].name;
                else name = baseName;
                
                unitCounts[name] = (unitCounts[name] || 0) + 1;
            });
        });

        // 계산
        const count = matches.length;
        const avgPlacement = (totalPlacement / count).toFixed(1);
        const top4Rate = Math.round((top4Count / count) * 100);
        const winRate = Math.round((winCount / count) * 100);

        // 정렬 (Top 3 특성, Top 5 챔피언)
        const topTraits = Object.entries(traitCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const topUnits = Object.entries(unitCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // HTML 렌더링
        statsContainer.innerHTML = `
            <div style="background: rgba(0,0,0,0.6); padding: 20px; border-radius: 8px; margin-bottom: 20px; color: #ecf0f1; display: flex; flex-wrap: wrap; gap: 20px; border: 1px solid #444;">
                <!-- 1. 종합 요약 -->
                <div style="flex: 1; min-width: 200px; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 20px;">
                    <h4 style="margin: 0 0 15px 0; font-size: 14px; color: #bdc3c7;">최근 ${count}게임 분석</h4>
                    <div style="display: flex; justify-content: space-between; text-align: center;">
                        <div>
                            <div style="font-size: 28px; font-weight: bold; color: #fff;">${avgPlacement}</div>
                            <div style="font-size: 12px; color: #95a5a6;">평균 등수</div>
                        </div>
                        <div>
                            <div style="font-size: 28px; font-weight: bold; color: ${top4Rate >= 50 ? '#2ecc71' : '#fff'};">${top4Rate}%</div>
                            <div style="font-size: 12px; color: #95a5a6;">Top 4</div>
                        </div>
                        <div>
                            <div style="font-size: 28px; font-weight: bold; color: ${winRate > 0 ? '#f1c40f' : '#fff'};">${winRate}%</div>
                            <div style="font-size: 12px; color: #95a5a6;">승률</div>
                        </div>
                    </div>
                </div>

                <!-- 2. 선호 특성 -->
                <div style="flex: 1; min-width: 180px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #bdc3c7;">선호 특성 (Top 3)</h4>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${topTraits.map(([name, cnt]) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                                <span style="display: flex; align-items: center; gap: 6px;">
                                    <span style="width: 6px; height: 6px; background: #f1c40f; border-radius: 50%;"></span>
                                    ${name}
                                </span>
                                <span style="color: #aaa;">${cnt}게임 (${Math.round(cnt/count*100)}%)</span>
                            </div>
                        `).join('') || '<div style="font-size:12px; color:#666;">데이터 없음</div>'}
                    </div>
                </div>

                <!-- 3. 선호 챔피언 -->
                <div style="flex: 1; min-width: 180px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #bdc3c7;">선호 챔피언 (Top 5)</h4>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${topUnits.map(([name, cnt]) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                                <span style="display: flex; align-items: center; gap: 6px;">
                                    <span style="width: 6px; height: 6px; background: #3498db; border-radius: 50%;"></span>
                                    ${name}
                                </span>
                                <span style="color: #aaa;">${cnt}게임</span>
                            </div>
                        `).join('') || '<div style="font-size:12px; color:#666;">데이터 없음</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    init();
});
