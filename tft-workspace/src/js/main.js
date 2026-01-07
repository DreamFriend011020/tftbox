// TFT 데이터 로드, 이미지 적용, 시너지 계산, 툴팁 처리
async function initTftApp() {
    // 1. 검색 기능 초기화
    setupSearch();

    const unitIcons = document.querySelectorAll('.unit-icon');
    const itemIcons = document.querySelectorAll('.item-icon');
    const companionIcons = document.querySelectorAll('.companion-icon');
    if (unitIcons.length === 0 && itemIcons.length === 0 && companionIcons.length === 0) return;

    try {
        // 0. 버전 조회 (ddragon.js와 통일하여 버전 불일치 방지)
        let version;
        if (window.DD && typeof window.DD.getVersion === 'function') {
            version = await window.DD.getVersion();
        } else {
            const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
            const versions = await versionRes.json();
            version = versions[0];
        }
        // console.log('현재 적용된 TFT 데이터 버전:', version);
        const lang = 'ko_KR';

        // 1. TFT 데이터 가져오기 (챔피언)
        // 챔피언 데이터 로드
        let champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-champion.json`);
        if (!champRes.ok) {
            console.warn(`[${version}] 챔피언 데이터 로드 실패(${champRes.status}). 안정적인 버전으로 재시도합니다.`);
            const fallbackVersion = '13.21.1'; // Set 9.5 안정화 버전
            champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${fallbackVersion}/data/${lang}/tft-champion.json`);
            if (!champRes.ok) throw new Error(`tft-champion.json 로드 실패: ${champRes.status}`);
            version = fallbackVersion; // 버전 동기화
        }
        const champJson = await champRes.json();
        const champions = champJson.data;

        // [추가] 특성(Traits) 데이터 로드 (시너지 계산용)
        let traitsData = {};
        try {
            let traitRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-trait.json`);
            if (!traitRes.ok) {
                // 버전 불일치 시 안정화 버전 사용
                traitRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/13.21.1/data/${lang}/tft-trait.json`);
            }
            if (traitRes.ok) {
                const traitJson = await traitRes.json();
                traitsData = traitJson.data;
            }
        } catch (e) { console.warn('Traits load failed', e); }

        // 2. 각 아이콘에 이미지 적용
        unitIcons.forEach(icon => {
            const charId = icon.getAttribute('data-char-id'); // 예: "Ryze"
            if (!charId) return;

            // [수정됨] 중복 데이터 중 원하는 데이터(최신 세트, 튜토리얼 제외) 선택 로직
            // 1. 이름이 포함된 모든 키 찾기
            const candidates = Object.keys(champions).filter(key => 
                key === charId || key.endsWith(`_${charId}`)
            );

            let championKey = null;
            if (candidates.length > 0) {
                // 2. 우선순위 정렬: 튜토리얼 제외 -> 세트 번호(TFT숫자)가 높은 순(최신)
                const sorted = candidates
                    .filter(key => !key.includes('Tutorial')) // 튜토리얼 유닛 제외
                    .sort((a, b) => {
                        const getSetNum = (k) => {
                            const match = k.match(/TFT(\d+)/);
                            return match ? parseInt(match[1], 10) : 0;
                        };
                        return getSetNum(b) - getSetNum(a); // 내림차순 (큰 숫자가 먼저)
                    });
                championKey = sorted[0]; // 가장 적합한 하나 선택
            }

            if (championKey) {
                const championData = champions[championKey];
                
                // [수정] MetaTFT CDN을 사용하여 정사각형 아이콘 가져오기
                // 예: TFT9_Ryze -> tft9_ryze.png
                const setMatch = championKey.match(/TFT(\d+)/i);
                const setNum = setMatch ? setMatch[1] : '9'; // 기본값 9
                
                // 기본 이름 추출 (TFT9_Ryze -> ryze)
                const baseIdRaw = championKey.replace(/^TFT\d+_/, '').toLowerCase();
                const baseId = baseIdRaw.includes('/') ? baseIdRaw.split('/').pop() : baseIdRaw;
                
                // [수정] 로컬 이미지 경로 사용 (download_images.js로 다운로드된 파일)
                const localImageUrl = `img/champions/${baseId}.png`;
                // 로컬 파일이 없을 경우를 대비한 Fallback URL
                const fallbackUrl = `https://raw.communitydragon.org/latest/game/assets/characters/${baseId}/hud/${baseId}_square.png`;

                // 로컬 이미지 적용 (에러 시 기본 이미지 처리 가능)
                icon.innerHTML = `
                    <img src="${localImageUrl}" 
                         onerror="this.onerror=null; this.src='${fallbackUrl}';"
                         alt="${championData.name}" 
                         style="width: 100%; height: 100%; object-fit: cover; display: block;">
                `;

                // [추가] 툴팁을 위한 데이터 저장
                icon.dataset.name = championData.name;
                icon.dataset.cost = championData.tier || '?'; // tier가 비용인 경우가 많음 (API 확인 필요, 보통 cost 필드 사용)
                // API 구조상 cost가 없으면 tier 사용. 실제로는 championData.cost가 있을 수 있음.
                // traits는 이름 배열 (예: ["Shurima", "Bastion"])
                icon.dataset.traits = JSON.stringify(championData.traits || []);
                
                // 툴팁 이벤트 리스너
                icon.addEventListener('mouseenter', (e) => showTooltip(e, icon));
                icon.addEventListener('mouseleave', hideTooltip);
                icon.addEventListener('mousemove', (e) => moveTooltip(e));

            } else {
                // TFT 데이터에 없는 경우(혹은 오타) 로컬 기본 경로 시도
                const baseId = charId.toLowerCase();
                const localUrl = `img/champions/${baseId}.png`;
                const fallbackUrl = `https://raw.communitydragon.org/latest/game/assets/characters/${baseId}/hud/${baseId}_square.png`;
                icon.innerHTML = `
                    <img src="${localUrl}" 
                         onerror="this.onerror=null; this.src='${fallbackUrl}';"
                         alt="${charId}" 
                         style="width: 100%; height: 100%; object-fit: cover; display: block;">
                `;
            }
        });

        // 3. 아이템 아이콘 이미지 적용
        itemIcons.forEach(icon => {
            const itemId = icon.getAttribute('data-item-id');
            if (!itemId) return;

            const localUrl = `img/items/${itemId}.png`;
            const fallbackUrl = `https://ddragon.leagueoflegends.com/cdn/latest/img/item/${itemId}.png`;
            icon.innerHTML = `
                <img src="${localUrl}" 
                     onerror="this.onerror=null; this.src='${fallbackUrl}';"
                     alt="Item ${itemId}" 
                     style="width: 100%; height: 100%; object-fit: cover; display: block;">
            `;
        });

        // [추가] 동반자(Little Legend) 아이콘 이미지 적용
        companionIcons.forEach(icon => {
            const companionId = icon.getAttribute('data-companion-id');
            if (!companionId) return;

            const baseId = String(companionId).toLowerCase();
            // CommunityDragon 경로 시도 (loadouts/companions가 일반적)
            const url1 = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/${baseId}.png`;
            // 일부 미니 챔피언 등은 characters 경로에 있을 수 있음 (Fallback)
            const url2 = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/${baseId}/hud/${baseId}_square.png`;

            icon.innerHTML = `
                <img src="${url1}" 
                     onerror="this.onerror=null; this.src='${url2}';"
                     alt="${companionId}" 
                     style="width: 100%; height: 100%; object-fit: cover; display: block;">
            `;
        });

        // 4. 시너지 계산 및 표시
        calculateSynergies(unitIcons, traitsData);

    } catch (error) {
        console.error('TFT 데이터 로드 실패:', error);
    }
}

// 검색 기능 설정 함수
function setupSearch() {
    const input = document.getElementById('summoner-input');
    const btn = document.getElementById('summoner-search-btn');

    if (!input || !btn) return;

    // [추가] 최근 검색 기록 UI 및 로직
    const historyContainer = document.createElement('div');
    historyContainer.className = 'search-history';
    Object.assign(historyContainer.style, {
        position: 'absolute', top: '100%', left: '0', right: '0',
        background: '#2c3e50', border: '1px solid #34495e', borderRadius: '0 0 4px 4px',
        zIndex: '1000', display: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    });
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(historyContainer);

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
            
            // 호버 효과
            item.onmouseenter = () => item.style.background = '#34495e';
            item.onmouseleave = () => item.style.background = 'transparent';
            
            // 클릭 시 검색
            item.onclick = (e) => {
                e.preventDefault(); // 포커스 유지 방지
                input.value = query;
                goSearch();
            };
            historyContainer.appendChild(item);
        });
        historyContainer.style.display = 'block';
    };

    input.addEventListener('focus', renderHistory);
    // blur 시 바로 사라지면 클릭 이벤트가 씹히므로 지연 처리
    input.addEventListener('blur', () => setTimeout(() => historyContainer.style.display = 'none', 200));

    function goSearch() {
        const val = input.value.trim();
        if (!val) return alert('소환사명#태그를 입력해주세요.');
        
        const parts = val.split('#');
        if (parts.length < 2) {
            return alert('소환사명#태그 형식을 지켜주세요. (예: Hide on bush#KR1)');
        }
        
        // [추가] 검색어 저장
        let history = loadHistory();
        history = history.filter(h => h !== val); // 중복 제거
        history.unshift(val); // 최신순
        if (history.length > 5) history.pop(); // 최대 5개
        saveHistory(history);

        const name = parts.slice(0, -1).join('#');
        const tag = parts[parts.length - 1];
        
        window.location.href = `/summoner.html?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`;
    }

    btn.addEventListener('click', goSearch);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') goSearch();
    });
}

// 툴팁 관련 로직
let tooltipEl = null;

function createTooltip() {
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'c-tooltip';
        tooltipEl.style.display = 'none';
        document.body.appendChild(tooltipEl);
    }
}

function showTooltip(e, element) {
    createTooltip();
    const name = element.dataset.name || 'Unknown';
    const cost = element.dataset.cost;
    const traits = JSON.parse(element.dataset.traits || '[]');
    
    tooltipEl.innerHTML = `
        <strong>${name}</strong>
        ${cost && cost !== '?' ? `<div class="tooltip-cost">비용: ${cost}골드</div>` : ''}
        <div class="tooltip-traits">특성: ${traits.join(', ')}</div>
    `;
    
    tooltipEl.style.display = 'block';
    moveTooltip(e);
}

function moveTooltip(e) {
    if (!tooltipEl) return;
    tooltipEl.style.left = (e.pageX + 15) + 'px';
    tooltipEl.style.top = (e.pageY + 15) + 'px';
}

function hideTooltip() {
    if (tooltipEl) tooltipEl.style.display = 'none';
}

// [추가] 시너지 계산 함수
function calculateSynergies(unitIcons, traitsData) {
    const uniqueUnits = new Set();
    const traitCounts = {};

    // 1. 배치된 유닛들의 특성 집계 (중복 유닛 제외)
    unitIcons.forEach(icon => {
        const charId = icon.getAttribute('data-char-id');
        // 유닛 ID가 없거나 이미 집계된 유닛이면 건너뜀 (TFT는 중복 유닛 시너지 미적용이 기본)
        if (!charId || uniqueUnits.has(charId)) return;
        
        uniqueUnits.add(charId);
        const traits = JSON.parse(icon.dataset.traits || '[]');
        traits.forEach(t => {
            traitCounts[t] = (traitCounts[t] || 0) + 1;
        });
    });

    // 2. 활성화된 시너지 계산
    const activeSynergies = [];
    Object.keys(traitCounts).forEach(traitName => {
        // 특성 데이터 찾기 (이름 일치 확인)
        const traitKey = Object.keys(traitsData).find(k => traitsData[k].name === traitName);
        if (!traitKey) return;

        const data = traitsData[traitKey];
        const count = traitCounts[traitName];
        const sets = data.sets || [];
        
        // 현재 개수에 해당하는 등급(style) 찾기 (내림차순 검색)
        const activeSet = sets.sort((a, b) => b.min - a.min).find(s => count >= s.min);
        
        if (activeSet) {
            activeSynergies.push({ name: traitName, count, style: activeSet.style });
        }
    });

    // 3. 결과 출력 (HTML 요소 #synergy-list가 있다고 가정)
    const container = document.getElementById('synergy-list');
    if (container) {
        // 정렬: 등급 높은 순(chromatic > gold > silver > bronze) -> 개수 많은 순
        const styleWeight = { chromatic: 5, prismatic: 5, gold: 4, silver: 3, bronze: 2, none: 1 };
        activeSynergies.sort((a, b) => (styleWeight[b.style] || 0) - (styleWeight[a.style] || 0) || b.count - a.count);
        
        container.innerHTML = activeSynergies.map(s => 
            `<div class="synergy-item ${s.style}"><b>${s.count}</b> ${s.name}</div>`
        ).join('');
    } else {
        console.log('계산된 시너지:', activeSynergies);
    }
}

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', initTftApp);
