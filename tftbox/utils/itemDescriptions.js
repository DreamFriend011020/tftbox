// 아이템 설명을 수동으로 관리하는 파일입니다.
// apiName 또는 id를 키(Key)로 사용하고, 설명 텍스트를 값(Value)으로 입력하세요.
export const ITEM_DESCRIPTIONS = {
  // ==========================================================================================
  // 1. 재료 아이템 (Components)
  // ==========================================================================================
  "TFT_Item_BFSword": "%i:scaleAD% 공격력 +10%",
  "TFT_Item_RecurveBow": "%i:scaleAttackSpeed% 공격 속도 +10%",
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
    "TFT_Item_MadredsBloodrazor": "%i:scaleAD% +15% %i:scaleAP% +15 %i:scaleAttackSpeed% +10% %i:scaleDamage% +15%<br>탱커를 상대로 추가 피해 증폭 15% 획득",
    "TFT_Item_SpearOfShojin": "%i:scaleAD% +15%, %i:scaleAP% +10, %i:scaleManaRe% 마나 +1<br>기본 공격 시 추가 마나 5 획득",
    "TFT_Item_Bloodthirster": "%i:scaleAD% +15% %i:scaleAP% +15 %i:scaleMR% +20 %i:scaleSV% +20%<br>체력이 40% 아래로 떨어지면 최대 체력의 25%에 해당하는 보호막을 얻습니다",
    "TFT_Item_InfinityEdge": "%i:scaleAD% +35%, %i:scaleCrit% +35%<br>스킬에 치명타 적용 가능<br>기본 스킬에 치명타 적용이 가능한 경우, 대신에 치명타 피해량이 10% 증가",

    // --- 조끼 (Chain Vest) ---
    "TFT_Item_BrambleVest": "%i:scaleArmor% +65 <br>9%의 최대 체력 획득 <br>기본 공격으로 받는 피해 5% 감소. 기본 공격에 맞을 경우 인접한 모든 적에게 100의 마법 피해",
    "TFT_Item_RedBuff": "%i:scaleHealth% +150 %i:scaleArmor% +20 <br>최대 체력 8% 획득<br>2초마다 2칸 내에 있는 적 하나에게 10초 동안 불태우기를 1%, 상처를 33% 적용",
    "TFT_Item_Crownguard": "%i:scaleHealth% 체력 +100 %i:scaleAP% 주문력 +20 %i:scaleArmor% 방어력 +20 <br>전투 시작: 8초 동안 최대 체력의 25%에 해당하는 보호막 획득 <br>보호막이 사라지면 주문력 25% 증가",
    "TFT_Item_TitansResolve": "%i:scaleArmor% +20 %i:scaleAttackSpeed% +10% <br>공격하거나 피해를 받으면 공격력 2%, 주문력 2% 증가 (최대 25회 중첩) <br>최대 중첩 시 피해 증폭 10% 획득 및 군중 제어 효과에 면역이 됨",
    "TFT_Item_FrozenHeart": "%i:scaleArmor% +25 %i:scaleMR% +25 %i:scaleManaRe% +1 <br>전투 시작: 마나 20 획득 <br>체력이 40%일 때 마나 15 및 최대 체력의 20%에 해당하는 보호막 획득",
    "TFT_Item_GargoyleStoneplate": "%i:scaleHealth% 체력 +100 %i:scaleArmor% +25 %i:scaleMR% +25<br>적의 공격 대상이 되면 방어력이 10, 마법 저항력이 10 증가. 공격하는 적이 늘어나면 중첩되어 적용",
    "TFT_Item_NightHarvester": "%i:scaleHealth% +250 %i:scaleArmor% +20 %i:scaleCrit% +20%.<br>내구력 10% 획득. 체력이 50% 이상일 때 대신 내구력 18% 획득",

    // --- 허리띠 (Giant's Belt) ---
    "TFT_Item_WarmogsArmor": "%i:scaleHealth% 체력 +500 <br>최대 체력 15% 획득",
    "TFT_Item_Morellonomicon": "%i:scaleHealth% +150 %i:scaleAP% +20 %i:scaleManaRe% +1 <br>기본 공격 및 스킬로 피해를 입힐 경우 10초 동안 적에게 불태우기를 1%, 상처를 33% 적용",
    "TFT_Item_Leviathan": "%i:scaleHealth% +150 %i:scaleAP% +15, %i:scaleAttackSpeed% +10% %i:scaleCrit% +20% <br>기본 공격 시 추가 마나 2 획득. 치명타 적중 시 4 획득",
    "TFT_Item_Redemption": "%i:scaleHealth% +300 %i:scaleDuration% +10% %i:scaleManaRe%+2 <br>매초 잃은 체력의 2.5%만큼 체력 회복",
    "TFT_Item_SpectralGauntlet": "%i:scaleHealth% +250, %i:scaleMR% +20.<br>2칸 내에 있는 적 30% 파열 전투 시작 후 15초 동안 방어력과 마법 저항력 25 증가",
    "TFT_Item_PowerGauntlet": "%i:scaleHealth% +150 %i:scaleAttackSpeed% +10%, %i:scaleCrit% +20% %i:scaleDamage% +10%<br>치명타 적중 시 5초 동안 피해 증폭 5% 획득 (최대 4회 중첩)",

    // --- 지팡이 (Needlessly Large Rod) ---
    "TFT_Item_RabadonsDeathcap": "%i:scaleAP% +50 %i:scaleDamage% +15% <br>평범해 보이지만 우주를 창조하거나 파괴할 수 있는 모자입니다.",
    "TFT_Item_GuinsoosRageblade": "%i:scaleAP% +10 %i:scaleAttackSpeed% +10% <br>매초 공격 속도 7% 획득 (중첩 가능)",
    "TFT_Item_ArchangelsStaff": "%i:scaleAP% +30 %i:scaleManaRe% +1.<br>전투 시작: 전투 중 5초마다 주문력 20% 증가",
    "TFT_Item_IonicSpark": "%i:scaleHealth% +250 %i:scaleAP% +15 %i:scaleMR% +35  <br>2칸 내 적에게 파쇄 30% 적용. 해당 적은 스킬 사용 시 사용한 마나의 150%에 해당하는 마법 피해를 입음",
    "TFT_Item_JeweledGauntlet": "%i:scaleAP% +35 %i:scaleCrit% +35% <br>스킬에 치명타 적용 가능 <br>기본 스킬에 치명타 적용이 가능한 경우, 대신에 치명타 피해량이 10% 증가",

    // --- 곡궁 (Recurve Bow) ---
    "TFT_Item_RapidFireCannon": "%i:scaleAttackSpeed% +45% %i:scaleDamage% +3% <br>기본 공격과 스킬이 5초 동안 적에게 불태우기를 1%, 상처를 33% 적용",
    "TFT_Item_StatikkShiv": "%i:scaleAP% +35 %i:scaleAttackSpeed% +15% %i:scaleManaRe% +1<br>기본 공격 및 스킬로 피해를 입힐 경우 5초 동안 대상에게 파쇄를 30% 적용 (중첩 불가)",
    "TFT_Item_RunaansHurricane": "%i:scaleAD% +10% %i:scaleAttackSpeed% +10% %i:scaleMR% +20<br>기본 공격 시 공격력 3.5% (최대 15회 중첩) 획득. 기본 공격 15회 후 공격 속도 15% 획득",
    "TFT_Item_LastWhisper": "%i:scaleAD% +15% %i:scaleAttackSpeed% +20% %i:scaleCrit% +20% <br>기본 공격 및 스킬로 피해를 입힐 경우 3초 동안 대상에게 파열을 30% 적용 (중첩 불가)",

    // --- 눈물 (Tear of the Goddess) ---
    "TFT_Item_BlueBuff": "%i:scaleAD% +15 %i:scaleAP% +15 %i:scaleManaRe% +5 <br>모든 요소로부터 얻는 공격력 및 주문력 10% 증가",
    "TFT_Item_AdaptiveHelm": "%i:scaleMR% +20 %i:scaleManaRe% +3 <br>모든 요소로부터 얻는 마나 15% 증가. 장착 시 역할군에 따라 추가 효과 획득 <br>탱커, 전사: 방어력 및 마법 저항력 45 획득 <br>기타 역할군: 공격력 및 주문력 10% 획득",
    "TFT_Item_UnstableConcoction": "%i:scaleCrit% +20% %i:scaleManaRe% +1 <br>2가지 효과 획득:<br> -  공격력 +15% 및 주문력 +15% <br> - 모든 피해 흡혈 12% <br>체력이 50%를 넘을 때 공격력 및 주문력이 두 배로 증가, 체력이 50% 아래일 때 모든 피해 흡혈이 두 배로 증가",

    // --- 망토 (Negatron Cloak) ---
    "TFT_Item_DragonsClaw": "%i:scaleMR% +75 <br>9%의 최대 체력 획득 <br>2초마다 최대 체력의 2.5%를 회복",
    "TFT_Item_Quicksilver": "%i:scaleMR% +20 %i:scaleAttackSpeed% +15% %i:scaleCrit% +20% <br>전투 시작: 18초 동안 군중 제어 효과에 면역 <br>매초 공격 속도 3% 획득 (중첩 가능)",

    // --- 장갑 (Sparring Gloves) ---
    "TFT_Item_ThiefsGloves": "%i:scaleCrit% +20% %i:scaleHealth% +150 <br>매 라운드: 무작위 아이템 2개 장착 <br>[아이템 슬롯 3개 차지]",
  // ==========================================================================================
  // 3. 찬란한 아이템 (Radiant Items)
  // ==========================================================================================
    // --- 대검 (B.F. Sword) ---
    "TFT5_Item_DeathbladeRadiant": "%i:scaleAD% +110% %i:scaleDamage% +20% <br>주변에 적이 있으면 빛납니다. 사실 적이든 아군이든 생명체만 있으면 빛나죠.",
    "TFT5_Item_GuardianAngelRadiant": "%i:scaleAD% +30%, %i:scaleAP% +30%, %i:scaleArmor% +40 %i:scaleAttackSpeed% +30% <br>체력이 60%일 때 잠시 대상으로 지정할 수 없게 되며 해로운 효과 제거 및 <span style='color: yellow;'>잃은 체력 모두 회복</span>",
    "TFT5_Item_SteraksGageRadiant": "%i:scaleHealth% +600, %i:scaleAD% 공격력 +80% <br>체력이 60%일 때, 장착 유닛 최대 체력의 <span style='color: yellow;'>100%</span>에 해당하는 보호막 획득. 보호막은 <span style='color: yellow;'>6</span>초에 걸쳐 빠르게 사라짐",
    "TFT5_Item_HextechGunbladeRadiant": "%i:scaleAD% +40% %i:scaleAP% +40 %i:scaleSV% +30% %i:scaleManaRe% +2<br>입힌 피해량의 <span style='color: yellow;'>40%</span>만큼 체력 비율이 가장 낮은 아군의 체력 회복",
    "TFT5_Item_GiantSlayerRadiant": "%i:scaleAD% +30% %i:scaleAP% +30 %i:scaleAttackSpeed% +30% %i:scaleDamage% +30%<br>탱커를 상대로 추가 피해 증폭 <span style='colr: yellow;'>30%</span> 획득",
    "TFT5_Item_SpearOfShojinRadiant": "%i:scaleAD% +30%, %i:scaleAP% +30, %i:scaleManaRe% +2<br>기본 공격 시 <span style='color: yellow;'>추가 마나 10</span> 획득",
    "TFT5_Item_BloodthirsterRadiant": "%i:scaleAD% +30% %i:scaleAP% +30 %i:scaleMR% +40 %i:scaleSV% +40%<br>체력이 40% 아래로 떨어지면 최대 체력의 <span style='color: yellow;'>50%</span>에 해당하는 보호막을 얻습니다",
    "TFT5_Item_InfinityEdgeRadiant": "%i:scaleAD% +75%, %i:scaleCrit% +75%<br>스킬에 치명타 적용 가능<br>기본 스킬에 치명타 적용이 가능한 경우, 대신에 치명타 피해량이 10% 증가",

    // --- 조끼 (Chain Vest) ---
    "TFT5_Item_BrambleVestRadiant": "%i:scaleArmor% +130 <br><span style='color: yellow;'>18%</span>의 최대 체력 획득 <br>기본 공격으로 받는 피해 <span style='color: yellow;'>10%</span> 감소. 기본 공격에 맞을 경우 인접한 모든 적에게 <span style='color: yellow;'>200</span>의 마법 피해",
    "TFT5_Item_SunfireCapeRadiant": "%i:scaleHealth% +300 %i:scaleArmor% +40 <br>최대 체력 <span style='color: yellow;'>16%</span> 획득<br>2초마다 2칸 내에 있는 적 하나에게 10초 동안 <span style='color: yellow;'>불태우기 2%</span> 및 <span style='color: yellow;'>상처</span> 33% 적용",
    "TFT5_Item_CrownguardRadiant": "%i:scaleHealth% 체력 +200 %i:scaleAP% 주문력 +40 %i:scaleArmor% 방어력 +40 <br>전투 시작: 8초 동안 최대 체력의 <span style='color: yellow;'>50%</span>에 해당하는 보호막 획득 <br>보호막이 사라지면 <span style='color: yellow;'>주문력 50%<span style='color: yellow;'> 증가",
    "TFT5_Item_TitansResolveRadiant": "%i:scaleArmor% +40 %i:scaleAttackSpeed% +20% <br>공격하거나 피해를 받으면 공격력 <span style='color: yellow;'>4%</span>, 주문력 <span style='color: yellow;'>4%</span> 증가 (최대 25회 중첩) <br>최대 중첩 시 피해 증폭 <span style='color: yellow;'>20%</span> 획득 및 군중 제어 효과에 면역이 됨",
    "TFT5_Item_FrozenHeartRadiant": "%i:scaleArmor% +50 %i:scaleMR% +50 %i:scaleManaRe% +2 <br>전투 시작: 마나 <span style='color: yellow;'>40</span> 획득 <br>체력이 40%일 때 <span style='color: yellow;'>마나 30</span> 및 <span style='color: yellow;'>최대 체력의 40%</span>에 해당하는 보호막 획득",
    "TFT5_Item_GargoyleStoneplateRadiant": "%i:scaleHealth% 체력 +300 %i:scaleArmor% +50 %i:scaleMR% +50<br>적의 공격 대상이 되면 방어력이 <span style='color: yellow;'>25</span>, 마법 저항력이 <span style='color: yellow;'>25</span> 증가. 공격하는 적이 늘어나면 중첩되어 적용",
    "TFT5_Item_NightHarvesterRadiant": "%i:scaleHealth% +600 %i:scaleArmor% +40 %i:scaleCrit% +40%.<br>내구력 <span style='color: yellow;'>20%</span> 획득. 체력이 50% 이상일 때 대신 내구력 <span style='color: yellow;'>36%</span> 획득",

    // --- 허리띠 (Giant's Belt) ---
    "TFT5_Item_WarmogsArmorRadiant": "%i:scaleHealth% 체력 +1200 <br>최대 체력 <span style='color: yellow;'>33%</span> 획득",
    "TFT5_Item_MorellonomiconRadiant": "%i:scaleHealth% +300 %i:scaleAP% +40 %i:scaleManaRe% +2 <br>기본 공격 및 스킬로 피해를 입힐 경우 10초 동안 적에게 <span style='color: yellow;'>불태우기 12%</span> 및 <span style='color: yellow;'>상처</span> 33% 적용",
    "TFT5_Item_LeviathanRadiant": "%i:scaleHealth% +300 %i:scaleAP% +30, %i:scaleAttackSpeed% +20% %i:scaleCrit% +40% <br>기본 공격 시 추가 마나 <span style='color: yellow;'>4</span> 획득. 치명타 적중 시 <span style='color: yellow;'>8</span> 획득",
    "TFT5_Item_RedemptionRadiant": "%i:scaleHealth% +700 %i:scaleDuration% +20% %i:scaleManaRe%+4 <br>매초 잃은 체력의 <span style='color: yellow;'>5%</span>만큼 체력 회복",
    "TFT5_Item_SpectralGauntletRadiant": "%i:scaleHealth% +500, %i:scaleMR% +40.<br>3칸 내에 있는 적에게<span style='color: yellow;'>파열</span> 30% 적용. 전투 시작 후 20초 동안 방어력 및 마법 저항력 50 획득",
    "TFT5_Item_TrapClawRadiant": "%i:scaleHealth% +300 %i:scaleAttackSpeed% +20%, %i:scaleCrit% +40% %i:scaleDamage% +20%<br>치명타 적중 시 5초 동안 피해 증폭 <span style='color: yellow;'>10%</span> 획득 (최대 4회 중첩)",

    // --- 지팡이 (Needlessly Large Rod) ---
    "TFT5_Item_RabadonsDeathcapRadiant": "%i:scaleAP% +100 %i:scaleDamage% +30% <br>기적과 재앙의 현장에 있기도 했고 직접 일으키기도 했습니다.",
    "TFT5_Item_GuinsoosRagebladeRadiant": "%i:scaleAP% +20 %i:scaleAttackSpeed% +20% <br>매초 공격 속도 <span style='color: yellow;'>14%</span> 획득 (중첩 가능)",
    "TFT5_Item_ArchangelsStaffRadiant": "%i:scaleAP% +60 %i:scaleManaRe% +2.<br>전투 시작: 전투 중 5초마다 주문력 <span style='color: yellow;'>40%</span> 증가",
    "TFT5_Item_IonicSparkRadiant": "%i:scaleHealth% +500 %i:scaleAP% +30 %i:scaleMR% +70  <br>2칸 내 적에게 <span style='color: yellow;'>파쇄</span> 30% 적용. 해당 적은 스킬 사용 시 사용한 마나의 <span style='color: yellow;'>300%</span>에 해당하는 마법 피해를 입음",
    "TFT5_Item_JeweledGauntletRadiant": "%i:scaleAP% +75 %i:scaleCrit% +75% <br>스킬에 치명타 적용 가능 <br>기본 스킬에 치명타 적용이 가능한 경우, 대신에 치명타 피해량이 10% 증가",

    // --- 곡궁 (Recurve Bow) ---
    "TFT5_Item_RapidFirecannonRadiant": "%i:scaleAttackSpeed% +90% %i:scaleDamage% +6% <br>기본 공격과 스킬이 5초 동안 적에게 불태우기를 1%, 상처를 33% 적용",
    "TFT5_Item_StatikkShivRadiant": "%i:scaleAP% +75 %i:scaleAttackSpeed% +30% %i:scaleManaRe% +2<br>기본 공격 및 스킬로 피해를 입힐 경우 <span style='color: yellow;'>전투가 끝날 때까지</span> 대상에게 <span style='color: yellow;'>파쇄</span>를 30% 적용 (중첩 불가)",
    "TFT5_Item_RunaansHurricaneRadiant": "%i:scaleAD% +20% %i:scaleAttackSpeed% +20% %i:scaleMR% +40<br>기본 공격 시 공격력 <span style='color: yellow;'>7</span>% (최대 15회 중첩) 획득. 기본 공격 15회 후 공격 속도 <span style='color: yellow;'>30</span>% 획득",
    "TFT5_Item_LastWhisperRadiant": "%i:scaleAD% +15% %i:scaleAttackSpeed% +20% %i:scaleCrit% +20% <br>기본 공격 및 스킬로 피해를 입힐 경우 <span style='color: yellow;'>전투가 끝날 때까지</span> 대상에게 <span style='color: yellow;'>파열</span>을 30% 적용 (중첩 불가)",

    // --- 눈물 (Tear of the Goddess) ---
    "TFT5_Item_BlueBuffRadiant": "%i:scaleAD% +30 %i:scaleAP% +30 %i:scaleManaRe% +10 <br>모든 요소로부터 얻는 공격력 및 주문력 <span style='color: yellow;'>20%</span> 증가",
    "TFT5_Item_AdaptiveHelmRadiant": "%i:scaleMR% +40 %i:scaleManaRe% +6 <br>모든 요소로부터 얻는 마나 <span style='color: yellow;'>30%</span> 증가. 장착 시 역할군에 따라 추가 효과 획득 <br>탱커, 전사: 방어력 및 마법 저항력 <span style='color: yellow;'>100</span> 획득 <br>기타 역할군: 공격력 및 주문력 <span style='color: yellow;'>25%</span> 획득",
    "TFT5_Item_HandOfJusticeRadiant": "%i:scaleCrit% +40% %i:scaleManaRe% +2 <br>2가지 효과 획득:<br> -  공격력 <span style='color: yellow;'>+30%</span> 및 주문력 <span style='color: yellow;'>+30%</span> <br> - 모든 피해 흡혈 <span style='color: yellow;'>24%</span> <br>체력이 50%를 넘을 때 공격력 및 주문력이 두 배로 증가, 체력이 50% 아래일 때 모든 피해 흡혈이 두 배로 증가",

    // --- 망토 (Negatron Cloak) ---
    "TFT5_Item_DragonsClawRadiant": "%i:scaleMR% +150 <br>최대 체력의 <span style='color: yellow;'>22%</span> 획득 <br>2초마다 최대 체력의 <span style='color: yellow;'>5%</span>를 회복",
    "TFT5_Item_QuicksilverRadiant": "%i:scaleMR% +40 %i:scaleAttackSpeed% +30% %i:scaleCrit% +40% <br>전투 시작: <span style='color: yellow;'>45</span>초 동안 군중 제어 효과에 면역 <br>매초 공격 속도 <span style='color: yellow;'>6%</span> 획득 (중첩 가능)",

    // --- 장갑 (Sparring Gloves) ---
    "TFT5_Item_ThiefsGlovesRadiant": "%i:scaleCrit% +20% %i:scaleHealth% +150 <br>매 라운드: 무작위 <span style='color: yellow;'>찬란한</span> 아이템 2개 장착 <br>[아이템 슬롯 3개 차지]",

  // ==========================================================================================
  // 4. 유물 아이템 (Artifact Items)
  // ==========================================================================================
  "TFT_Item_Artifact_TitanicHydra": "%i:scaleHealth% +300 %i:scaleAD% +30% %i:scaleAttackSpeed% +20% <br>기본 공격 시 대상 및 인접한 적에게 장착 유닛 최대 체력의 3%+공격력의 8%만큼 추가 물리 피해를 입힘",
  "TFT7_Item_ShimmerscaleMogulsMail": "%i:scaleHealth% +300<br>피해를 입으면 방어력 1, 마법 저항력 1, 체력 5 획득 (최대 35회 중첩)<br><br>최대 중첩 시 1골드 획득. 이후 12초마다 1골드 획득<br><br>이번 게임에서 획득한 골드: ?<br><br>[고유 - 중복 적용 불가]",
  "TFT_Item_Artifact_RapidFirecannon": "%i:scaleAttackSpeed% +65% %i:scaleDamage% +5%<br>공격 사거리가 +1 증가하며 적을 처치할 때마다 1씩 증가합니다.",
  "TFT_Item_Artifact_VoidGauntlet": "%i:scaleHealth% +300 %i:scaleDuration% +10%  <br>전투 시작: 최대 체력의 30% 저장 및 매초 2.5% 추가 저장. 사망 시 4칸 내 적에게 저장한 체력만큼의 마법 피해를 나누어 입힘<br><br>[고유 - 중복 적용 불가]",
  "TFT7_Item_ShimmerscaleGamblersBlade": "%i:scaleAttackSpeed% +45%<br>보유한 골드마다 추가 공격 속도 1% 획득 (최대 30골드)<br><br>기본 공격할 때마다 5% 확률로 1골드 획득<br><br>이번 게임에서 획득한 골드: ?<br><br>[고유 - 중복 적용 불가]",
  "TFT_Item_Artifact_LightshieldCrest": "%i:scaleArmor% +55 %i:scaleMR% +55 <br>3초마다 체력 비율이 가장 낮은 아군에게 5초 동안 방어력과 마법 저항력을 합한 수치의 70%만큼 피해를 흡수하는 보호막을 씌움<br><br>사망 시 모든 아군에게 이 보호막 부여",
  "TFT_Item_Artifact_LudensTempest": "%i:scaleAD% +45% %i:scaleAP% +45 <br>대상 처치 후 남는 피해량의 100%+100에 해당하는 마법 피해를 대상과 가장 가까운 적 세 명에게 입힙니다.",
  "TFT_Item_Artifact_LichBane": "%i:scaleAP% +50 %i:scaleManaRe% +15 <br>스킬 사용 후 첫 기본 공격 시 180의 추가 마법 피해를 입힙니다.",
  "TFT4_Item_OrnnMuramana": "%i:scaleAD% +15 %i:scaleAP% +10 %i:scaleAttackSpeed% +15% %i:scaleManaRe% +15 <br>전투당 1회 스킬 사용 후 5초 동안 마나 120을 회복합니다.",
  "TFT_Item_Artifact_WitsEnd": "%i:scaleAttackSpeed% +30% %i:scaleMR% +30 <br>기본 공격 시 42의 추가 마법 피해를 입힙니다. 입힌 모든 마법 피해의 35%만큼 체력을 회복합니다.",
  "TFT_Item_Artifact_NavoriFlickerblades": "%i:scaleAD% +30% %i:scaleAttackSpeed% +40% %i:scaleCrit% +20% <br>스킬에 치명타가 적용될 수 있습니다. 스킬 사용 시 3초 동안 공격 속도가 10% 증가합니다.",
  "TFT4_Item_OrnnInfinityForce": "%i:scaleHealth% +250 %i:scaleManaRe% +25 %i:scaleAD% +25% %i:scaleAP% +25 %i:scaleArmor% +25 %i:scaleMR% +25 %i:scaleAttackSpeed% +25% <br>수많은 능력치를 부여합니다.",
  "TFT_Item_Artifact_Mittens": "%i:scaleAttackSpeed% +60% <br>유닛 크기가 작아지고 이동 속도가 증가합니다. 받는 피해량이 20% 감소하고 냉기 효과에 면역이 됩니다.",
  "TFT_Item_Artifact_TheIndomitable": "%i:scaleHealth% +400 %i:scaleArmor% +40 <br>보호막이 파괴되면 보호막 흡수량의 100%만큼 가장 가까운 적에게 마법 피해를 입힙니다. (끝없는 절망)",
  "TFT_Item_Artifact_Dawncore": "%i:scaleAP% +40 %i:scaleManaRe% +20 %i:scaleHealth% +150 <br>마나 100당 피해량이 3% 증가합니다. (최대 45%)",
  "TFT_Item_Artifact_AegisOfDawn": "%i:scaleHealth% +400 %i:scaleAP% +30 <br>체력이 50% 이하가 되면 2초 동안 무적 상태가 되고 1골드를 획득합니다. (다이아몬드 손)",
  "TFT_Item_Artifact_Fishbones": "%i:scaleAD% +45% %i:scaleAttackSpeed% +45% <br>공격 사거리가 2배로 증가하지만 공격 시 무작위 적을 대상으로 지정합니다.",
  "TFT9_Item_OrnnHullbreaker": "%i:scaleAD% +30% %i:scaleAttackSpeed% +30% %i:scaleHealth% +350 <br>전투 시작 시 인접한 아군이 없으면 체력 600을 얻습니다.",
  "TFT_Item_Artifact_StatikkShiv": "%i:scaleAP% +30 %i:scaleAttackSpeed% +30% <br>세 번째 공격마다 4명의 적에게 100의 마법 피해를 입힙니다.",
  "TFT_Item_Artifact_TalismanOfAscension": "%i:scaleHealth% +400 %i:scaleAD% +20% %i:scaleAP% +20 <br>전투 시작 22초 후: 최대 체력이 100% 증가하고 피해량이 120% 증가합니다.",
  "TFT_Item_Artifact_BlightingJewel": "%i:scaleAP% +40 %i:scaleMR% +30 <br>마법 피해를 입히면 대상의 마법 저항력을 3 감소시킵니다. 대상의 마법 저항력이 0이면 마나를 5 회복합니다.",
  "TFT_Item_Artifact_EternalPact": "%i:scaleHealth% +200 %i:scaleArmor% +25 %i:scaleMR% +25 <br>보호막 흡수량의 50%만큼 최대 체력이 증가합니다. (금지된 우상)",
  "TFT_Item_Artifact_SilvermereDawn": "%i:scaleAD% +165% %i:scaleArmor% +50 %i:scaleMR% +50 <br>기절에 면역이 되며 기본 공격 시 대상을 0.8초 동안 기절시킵니다. (재사용 대기시간 6초)",
  "TFT_Item_Artifact_ProwlersClaw": "%i:scaleAD% +25% %i:scaleCrit% +25% <br>적 처치 시 대상에게 돌진하고 다음 기본 공격이 치명타로 적중하며 60%의 추가 피해를 입힙니다.",
  "TFT9_Item_OrnnHorizonFocus": "%i:scaleAD% +15% %i:scaleAP% +15 %i:scaleAttackSpeed% +15% <br>공격 사거리가 1 증가합니다. 대상과 거리가 1칸 멀어질 때마다 피해량이 9% 증가합니다. (저격수의 집중)",
  "TFT4_Item_OrnnZhonyasParadox": "%i:scaleAP% +45 %i:scaleArmor% +30 %i:scaleMR% +30 <br>체력이 40% 이하가 되면 3초 동안 무적 상태가 됩니다.",
  "TFT4_Item_OrnnDeathsDefiance": "%i:scaleAD% +10% %i:scaleAttackSpeed% +25% %i:scaleArmor% +30 <br>받는 피해의 50%를 4초 동안 나누어 입습니다. 모든 피해 흡혈 25%를 얻습니다.",
  "TFT_Item_Artifact_HellfireHatchet": "%i:scaleAP% +50 %i:scaleManaRe% +30 <br>전투 시작: 대상을 향해 에너지 구체를 발사하여 최대 체력의 20%에 해당하는 마법 피해를 입힙니다. (죽음불꽃 손아귀)",
  "TFT_Item_Artifact_HorizonFocus": "%i:scaleHealth% +250 %i:scaleManaRe% +15 %i:scaleArmor% +20 <br>적을 기절시키면 번개를 떨어뜨려 최대 체력의 20%에 해당하는 마법 피해를 입힙니다.",
  "TFT_Item_Artifact_SeekersArmguard": "%i:scaleAP% +25 %i:scaleArmor% +25 %i:scaleMR% +25 <br>처치 관여 시 방어력, 마법 저항력, 주문력이 10씩 증가합니다. 처치 시 15씩 증가합니다.",
  "TFT_Item_Artifact_CappaJuice": "%i:scaleAttackSpeed% +50% <br>스킬을 사용할 수 없으며 마나를 획득할 수 없습니다. 기본 공격 시 공격력의 60%에 해당하는 추가 물리 피해를 입히고 체력을 회복합니다. (타락한 흡혈의 낫)",
  "TFT4_Item_OrnnTheCollector": "%i:scaleAD% +20% %i:scaleCrit% +20% <br>공격 시 체력이 10% 이하인 적을 처형합니다. 처형 시 1골드를 획득합니다.",
  "TFT_Item_Artifact_AegisOfDusk": "%i:scaleHealth% +250 %i:scaleAD% +25% <br>기본 공격 및 스킬 피해가 적의 방어력과 마법 저항력을 50% 감소시킵니다. (칠흑의 양날 도끼)",

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
