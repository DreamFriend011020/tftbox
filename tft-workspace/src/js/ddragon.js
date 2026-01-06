// 간단한 Data Dragon 유틸 (서버 프록시 우선, 실패하면 CDN 직접 사용)
// 전역으로 사용: window.DD.getChampionImageUrl(...) 등
window.DD = (function () {
    const cache = { version: null, itemData: null, champData: null, augmentData: null };
    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
    }
    async function getVersion() {
        if (cache.version) return cache.version;
        try {
            const j = await fetchJson('/api/ddragon/version');
            cache.version = j.version;
            return cache.version;
        } catch (e) {
            const r = await fetchJson('https://ddragon.leagueoflegends.com/api/versions.json');
            cache.version = r[0];
            return cache.version;
        }
    }

    async function loadLocaleData(locale = 'ko_KR') {
        // item + champion 데이터(로컬라이즈된 이름/description) 캐시
        if (cache.itemData && cache.champData && cache.locale === locale) return;
        try {
            const [itemJson, champJson, augmentJson] = await Promise.all([
                fetchJson(`/api/ddragon/data/${locale}/item.json`),
                fetchJson(`/api/ddragon/data/${locale}/champion.json`),
                fetchJson(`/api/ddragon/data/${locale}/tft-augments.json`).catch(() => ({ data: {} }))
            ]);
            // item: itemJson.data is map of id->info
            cache.itemData = itemJson.data || {};
            cache.champData = champJson.data || {};
            cache.augmentData = augmentJson.data || {};
            cache.locale = locale;
        } catch (e) {
            // fallback: do nothing, leave cache as null
            console.warn('loadLocaleData failed', e);
        }
    }

    async function getItemImageUrl(id) {
        try {
            const res = await fetch(`/api/ddragon/item/${encodeURIComponent(id)}`);
            if (res.ok) {
                const j = await res.json();
                return j.url;
            }
        } catch (e) {}
        const v = await getVersion();
        return `https://ddragon.leagueoflegends.com/cdn/${v}/img/item/${encodeURIComponent(id)}.png`;
    }

    async function getChampionImageUrl(name) {
        try {
            const res = await fetch(`/api/ddragon/champion/${encodeURIComponent(name)}`);
            if (res.ok) {
                const j = await res.json();
                return j.url;
            }
        } catch (e) {}
        const v = await getVersion();
        return `https://ddragon.leagueoflegends.com/cdn/${v}/img/champion/${encodeURIComponent(name)}.png`;
    }

    async function getAugmentImageUrl(id) {
        // id 예: TFT9_Augment_Commander
        // tft-augments.json에 이미지 파일명이 매핑되어 있을 수 있음
        let filename = id + '.png';
        if (cache.augmentData && cache.augmentData[id] && cache.augmentData[id].image) {
            filename = cache.augmentData[id].image.full;
        }
        const v = await getVersion();
        return `https://ddragon.leagueoflegends.com/cdn/${v}/img/tft-augment/${filename}`;
    }

    function normalizeUnitCharacterId(charId) {
        if (!charId) return charId;
        const m = charId.match(/_([A-Za-z0-9' ]+)$/);
        if (m) return m[1];
        return charId.replace(/^TFT.*_/i, '');
    }

    async function getUnitImageUrl(characterId) {
        const name = normalizeUnitCharacterId(characterId);
        return getChampionImageUrl(name);
    }

    // locale data accessors
    function getItemDataById(id) {
        if (!cache.itemData) return null;
        // item.json keys are string ids
        return cache.itemData[String(id)] || null;
    }
    function getChampionDataByKey(keyName) {
        if (!cache.champData) return null;
        // champion.json keys are champion names like "Aatrox"
        return cache.champData[keyName] || null;
    }
    function getAugmentData(id) {
        if (!cache.augmentData) return null;
        return cache.augmentData[id] || null;
    }

    return {
        getVersion,
        getChampionImageUrl,
        getItemImageUrl,
        getUnitImageUrl,
        normalizeUnitCharacterId,
        getAugmentImageUrl,
        loadLocaleData,
        getItemDataById,
        getChampionDataByKey,
        getAugmentData
    };
})();
