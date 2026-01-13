// 아이템 설명을 수동으로 관리하는 파일입니다.
// apiName 또는 id를 키(Key)로 사용하고, 설명 텍스트를 값(Value)으로 입력하세요.
export const ITEM_DESCRIPTIONS = {
  // ==========================================================================================
  // 1. 재료 아이템 (Components)
  // ==========================================================================================
  "TFT_Item_BFSword": "%i:scaleAD% 공격력 +10%",
  "TFT_Item_RecurveBow": "%i:scaleSpeed% 공격 속도 +10%",
  "TFT_Item_NeedlesslyLargeRod": "%i:scaleAP% 주문력 +10",
  "TFT_Item_TearOfTheGoddess": "%i:scaleManaRe% 마나 +15",
  "TFT_Item_ChainVest": "%i:scaleArmor% 방어력 +20",
  "TFT_Item_NegatronCloak": "%i:scaleMR% 마법 저항력 +20",
  "TFT_Item_GiantsBelt": "%i:scaleHealth% 체력 +150",
  "TFT_Item_Spatula": "다양한 특성 상징을 만들 수 있습니다",
  "TFT_Item_SparringGloves": "%i:scaleCrit% 치명타 확률 +20%",

  // ==========================================================================================
  // 2. 완성 아이템 (Completed Items)
  // ==========================================================================================
    // --- 대검 (B.F. Sword) ---
    "TFT_Item_Deathblade": "%i:scaleAD% +55% %i:scaleDamage% +10% <br>이 검의 주인은 더없는 평화와 안정을 찾게 됩니다. 주인의 적들도 마찬가지고요.",
    "TFT_Item_GuardianAngel": "%i:scaleAD% +10%, %i:scaleAP% +10%, %i:scaleArmor% +20 %i:scaleAttackSpeed% +15% <br>체력이 60%일 때 잠시 대상으로 지정할 수 없게 되며 해로운 효과 제거",
    "TFT_Item_SteraksGage": "%i:scaleHealth% +300, %i:scaleAD% 공격력 +40% <br>체력이 60%일 때, 장착 유닛 최대 체력의 50%에 해당하는 보호막 획득. 보호막은 4초에 걸쳐 빠르게 사라짐",
    "TFT_Item_HextechGunblade": "%i:scaleAD% +20% %i:scaleAP% +20 %i:scaleSV% +15% %i:scaleManaRe% +1<br>입힌 피해량의 20%만큼 체력 비율이 가장 낮은 아군의 체력 회복",
    "TFT_Item_MadredsBloodrazor": "%i:scaleAD% +15% %i:scaleAP% +15 %i:scaleSpeed% +10% %i:scaleDamage% +15%<br>탱커를 상대로 추가 피해 증폭 15% 획득",
    "TFT_Item_SpearOfShojin": "%i:scaleAD% +15%, %i:scaleAP% +10, %i:scaleManaRe% 마나 +1<br>기본 공격 시 추가 마나 5 획득",
    "TFT_Item_Bloodthirster": "%i:scaleAD% +15% %i:scaleAP% +15 %i:scaleMR% +20 %i:scaleSV% +20%<br>체력이 40% 아래로 떨어지면 최대 체력의 25%에 해당하는 보호막을 얻습니다",
    "TFT_Item_InfinityEdge": "%i:scaleAD% +35%, %i:scaleCrit% +35%<br>스킬에 치명타 적용 가능<br>기본 스킬에 치명타 적용이 가능한 경우, 대신에 치명타 피해량이 10% 증가",

    // --- 조끼 (Chain Vest) ---
    "TFT_Item_BrambleVest": "%i:scaleArmor% +65 <br>9%의 최대 체력 획득 <br>기본 공격으로 받는 피해 5% 감소. 기본 공격에 맞을 경우 인접한 모든 적에게 100의 마법 피해",
    "TFT_Item_RedBuff": "%i:scaleHealth% +150 %i:scaleArmor% +20 <br>최대 체력 8% 획득<br>2초마다 2칸 내에 있는 적 하나에게 10초 동안 불태우기를 1%, 상처를 33% 적용",
    "TFT_Item_Crownguard": "%i:scaleHealth% 체력 +100 %i:scaleAP% 주문력 +20 %i:scaleArmor% 방어력 +20 <br>전투 시작: 8초 동안 최대 체력의 25%에 해당하는 보호막 획득 <br>보호막이 사라지면 주문력 25% 증가",
    "TFT_Item_TitansResolve": "%i:scaleArmor% +20 %i:scaleSpeed% +10% <br>공격하거나 피해를 받으면 공격력 2%, 주문력 2% 증가 (최대 25회 중첩) <br>최대 중첩 시 피해 증폭 10% 획득 및 군중 제어 효과에 면역이 됨",
    "TFT_Item_FrozenHeart": "%i:scaleArmor% +25 %i:scaleMR% +25 %i:scaleManaRe% +1 <br>전투 시작: 마나 20 획득 <br>체력이 40%일 때 마나 15 및 최대 체력의 20%에 해당하는 보호막 획득",
    "TFT_Item_GargoyleStoneplate": "%i:scaleHealth% 체력 +100 %i:scaleArmor% +25 %i:scaleMR% +25<br>적의 공격 대상이 되면 방어력이 10, 마법 저항력이 10 증가. 공격하는 적이 늘어나면 중첩되어 적용",
    "TFT_Item_NightHarvester": "%i:scaleHealth% +250 %i:scaleArmor% +20 %i:scaleCrit% +20%.<br>내구력 10% 획득. 체력이 50% 이상일 때 대신 내구력 18% 획득",

    // --- 허리띠 (Giant's Belt) ---
    "TFT_Item_WarmogsArmor": "%i:scaleHealth% 체력 +500 <br>최대 체력 15% 획득",
    "TFT_Item_Morellonomicon": "%i:scaleHealth% +150 %i:scaleAP% +20 %i:scaleManaRe% +1 <br>기본 공격 및 스킬로 피해를 입힐 경우 10초 동안 적에게 불태우기를 1%, 상처를 33% 적용",
    "TFT_Item_Leviathan": "%i:scaleHealth% +150 %i:scaleAP% +15, %i:scaleSpeed% +10% %i:scaleCrit% +20% <br>기본 공격 시 추가 마나 2 획득. 치명타 적중 시 4 획득",
    "TFT_Item_Redemption": "%i:scaleHealth% +300 %i:scaleDuration% +10% %i:scaleManaRe%+2 <br>매초 잃은 체력의 2.5%만큼 체력 회복",
    "TFT_Item_SpectralGauntlet": "%i:scaleHealth% +250, %i:scaleMR% +20.<br>2칸 내에 있는 적 30% 파열 전투 시작 후 15초 동안 방어력과 마법 저항력 25 증가",
    "TFT_Item_PowerGauntlet": "%i:scaleHealth% +150 %i:scaleSpeed% +10%, %i:scaleCrit% +20% %i:scaleDamage% +10%<br>치명타 적중 시 5초 동안 피해 증폭 5% 획득 (최대 4회 중첩)",

    // --- 지팡이 (Needlessly Large Rod) ---
    "TFT_Item_RabadonsDeathcap": "%i:scaleAP% +50 %i:scaleDamage% +15% <br>평범해 보이지만 우주를 창조하거나 파괴할 수 있는 모자입니다.",
    "TFT_Item_GuinsoosRageblade": "%i:scaleAP% +10 %i:scaleSpeed% +10% <br>매초 공격 속도 7% 획득 (중첩 가능)",
    "TFT_Item_ArchangelsStaff": "%i:scaleAP% +30 %i:scaleManaRe% +1.<br>전투 시작: 전투 중 5초마다 주문력 20% 증가",
    "TFT_Item_IonicSpark": "%i:scaleHealth% +250 %i:scaleAP% +15 %i:scaleMR% +35  <br>2칸 내 적에게 파쇄 30% 적용. 해당 적은 스킬 사용 시 사용한 마나의 150%에 해당하는 마법 피해를 입음",
    "TFT_Item_JeweledGauntlet": "%i:scaleAP% +35 %i:scaleCrit% +35% <br>스킬에 치명타 적용 가능 <br>기본 스킬에 치명타 적용이 가능한 경우, 대신에 치명타 피해량이 10% 증가",

    // --- 곡궁 (Recurve Bow) ---
    "TFT_Item_RapidFireCannon": "%i:scaleSpeed% +45% %i:scaleDamage% +3% <br>기본 공격과 스킬이 5초 동안 적에게 불태우기를 1%, 상처를 33% 적용",
    "TFT_Item_StatikkShiv": "%i:scaleAP% +35 %i:scaleSpeed% +15% %i:scaleManaRe% +1<br>기본 공격 및 스킬로 피해를 입힐 경우 5초 동안 대상에게 파쇄를 30% 적용 (중첩 불가)",
    "TFT_Item_RunaansHurricane": "%i:scaleAD% +10% %i:scaleSpeed% +10% %i:scaleMR% +20<br>기본 공격 시 공격력 3.5% (최대 15회 중첩) 획득. 기본 공격 15회 후 공격 속도 15% 획득",
    "TFT_Item_LastWhisper": "%i:scaleAD% +15% %i:scaleSpeed% +20% %i:scaleCrit% +20% <br>기본 공격 및 스킬로 피해를 입힐 경우 3초 동안 대상에게 파열을 30% 적용 (중첩 불가)",

    // --- 눈물 (Tear of the Goddess) ---
    "TFT_Item_BlueBuff": "%i:scaleAD% +15 %i:scaleAP% +15 %i:scaleManaRe% +5 <br>모든 요소로부터 얻는 공격력 및 주문력 10% 증가",
    "TFT_Item_AdaptiveHelm": "%i:scaleMR% +20 %i:scaleManaRe% +3 <br>모든 요소로부터 얻는 마나 15% 증가. 장착 시 역할군에 따라 추가 효과 획득 <br>탱커, 전사: 방어력 및 마법 저항력 45 획득 <br>기타 역할군: 공격력 및 주문력 10% 획득",
    "TFT_Item_UnstableConcoction": "%i:scaleCrit% +20% %i:scaleManaRe% +1 <br>2가지 효과 획득:<br> -  공격력 +15% 및 주문력 +15% <br> - 모든 피해 흡혈 12% <br>체력이 50%를 넘을 때 공격력 및 주문력이 두 배로 증가, 체력이 50% 아래일 때 모든 피해 흡혈이 두 배로 증가",

    // --- 망토 (Negatron Cloak) ---
    "TFT_Item_DragonsClaw": "%i:scaleMR% +75 <br>9%의 최대 체력 획득 <br>2초마다 최대 체력의 2.5%를 회복",
    "TFT_Item_Quicksilver": "%i:scaleMR% +20 %i:scaleSpeed% +15% %i:scaleCrit% +20% <br>전투 시작: 18초 동안 군중 제어 효과에 면역 <br>매초 공격 속도 3% 획득 (중첩 가능)",

    // --- 장갑 (Sparring Gloves) ---
    "TFT_Item_ThiefsGloves": "%i:scaleCrit% +20% %i:scaleHealth% +150 <br>매 라운드: 무작위 아이템 2개 장착 <br>[아이템 슬롯 3개 차지]",
  // ==========================================================================================
  // 3. 찬란한 아이템 (Radiant Items)
  // ==========================================================================================
    // --- 대검 (B.F. Sword) ---
    "TFT5_Item_DeathbladeRadiant": "%i:scaleAD% +55% %i:scaleDamage% +10% <br>이 검의 주인은 더없는 평화와 안정을 찾게 됩니다. 주인의 적들도 마찬가지고요.",
    "TFT5_Item_GuardianAngelRadiant": "%i:scaleAD% +10%, %i:scaleAP% +10%, %i:scaleArmor% +20 %i:scaleAttackSpeed% +15% <br>체력이 60%일 때 잠시 대상으로 지정할 수 없게 되며 해로운 효과 제거",
    "TFT5_Item_SteraksGageRadiant": "%i:scaleHealth% +300, %i:scaleAD% 공격력 +40% <br>체력이 60%일 때, 장착 유닛 최대 체력의 50%에 해당하는 보호막 획득. 보호막은 4초에 걸쳐 빠르게 사라짐",
    "TFT5_Item_HextechGunbladeRadiant": "%i:scaleAD% +20% %i:scaleAP% +20 %i:scaleSV% +15% %i:scaleManaRe% +1<br>입힌 피해량의 20%만큼 체력 비율이 가장 낮은 아군의 체력 회복",
    "TFT5_Item_GiantSlayerRadiant": "%i:scaleAD% +15% %i:scaleAP% +15 %i:scaleSpeed% +10% %i:scaleDamage% +15%<br>탱커를 상대로 추가 피해 증폭 15% 획득",
    "TFT5_Item_SpearOfShojinRadiant": "%i:scaleAD% +15%, %i:scaleAP% +10, %i:scaleManaRe% 마나 +1<br>기본 공격 시 추가 마나 5 획득",
    "TFT5_Item_BloodthirsterRadiant": "%i:scaleAD% +15% %i:scaleAP% +15 %i:scaleMR% +20 %i:scaleSV% +20%<br>체력이 40% 아래로 떨어지면 최대 체력의 25%에 해당하는 보호막을 얻습니다",
    "TFT5_Item_InfinityEdgeRadiant": "%i:scaleAD% +35%, %i:scaleCrit% +35%<br>스킬에 치명타 적용 가능<br>기본 스킬에 치명타 적용이 가능한 경우, 대신에 치명타 피해량이 10% 증가",

    // --- 조끼 (Chain Vest) ---
    "TFT5_Item_BrambleVestRadiant": "%i:scaleArmor% +65 <br>9%의 최대 체력 획득 <br>기본 공격으로 받는 피해 5% 감소. 기본 공격에 맞을 경우 인접한 모든 적에게 100의 마법 피해",
    "TFT5_Item_SunfireCapeRadiant": "%i:scaleHealth% +150 %i:scaleArmor% +20 <br>최대 체력 8% 획득<br>2초마다 2칸 내에 있는 적 하나에게 10초 동안 불태우기를 1%, 상처를 33% 적용",
    "TFT5_Item_CrownguardRadiant": "%i:scaleHealth% 체력 +100 %i:scaleAP% 주문력 +20 %i:scaleArmor% 방어력 +20 <br>전투 시작: 8초 동안 최대 체력의 25%에 해당하는 보호막 획득 <br>보호막이 사라지면 주문력 25% 증가",
    "TFT5_Item_TitansResolveRadiant": "%i:scaleArmor% +20 %i:scaleSpeed% +10% <br>공격하거나 피해를 받으면 공격력 2%, 주문력 2% 증가 (최대 25회 중첩) <br>최대 중첩 시 피해 증폭 10% 획득 및 군중 제어 효과에 면역이 됨",
    "TFT5_Item_FrozenHeartRadiant": "%i:scaleArmor% +25 %i:scaleMR% +25 %i:scaleManaRe% +1 <br>전투 시작: 마나 20 획득 <br>체력이 40%일 때 마나 15 및 최대 체력의 20%에 해당하는 보호막 획득",
    "TFT5_Item_GargoyleStoneplateRadiant": "%i:scaleHealth% 체력 +100 %i:scaleArmor% +25 %i:scaleMR% +25<br>적의 공격 대상이 되면 방어력이 10, 마법 저항력이 10 증가. 공격하는 적이 늘어나면 중첩되어 적용",
    "TFT5_Item_NightHarvesterRadiant": "%i:scaleHealth% +250 %i:scaleArmor% +20 %i:scaleCrit% +20%.<br>내구력 10% 획득. 체력이 50% 이상일 때 대신 내구력 18% 획득",

    // --- 허리띠 (Giant's Belt) ---
    "TFT5_Item_WarmogsArmorRadiant": "%i:scaleHealth% 체력 +500 <br>최대 체력 15% 획득",
    "TFT5_Item_MorellonomiconRadiant": "%i:scaleHealth% +150 %i:scaleAP% +20 %i:scaleManaRe% +1 <br>기본 공격 및 스킬로 피해를 입힐 경우 10초 동안 적에게 불태우기를 1%, 상처를 33% 적용",
    "TFT5_Item_LeviathanRadiant": "%i:scaleHealth% +150 %i:scaleAP% +15, %i:scaleSpeed% +10% %i:scaleCrit% +20% <br>기본 공격 시 추가 마나 2 획득. 치명타 적중 시 4 획득",
    "TFT5_Item_RedemptionRadiant": "%i:scaleHealth% +300 %i:scaleDuration% +10% %i:scaleManaRe%+2 <br>매초 잃은 체력의 2.5%만큼 체력 회복",
    "TFT5_Item_SpectralGauntletRadiant": "%i:scaleHealth% +250, %i:scaleMR% +20.<br>2칸 내에 있는 적 30% 파열 전투 시작 후 15초 동안 방어력과 마법 저항력 25 증가",
    "TFT5_Item_TrapClawRadiant": "%i:scaleHealth% +150 %i:scaleSpeed% +10%, %i:scaleCrit% +20% %i:scaleDamage% +10%<br>치명타 적중 시 5초 동안 피해 증폭 5% 획득 (최대 4회 중첩)",

    // --- 지팡이 (Needlessly Large Rod) ---
    "TFT5_Item_RabadonsDeathcapRadiant": "%i:scaleAP% +50 %i:scaleDamage% +15% <br>평범해 보이지만 우주를 창조하거나 파괴할 수 있는 모자입니다.",
    "TFT5_Item_GuinsoosRagebladeRadiant": "%i:scaleAP% +10 %i:scaleSpeed% +10% <br>매초 공격 속도 7% 획득 (중첩 가능)",
    "TFT5_Item_ArchangelsStaffRadiant": "%i:scaleAP% +30 %i:scaleManaRe% +1.<br>전투 시작: 전투 중 5초마다 주문력 20% 증가",
    "TFT5_Item_IonicSparkRadiant": "%i:scaleHealth% +250 %i:scaleAP% +15 %i:scaleMR% +35  <br>2칸 내 적에게 파쇄 30% 적용. 해당 적은 스킬 사용 시 사용한 마나의 150%에 해당하는 마법 피해를 입음",
    "TFT5_Item_JeweledGauntletRadiant": "%i:scaleAP% +35 %i:scaleCrit% +35% <br>스킬에 치명타 적용 가능 <br>기본 스킬에 치명타 적용이 가능한 경우, 대신에 치명타 피해량이 10% 증가",

    // --- 곡궁 (Recurve Bow) ---
    "TFT5_Item_RapidFirecannonRadiant": "%i:scaleSpeed% +45% %i:scaleDamage% +3% <br>기본 공격과 스킬이 5초 동안 적에게 불태우기를 1%, 상처를 33% 적용",
    "TFT5_Item_StatikkShivRadiant": "%i:scaleAP% +35 %i:scaleSpeed% +15% %i:scaleManaRe% +1<br>기본 공격 및 스킬로 피해를 입힐 경우 5초 동안 대상에게 파쇄를 30% 적용 (중첩 불가)",
    "TFT5_Item_RunaansHurricaneRadiant": "%i:scaleAD% +10% %i:scaleSpeed% +10% %i:scaleMR% +20<br>기본 공격 시 공격력 3.5% (최대 15회 중첩) 획득. 기본 공격 15회 후 공격 속도 15% 획득",
    "TFT5_Item_LastWhisperRadiant": "%i:scaleAD% +15% %i:scaleSpeed% +20% %i:scaleCrit% +20% <br>기본 공격 및 스킬로 피해를 입힐 경우 3초 동안 대상에게 파열을 30% 적용 (중첩 불가)",

    // --- 눈물 (Tear of the Goddess) ---
    "TFT5_Item_BlueBuffRadiant": "%i:scaleAD% +15 %i:scaleAP% +15 %i:scaleManaRe% +5 <br>모든 요소로부터 얻는 공격력 및 주문력 10% 증가",
    "TFT5_Item_AdaptiveHelmRadiant": "%i:scaleMR% +20 %i:scaleManaRe% +3 <br>모든 요소로부터 얻는 마나 15% 증가. 장착 시 역할군에 따라 추가 효과 획득 <br>탱커, 전사: 방어력 및 마법 저항력 45 획득 <br>기타 역할군: 공격력 및 주문력 10% 획득",
    "TFT5_Item_HandOfJusticeRadiant": "%i:scaleCrit% +20% %i:scaleManaRe% +1 <br>2가지 효과 획득:<br> -  공격력 +15% 및 주문력 +15% <br> - 모든 피해 흡혈 12% <br>체력이 50%를 넘을 때 공격력 및 주문력이 두 배로 증가, 체력이 50% 아래일 때 모든 피해 흡혈이 두 배로 증가",

    // --- 망토 (Negatron Cloak) ---
    "TFT5_Item_DragonsClawRadiant": "%i:scaleMR% +75 <br>9%의 최대 체력 획득 <br>2초마다 최대 체력의 2.5%를 회복",
    "TFT5_Item_QuicksilverRadiant": "%i:scaleMR% +20 %i:scaleSpeed% +15% %i:scaleCrit% +20% <br>전투 시작: 18초 동안 군중 제어 효과에 면역 <br>매초 공격 속도 3% 획득 (중첩 가능)",

    // --- 장갑 (Sparring Gloves) ---
    "TFT5_Item_ThiefsGlovesRadiant": "%i:scaleCrit% +20% %i:scaleHealth% +150 <br>매 라운드: 무작위 아이템 2개 장착 <br>[아이템 슬롯 3개 차지]",

  // ==========================================================================================
  // 4. 유물 아이템 (Artifact Items)
  // ==========================================================================================
  "TFT4_Item_OrnnDeathsDefiance": "죽음의 저항",
  "TFT4_Item_OrnnTheCollector": "황금 징수의 총",
  "TFT4_Item_OrnnInfinityForce": "무한한 삼위일체",
  "TFT4_Item_OrnnMuramana": "마나자네",
  "TFT4_Item_OrnnZhonyasParadox": "존야의 역설",
  "TFT9_Item_OrnnHullbreaker": "선체분쇄자",
  "TFT9_Item_OrnnHorizonFocus": "저격수의 집중",
  "TFT_Item_Artifact_TalismanOfAscension": "승천의 부적",
  "TFT_Item_Artifact_Fishbones": "생선대가리",
  "TFT_Item_Artifact_HorizonFocus": "지평선의 초점",
  "TFT_Item_Artifact_Mittens": "방한 장갑",
  "TFT_Item_Artifact_RapidFirecannon": "고속 연사포",
  "TFT_Item_Artifact_LudensTempest": "루덴의 폭풍",
  "TFT_Item_Artifact_SilvermereDawn": "은빛 여명",
  "TFT_Item_Artifact_ProwlersClaw": "자객의 발톱",
  "TFT_Item_Artifact_BlightingJewel": "역병의 보석",
  "TFT_Item_Artifact_WitsEnd": "마법사의 최후",
  "TFT_Item_Artifact_LichBane": "리치베인",
  "TFT_Item_Artifact_LightshieldCrest": "라이트실드 문장",
  "TFT_Item_Artifact_SeekersArmguard": "추적자의 팔목 보호대",
  "TFT_Item_Artifact_NavoriFlickerblades": "명멸검",
  "TFT_Item_Artifact_StatikkShiv": "스태틱의 단검",
  "TFT_Item_Artifact_TheIndomitable": "불굴",
  "TFT_Item_Artifact_Dawncore": "새벽심장",
  "TFT_Item_Artifact_TitanicHydra": "거대한 히드라",
  "TFT_Item_Artifact_HellfireHatchet": "지옥불 손도끼",
  "TFT_Item_Artifact_CappaJuice": "카파 주스",
  "TFT_Item_Artifact_EternalPact": "영원한 서약",
  "TFT_Item_Artifact_VoidGauntlet": "공허 건틀릿",
  "TFT_Item_Artifact_AegisOfDawn": "새벽의 방패",
  "TFT_Item_Artifact_AegisOfDusk": "황혼의 방패",

  // ==========================================================================================
  // 5. 특성 및 상징 (Traits & Emblems)
  // ==========================================================================================
  "TFT16_Item_Bilgewater_BilgeratCutlass": "불한당의 해적검",
  "TFT16_Item_Bilgewater_BlackmarketExplosives": "암시장 폭발물",
  "TFT16_Item_Bilgewater_DeadmansDagger": "망자의 단검",
  "TFT16_Item_Bilgewater_PileOCitrus": "귤 더미",
  "TFT16_Item_BilgewaterEmblemItem": "빌지워터 상징",
  "TFT16_Item_BrawlerEmblemItem": "난동꾼 상징",
  "TFT16_Item_DefenderEmblemItem": "엄호대 상징",
  "TFT16_Item_DemaciaEmblemItem": "데마시아 상징",
  "TFT16_Item_FreljordEmblemItem": "프렐요드 상징",
  "TFT16_Item_GunslingerEmblemItem": "총잡이 상징",
  "TFT16_Item_InvokerEmblemItem": "기원자 상징",
  "TFT16_Item_IoniaEmblemItem": "아이오니아 상징",
  "TFT16_Item_JuggernautEmblemItem": "전쟁기계 상징",
  "TFT16_Item_LongshotEmblemItem": "원거리 사격 상징",
  "TFT16_Item_MagusEmblemItem": "방해꾼 상징",
  "TFT16_Item_NoxusEmblemItem": "녹서스 상징",
  "TFT16_Item_PiltoverEmblemItem": "필트오버 상징",
  "TFT16_Item_RapidfireEmblemItem": "기동타격대 상징",
  "TFT16_Item_SorcererEmblemItem": "비전 마법사 상징",
  "TFT16_Item_VanquisherEmblemItem": "토벌자 상징",
  "TFT16_Item_VoidEmblemItem": "공허 상징",
  "TFT16_Item_YordleEmblemItem": "요들 상징",
  "TFT16_Item_ZaunEmblemItem": "자운 상징",
  "TFT16_Item_SlayerEmblemItem": "학살자 상징",
  "TFT16_Item_Bilgewater_LuckyEyepatch": "행운의 금화",
  "TFT16_Item_Bilgewater_CaptainsBrew": "선장의 비법",
  "TFT16_Item_WardenEmblemItem": "파수꾼 상징",
  "TFT16_Item_IxtalEmblemItem": "이쉬탈 상징",
};
