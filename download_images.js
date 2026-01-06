// download_images.js
const fs = require('fs');
const path = require('path');

// 저장할 경로 설정 (tft-workspace/src/img/champions)
const SAVE_DIR = path.join(__dirname, 'tft-workspace', 'src', 'img', 'champions');
const ITEM_SAVE_DIR = path.join(__dirname, 'tft-workspace', 'src', 'img', 'items');

// 폴더가 없으면 생성
if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
}
if (!fs.existsSync(ITEM_SAVE_DIR)) {
    fs.mkdirSync(ITEM_SAVE_DIR, { recursive: true });
}

async function downloadFile(url, dest) {
    // 5초 타임아웃 설정 (무한 대기 방지)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

    if (!res.ok) {
        throw new Error(`Status Code: ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(dest, buffer);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

async function main() {
    try {
        console.log('1. 최신 버전 확인 중...');
        const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await verRes.json();
        const version = versions[0];
        console.log(`   - 최신 버전: ${version}`);

        console.log('2. 챔피언 데이터 가져오는 중...');
        // 데이터가 없을 경우를 대비해 안정적인 버전(13.21.1) 사용 로직 포함 가능하나, 여기선 최신 시도
        let champData;
        try {
            const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/tft-champion.json`);
            if (!res.ok) throw new Error('Fetch failed');
            const json = await res.json();
            champData = json.data;
        } catch (e) {
            console.log('   - 최신 버전 데이터 없음, 안정적인 버전(13.21.1)으로 시도...');
            const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/13.21.1/data/ko_KR/tft-champion.json`);
            const json = await res.json();
            champData = json.data;
        }

        console.log(`3. 이미지 다운로드 시작 (총 ${Object.keys(champData).length}개)`);
        
        let successCount = 0;
        let failCount = 0;
        let skipCount = 0;

        for (const key of Object.keys(champData)) {
            // 튜토리얼 유닛 제외
            if (key.toLowerCase().includes('tutorial')) {
                continue;
            }

            // URL 생성 로직 (main.js와 동일)
            const setMatch = key.match(/TFT(\d+)/i);
            const setNum = setMatch ? setMatch[1] : '9';
            let baseId = key.replace(/^TFT\d+_/, '').toLowerCase();

            // 키에 경로(/)가 포함된 경우 파일명만 추출 (디렉토리 생성 오류 방지)
            if (baseId.includes('/')) {
                baseId = baseId.split('/').pop();
            }
            
            // 저장할 파일명 (예: ryze.png)
            const fileName = `${baseId}.png`;
            const filePath = path.join(SAVE_DIR, fileName);

            // 이미 존재하면 스킵 (덮어쓰려면 주석 처리)
            if (fs.existsSync(filePath)) {
                skipCount++;
                continue;
            }
            
            // 시도할 URL 목록 (우선순위 순서대로 시도)
            // Norra 등 TFT 전용 유닛을 위해 원본 ID(key)를 이용한 경로도 추가
            const urls = [
                `https://cdn.metatft.com/file/metatft/champions/tft${setNum}_${baseId}.png`, // 1. MetaTFT (가장 빠름)
                `https://raw.communitydragon.org/latest/game/assets/characters/${baseId}/hud/${baseId}_square.tft_set${setNum}.png`, // 2. CDragon (세트 스킨)
                `https://raw.communitydragon.org/latest/game/assets/characters/${baseId}/hud/${baseId}_square.png`, // 3. CDragon (기본 스킨)
                `https://raw.communitydragon.org/latest/game/assets/characters/${baseId}/hud/${baseId}.png` // 4. CDragon (대체 경로)
            ];

            let downloaded = false;
            for (const url of urls) {
                try {
                    await downloadFile(url, filePath);
                    console.log(`   [OK] ${fileName}`);
                    downloaded = true;
                    successCount++;
                    break; // 성공하면 중단하고 다음 챔피언으로
                } catch (e) {
                    // 실패하면 다음 URL 시도
                }
            }

            if (!downloaded) {
                console.error(`   [FAIL] ${fileName} (404 Not Found - All sources failed)`);
                failCount++;
            }
        }

        console.log(`\n[챔피언 완료] 성공: ${successCount}, 실패: ${failCount}, 스킵(이미존재): ${skipCount}`);
        console.log(`저장 경로: ${SAVE_DIR}`);

        // ---------------------------------------------------------
        // 아이템 이미지 다운로드 로직 추가
        // ---------------------------------------------------------
        console.log('\n4. 아이템 데이터 가져오는 중...');
        let itemData = {};
        try {
            const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/tft-item.json`);
            if (res.ok) {
                const json = await res.json();
                itemData = json.data;
            }
        } catch (e) {
            console.log('   - 아이템 데이터 로드 실패');
        }

        console.log(`5. 아이템 이미지 다운로드 시작 (총 ${Object.keys(itemData).length}개)`);
        let itemSuccess = 0;
        let itemFail = 0;
        let itemSkip = 0;

        for (const key of Object.keys(itemData)) {
            const item = itemData[key];
            const fileName = item.image.full; // 예: "1.png"
            const filePath = path.join(ITEM_SAVE_DIR, fileName);
            
            // 아이템 이미지 URL 후보 (TFT 전용 경로 -> LoL 공용 경로)
            const itemUrls = [
                `https://ddragon.leagueoflegends.com/cdn/${version}/img/tft-item/${fileName}`,
                `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${fileName}`,
                `https://raw.communitydragon.org/latest/game/assets/items/icons2d/${fileName.replace('.png', '').toLowerCase()}.png`
            ];

            // 이미 파일이 있어도 0바이트(빈 파일)라면 다시 다운로드
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.size > 0) {
                    itemSkip++;
                    continue;
                }
            }

            let downloaded = false;
            for (const url of itemUrls) {
                try {
                    // console.log(`   [TRY] ${url}`); // 디버깅용
                    await downloadFile(url, filePath);
                    console.log(`   [OK] ${fileName}`);
                    itemSuccess++;
                    downloaded = true;
                    break;
                } catch (e) {
                    // 다음 URL 시도
                }
            }

            if (!downloaded) {
                console.error(`   [FAIL] ${fileName} (All sources failed)`);
                itemFail++;
            }
        }
        
        console.log(`\n[아이템 완료] 성공: ${itemSuccess}, 실패: ${itemFail}, 스킵(이미존재): ${itemSkip}`);

    } catch (error) {
        console.error('스크립트 실행 중 오류 발생:', error);
    }
}

main();
