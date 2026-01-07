document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('item-list');
    const filters = document.getElementById('item-filters');
    const modal = document.getElementById('item-modal');
    const modalBody = document.getElementById('modal-body');
    let allItems = [];
    let version = '';

    try {
        await window.DD.loadLocaleData('ko_KR');
        version = await window.DD.getVersion();
        const lang = 'ko_KR';

        // 아이템 데이터 로드
        let tftItemJson = { data: {} };
        let tftItemRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/tft-item.json`);
        if (!tftItemRes.ok) tftItemRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/13.21.1/data/${lang}/tft-item.json`);
        if (tftItemRes.ok) tftItemJson = await tftItemRes.json();

        // [수정] 협곡 아이템 제외하고 TFT 전용 데이터만 사용
        allItems = Object.values(tftItemJson.data).filter(item => {
            if (item.name.includes('Augment')) return false;
            if (!item.image) return false;
            return true;
        });

        renderItems('all');

    } catch (e) {
        console.error(e);
        container.innerHTML = '<tr><td colspan="4" style="text-align:center;">데이터 로드 실패</td></tr>';
    }

    filters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderItems(e.target.dataset.type);
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

    function renderItems(type) {
        container.innerHTML = '';

        const filtered = allItems.filter(item => {
            const isComponent = (item.from || []).length === 0 && (item.into || []).length > 0 && !item.name.includes('Emblem');
            const isCompleted = (item.from || []).length > 0;
            const isEmblem = item.name.includes('상징') || item.name.includes('Emblem');

            if (type === 'all') return isComponent || isCompleted || isEmblem;
            if (type === 'component') return isComponent;
            if (type === 'completed') return isCompleted && !isEmblem;
            if (type === 'emblem') return isEmblem;
            return true;
        });

        filtered.sort((a, b) => a.name.localeCompare(b.name));

        filtered.forEach(item => {
            const fileName = item.image.full;
            const localImg = `img/items/${fileName}`;
            const cdnImg = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${fileName}`;
            const tftCdnImg = `https://ddragon.leagueoflegends.com/cdn/${version}/img/tft-item/${fileName}`;

            let recipeHtml = '-';
            if (item.from && item.from.length > 0) {
                recipeHtml = item.from.map(id => {
                    const comp = allItems.find(i => i.id == id) || { image: { full: `${id}.png` }, name: '??' };
                    const compUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${comp.image.full}`;
                    return `<img src="${compUrl}" class="recipe-img" title="${comp.name}" alt="${comp.name}">`;
                }).join('<span class="recipe-plus">+</span>');
            }

            const desc = (item.description || '').replace(/<br>/g, ' ').replace(/<[^>]*>/g, '');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="item-icon-cell">
                    <img src="${localImg}" 
                         onerror="this.onerror=null; this.src='${tftCdnImg}'; this.onerror=function(){this.src='${cdnImg}'}" 
                         class="item-img" alt="${item.name}">
                </td>
                <td>
                    <div class="item-name">${item.name}</div>
                </td>
                <td>
                    <div class="item-desc">${desc}</div>
                </td>
                <td>
                    <div class="item-recipe">${recipeHtml}</div>
                </td>
            `;
            
            // 클릭 시 모달 열기
            tr.addEventListener('click', () => showItemDetail(item, localImg, tftCdnImg, cdnImg, recipeHtml, desc));
            tr.style.cursor = 'pointer';
            container.appendChild(tr);
        });

        if (filtered.length === 0) {
            container.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">조건에 맞는 아이템이 없습니다.</td></tr>';
        }
    }

    function showItemDetail(item, localImg, tftCdnImg, cdnImg, recipeHtml, desc) {
        modalBody.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="${localImg}" onerror="this.onerror=null; this.src='${tftCdnImg}'; this.onerror=function(){this.src='${cdnImg}'}" 
                     style="width: 64px; height: 64px; border-radius: 8px; border: 2px solid #c8aa6e; margin-bottom: 10px;">
                <h2 style="color: #f1c40f; margin: 0;">${item.name}</h2>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #ddd; line-height: 1.6; font-size: 14px;">${desc}</p>
            </div>
            <div style="text-align: center;">
                <h3 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">조합식</h3>
                <div style="display: flex; justify-content: center; gap: 10px; align-items: center;">${recipeHtml}</div>
            </div>
        `;
        modal.classList.remove('hidden');
    }
});
