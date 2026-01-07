document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('champion-list');
    const filters = document.getElementById('cost-filters');
    const modal = document.getElementById('champ-modal');
    const modalBody = document.getElementById('modal-body');
    let allChampions = [];
    let tftTraits = {};

    // 1. 데이터 로드
    try {
        await window.DD.loadLocaleData('ko_KR');
        const version = await window.DD.getVersion();
        const lang = 'ko_KR';

        // 챔피언 데이터
        let champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-champion.json`);
        if (!champRes.ok) champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/13.21.1/data/${lang}/tft-champion.json`);
        const champJson = await champRes.json();
        
        // 특성 데이터 (한글 이름용)
        let traitRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-trait.json`);
        if (!traitRes.ok) traitRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/13.21.1/data/${lang}/tft-trait.json`);
        const traitJson = await traitRes.json();
        tftTraits = traitJson.data;

        // 데이터 가공
        const rawChampions = Object.values(champJson.data);

        // [추가] 가장 최신 세트 번호 찾기 (예: TFT13)
        let maxSetNum = 0;
        rawChampions.forEach(c => {
            const match = c.id.match(/^TFT(\d+)/i);
            if (match) {
                const setNum = parseInt(match[1], 10);
                if (setNum > maxSetNum) maxSetNum = setNum;
            }
        });

        allChampions = rawChampions.filter(c => {
            const match = c.id.match(/^TFT(\d+)/i);
            const isCurrentSet = match && parseInt(match[1], 10) === maxSetNum;
            return isCurrentSet && c.tier > 0 && !c.id.toLowerCase().includes('tutorial') && !c.id.toLowerCase().includes('augment');
        });

        // 초기 렌더링
        renderChampions('all');

    } catch (e) {
        console.error(e);
        container.innerHTML = '<tr><td colspan="9" style="text-align:center;">데이터 로드 실패</td></tr>';
    }

    // 2. 필터 이벤트
    filters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderChampions(e.target.dataset.cost);
        }
    });

    // 모달 닫기 이벤트
    document.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    function renderChampions(costFilter) {
        container.innerHTML = '';
        
        const filtered = allChampions.filter(c => {
            if (costFilter === 'all') return true;
            if (costFilter === '5') return c.tier >= 5;
            return c.tier == costFilter;
        });

        // 비용 -> 이름 순 정렬
        filtered.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));

        filtered.forEach((c, index) => {
            // 이미지 경로 생성
            const baseId = c.id.replace(/^TFT\d+_/, '').toLowerCase();
            const localImg = `img/champions/${baseId}.png`;
            const cdnImg = `https://raw.communitydragon.org/latest/game/assets/characters/${baseId}/hud/${baseId}_square.png`;

            // 특성 한글화
            const traitsHtml = (c.traits || []).map(t => {
                let tName = t;
                // 특성 데이터에서 이름 찾기
                const traitData = Object.values(tftTraits).find(td => td.name === t || td.id === t);
                if (traitData) tName = traitData.name;
                return `<span class="trait-badge">${tName}</span>`;
            }).join('');

            // 스탯 정보
            const stats = c.stats || {};
            const hp = stats.hp || '-';
            const mana = stats.mana !== undefined ? `${stats.initialMana}/${stats.mana}` : '-';
            const damage = stats.damage || '-';
            const as = stats.attackSpeed || '-';
            const range = stats.range || '-';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div class="champ-cell">
                        <img src="${localImg}" onerror="this.src='${cdnImg}'" class="champ-img-small cost-${c.tier}" alt="${c.name}">
                        <span class="champ-name">${c.name}</span>
                    </div>
                </td>
                <td><span class="cost-icon cost-bg-${c.tier}">${c.tier}</span></td>
                <td><div class="champ-traits">${traitsHtml}</div></td>
                <td>${hp}</td>
                <td>${mana}</td>
                <td>${damage}</td>
                <td>${as}</td>
                <td>${range}</td>
            `;
            
            // 클릭 시 모달 열기
            tr.addEventListener('click', () => showChampionDetail(c, localImg, cdnImg, traitsHtml));
            container.appendChild(tr);
        });

        if (filtered.length === 0) {
            container.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px;">조건에 맞는 챔피언이 없습니다.</td></tr>';
        }
    }

    function showChampionDetail(c, localImg, cdnImg, traitsHtml) {
        const stats = c.stats || {};
        const ability = c.ability || {};
        const abName = ability.name || '기본 공격';
        const abDesc = (ability.desc || '설명 없음').replace(/<br>/g, ' ').replace(/<[^>]*>/g, '');

        modalBody.innerHTML = `
            <div class="modal-header">
                <img src="${localImg}" onerror="this.src='${cdnImg}'" class="modal-champ-img cost-${c.tier}">
                <div class="modal-title">
                    <h2>${c.name}</h2>
                    <div class="champ-traits" style="margin-top:8px;">${traitsHtml}</div>
                </div>
            </div>
            <div class="modal-stats">
                <div class="modal-stat-item"><span>비용</span><span class="modal-stat-value" style="color:#f1c40f">${c.tier} 골드</span></div>
                <div class="modal-stat-item"><span>체력</span><span class="modal-stat-value">${stats.hp || '-'}</span></div>
                <div class="modal-stat-item"><span>마나</span><span class="modal-stat-value">${stats.mana !== undefined ? `${stats.initialMana}/${stats.mana}` : '-'}</span></div>
                <div class="modal-stat-item"><span>공격력</span><span class="modal-stat-value">${stats.damage || '-'}</span></div>
                <div class="modal-stat-item"><span>공격속도</span><span class="modal-stat-value">${stats.attackSpeed || '-'}</span></div>
                <div class="modal-stat-item"><span>사거리</span><span class="modal-stat-value">${stats.range || '-'}</span></div>
                <div class="modal-stat-item"><span>방어력</span><span class="modal-stat-value">${stats.armor || '-'}</span></div>
                <div class="modal-stat-item"><span>마법저항력</span><span class="modal-stat-value">${stats.magicResist || '-'}</span></div>
            </div>
            <div class="modal-ability">
                <h3>스킬: ${abName}</h3>
                <p>${abDesc}</p>
            </div>
        `;
        modal.classList.remove('hidden');
    }
});
