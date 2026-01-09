export const BLACKLIST_KEYWORDS = [
   // 1. 시스템 및 내부 데이터 (System & Internal Data)
    'Augment', 'TFT_Assist', 'Grant', 'BlankSlot', 'Consumable',
  'Debug', 'Display', 'Tutorial', 'Event', 'TFT_Admin', 'Missing',
  'TFT_Item_Ring', 'TFT_Item_Mystic', 'TFT_Item_Map', 'TFT_Item_Hex',
  'TFT_Item_Blank', 'TFT_Item_Empty', 'TFT_Item_Spawn', 'TFT_Item_Unknown',
  'CypherArmoryItem', 'RecommendedArmory', 'PrototypeForge',

  // 2. 소모품 및 특수 모드 아이템 (Consumables & Special Mode Items)
  'TFT_Item_Consumable', '제거기', '재조합기', 'ShopRefresh', 'BrigandsDice', 
  'BWLesserDuplicator', 'Chonccs', 'ShadowPuppet',

  // 3. 특정 시즌/특성 내부 더미 데이터 (Season/Trait Specific Dummy Data)
  'Storyweaver', 'Inkshadow', 'TFT5_Item_Nomsy', 
  'Bilgewater_A', 'Bilgewater_F', 'Bilgewater_H', // 빌지워터 내부 효과
  'Shimmerscale', 'Mirrored', 'Vampiric', 'JollyRoger', 'DreadwayCannon',

  // 4. 현재 시즌에 사용되지 않는 유물 및 지원 아이템 (Outdated Artifacts & Support Items)
  'DuskbladeOfDraktharr', 'RocketPropelledFist', 'InnervatingLocket', 'BansheesVeil',
  'EternalWinter', 'ZzRotPortal', 'TrickstersGlass', 'DeathfireGrasp', 'SuspiciousTrenchcoat',
  'UnendingDespair', 'SpectralCutlass', 'ForbiddenIdol', 'RanduinsSanctum', 'ObsidianCleaver',
  'TFT_Item_KnightsVow', 'AegisOfTheLegion', 'RadiantVirtue', 'ThiefsGlovesSupport', 
  'SupportKnightsVow', 'Moonstone', 'MendingEchoes'
];
  
  export function getItemCategory(item) {
    const apiName = (item.apiName || String(item.id || "")).toLowerCase();
    const name = item.name || "";
    const id = parseInt(item.id) || 0;
  
    if (apiName.includes('radiant')) return 'radiant';
    if (apiName.includes('artifact') || apiName.includes('ornn')) return 'artifact';
    if (apiName.includes('emblemitem') || apiName.includes('emblem') || name.includes('상징')) return 'emblem';
    if (apiName.includes('bilgewater')) return 'trait'; // 요청하신 특성 분류
    if (apiName.includes('support')) return 'support';
    if ((id >= 1 && id <= 9) || apiName.includes('component')) return 'component';
    
    return 'completed';
  }
  
  export function isValidItem(item, currentSet = 0) {
    const name = item.name || "";
    const apiName = item.apiName || String(item.id || "");
    const id = parseInt(item.id) || 0;
  
    if (!name.trim() || name === " ") return false;
    if (BLACKLIST_KEYWORDS.some(key => apiName.includes(key))) return false;

    // 상징 아이템 시즌 필터링: 세트 번호가 있고, 현재 시즌과 다르면 제외
    if (currentSet > 0 && (apiName.includes('Emblem') || name.includes('상징'))) {
      const match = apiName.match(/^TFT(\d+)_/);
      if (match) {
        if (parseInt(match[1]) !== currentSet) return false;
      }
    }
  
    // 화이트리스트 검사: 재료, 특수 아이템, 혹은 조합법이 있는 완성템
    const isComponent = (id >= 1 && id <= 9) || apiName.includes('Component');
    const isSpecial = /Radiant|Artifact|Ornn|Support|Emblem|Bilgewater/i.test(apiName) || name.includes('상징');
    const hasRecipe = item.from && item.from.length > 0;
  
    // 조합법이 있으면(hasRecipe) 일반 완성 아이템으로 간주하여 허용
    return isComponent || isSpecial || hasRecipe;
  }
