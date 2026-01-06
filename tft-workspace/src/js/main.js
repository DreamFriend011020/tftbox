document.addEventListener('DOMContentLoaded', async () => {
    // 1. 유닛 아이콘 이미지 로드
    const unitIcons = document.querySelectorAll('.unit-icon[data-char-id]');
    
    // Data Dragon 버전 확인 (캐시 초기화)
    try {
        await window.DD.getVersion();
    } catch (e) {
        console.error('Data Dragon init failed', e);
    }

    unitIcons.forEach(async (icon) => {
        const charId = icon.dataset.charId;
        try {
            const url = await window.DD.getUnitImageUrl(charId);
            const img = document.createElement('img');
            img.src = url;
            img.alt = charId;
            // 텍스트 대신 이미지만 표시 (원한다면 텍스트를 툴팁으로 변경 가능)
            icon.innerHTML = ''; 
            icon.appendChild(img);
        } catch (e) {
            console.error(`Failed to load image for ${charId}`, e);
        }
    });
    
    // 2. 소환사 검색 기능
    const searchBtn = document.getElementById('summoner-search-btn');
    const searchInput = document.getElementById('summoner-input');
    
    if (searchBtn && searchInput) {
        const doSearch = () => {
            const val = searchInput.value.trim();
            if (!val) return;
            // name#tag 파싱 (간단히)
            const [name, tag] = val.split('#');
            let url = `/summoner.html?name=${encodeURIComponent(name)}`;
            if (tag) url += `&tag=${encodeURIComponent(tag)}`;
            window.location.href = url;
        };
        searchBtn.addEventListener('click', doSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') doSearch();
        });
    }
});
