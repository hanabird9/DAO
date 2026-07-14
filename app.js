/* ==========================================================================
   DAORAE KOREAN BBQ - BUKIT INDAH OUTLET
   Interactive Frontend Logic
   ========================================================================== */

// Configurable WhatsApp booking number (Daorae Bukit Indah Landline/Mobile)
// Format: Country Code (60 for Malaysia) followed by phone number, no spaces or special characters.
const WHATSAPP_PHONE_NUMBER = "60126398303"; 

// Initialize Supabase Client if config is available
let supabase = null;
if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== "") {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}


// Trilingual Menu Data from daorae.net (verified with correct images and prices)
const MENU_ITEMS = [
    {
        id: "set-1",
        category: "set",
        nameKo: "SET1",
        nameEn: "3~4 pax",
        nameZh: "3~4 pax",
        price: "RM 248.00",
        desc: "Pork Special, Pork Belly, Pork Shoulder, Pork Ribs, Chill Sauce Pork Belly, Kimchi Hot Pot, Vegetables Pancake",
        image: "assets/menu/set1.jpg",
        badge: "Best Combo",
        serving: "Shareable",
        spicy: 0
    },
    {
        id: "set-2",
        category: "set",
        nameKo: "SET2",
        nameEn: "3~4 pax",
        nameZh: "3~4 pax",
        price: "RM 248.00",
        desc: "Pork Special, Pork Belly, Pork Shoulder, Marinated Chicken, Marinated Baby Octopus, Kimchi Hot Pot, Vegetables Pancake",
        image: "assets/menu/set2.jpg",
        badge: "Best Combo",
        serving: "Shareable",
        spicy: 0
    },
    {
        id: "set-3",
        category: "set",
        nameKo: "SET3",
        nameEn: "2~3 pax",
        nameZh: "2~3 pax",
        price: "RM 138.00",
        desc: "Pork Special, Pork Belly, Pork Shoulder, Kimchi Soup, Vegetables Pancake",
        image: "assets/menu/set3.jpg",
        badge: "Best Combo",
        serving: "Shareable",
        spicy: 0
    },
    {
        id: "set-4",
        category: "set",
        nameKo: "SET4",
        nameEn: "2~3 pax",
        nameZh: "2~3 pax",
        price: "RM 138.00",
        desc: "Pork Jowl, Pork Ribs, Marinated Pork Special, Kimchi Soup, Vegetables Pancake",
        image: "assets/menu/set4.jpg",
        badge: "Best Combo",
        serving: "Shareable",
        spicy: 0
    },
    {
        id: "set-5",
        category: "set",
        nameKo: "SET5",
        nameEn: "2~3 pax",
        nameZh: "2~3 pax",
        price: "RM 138.00",
        desc: "Pork Special, Pork Ribs, Marinated Chicken, Kimchi Soup, Vegetables Pancake",
        image: "assets/menu/set5.jpg",
        badge: "Best Combo",
        serving: "Shareable",
        spicy: 0
    },
    {
        id: "set-6",
        category: "set",
        nameKo: "SET6",
        nameEn: "2~3 pax",
        nameZh: "2~3 pax",
        price: "RM 138.00",
        desc: "Pork Ribs, Spicy Chicken, Spicy Baby Octopus, Kimchi Soup, Vegetables Pancake",
        image: "assets/menu/set6.jpg",
        badge: "Best Combo",
        serving: "Shareable",
        spicy: 0
    },
    {
        id: "beef-7",
        category: "beef",
        nameKo: "B01. 갈비본살",
        nameEn: "Galbi Bonsal",
        nameZh: "烤牛排",
        price: "RM 130.00",
        desc: "Fresh boneless short rib without marinade, charcoal grilled",
        image: "assets/menu/galbi_bonsal.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "beef-8",
        category: "beef",
        nameKo: "B02. 생갈비",
        nameEn: "Saeng Galbi",
        nameZh: "牛排",
        price: "RM 130.00",
        desc: "Beef short ribs butterflied or accordion cut, without marinade and char-grilled.",
        image: "assets/menu/saeng_galbi.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "beef-9",
        category: "beef",
        nameKo: "B03. 왕갈비",
        nameEn: "Wang Galbi",
        nameZh: "Wang Galbi",
        price: "RM 130.00",
        desc: "Beef short rib specially hand filleted marinated with special Daorae sauce",
        image: "assets/menu/wang_galbi.jpg",
        badge: "Signature",
        serving: "200g",
        spicy: 0
    },
    {
        id: "beef-10",
        category: "beef",
        nameKo: "B04. 우설구이",
        nameEn: "Woo Seul Gui",
        nameZh: "Woo Seul Gui",
        price: "RM 90.00",
        desc: "Thinly sliced Ox-tongue",
        image: "assets/menu/woo_seul_gui.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "beef-11",
        category: "beef",
        nameKo: "B05. 소고기모둠",
        nameEn: "Beep Modum",
        nameZh: "Beep Modum",
        price: "RM 320.00",
        desc: "Four kinds of assorted beef BBQ sampler (Ox tongue, boneless short rib, brisket, short rib)",
        image: "assets/menu/beep_modum.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "beef-12",
        category: "beef",
        nameKo: "B06. LA 갈비",
        nameEn: "LA Galbi",
        nameZh: "LA排骨",
        price: "RM 125.00",
        desc: "LA Beef Ribs are beef ribs with diagonally cut bones that protrude along the long edge. They are used mostly for grilled and braised dishes.      LA排骨是将整条排骨切成与骨头呈直角方向，形成连骨带肉的T骨牛排，主要可做烧烤或炖排骨。   LA갈비는 통 갈비 대를 뼈와 직각 방향으로 잘라서 중간 중간에 조금한 갈비뼈가 붙어있는 형태를 말한다. 주로 구이나 찜으로 이용한다.",
        image: "assets/menu/la_galbi.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "beef-13",
        category: "beef",
        nameKo: "B07. 갈비살주물럭",
        nameEn: "Galbi Sal",
        nameZh: "Galbi Sal",
        price: "RM 125.00",
        desc: "Boneless beef short rib marinated in special Daorae sauce",
        image: "assets/menu/galbi_sal.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "beef-14",
        category: "beef",
        nameKo: "B08. 우삼겹",
        nameEn: "Woo Samgyeop",
        nameZh: "Woo Samgyeop",
        price: "RM 80.00",
        desc: "Thin slices of richly marbled beef without marinade",
        image: "assets/menu/woo_samgyeop.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "pork-15",
        category: "pork",
        nameKo: "P01. 돼지스페셜",
        nameEn: "Dwaeji Special",
        nameZh: "猪面颊肉",
        price: "RM 45.00",
        desc: "Selected cuts of pork that is soft and tender",
        image: "assets/menu/dwaeji_special.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "pork-16",
        category: "pork",
        nameKo: "P02. 항정살",
        nameEn: "Hang Jung Sal",
        nameZh: "Hang Jung Sal",
        price: "RM 45.00",
        desc: "Charcoal grilled sliced pork jowls",
        image: "assets/menu/hang_jung_sal.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "pork-17",
        category: "pork",
        nameKo: "P03. 목살",
        nameEn: "Mok Sal",
        nameZh: "Mok Sal",
        price: "RM 38.00",
        desc: "Charcoal grilled fresh neck shoulder pork",
        image: "assets/menu/mok_sal.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "pork-18",
        category: "pork",
        nameKo: "P04. 삼겹살",
        nameEn: "Samgyeopsal",
        nameZh: "烤五花肉",
        price: "RM 38.00",
        desc: "五花肉是猪肚腩部位的肉，因瘦肉 和脂肪交替，所以肉质软嫩可口。一般是生肉 直接上火烤，烤熟后沾盐或调味大酱吃，也可 以用蔬菜包肉吃。",
        image: "assets/menu/samgyeopsal.jpg",
        badge: "Signature",
        serving: "200g",
        spicy: 0
    },
    {
        id: "pork-19",
        category: "pork",
        nameKo: "P05. 고추장 삼겹살",
        nameEn: "Gochujang Samgyeopsal",
        nameZh: "辣椒酱烤五花肉",
        price: "RM 42.00",
        desc: "将五花肉用辣椒酱做成的调味酱搅拌后，烤着吃或炒着吃即可。用辣椒酱调味的五花肉肥而不腻，非常香嫩。",
        image: "assets/menu/gochujang_samgyeopsal.jpg",
        badge: "Signature",
        serving: "200g",
        spicy: 2
    },
    {
        id: "pork-20",
        category: "pork",
        nameKo: "P06. 양념 돼지갈비",
        nameEn: "Yangnyeom Dwaeji Galbi",
        nameZh: "Yangnyeom Dwaeji Galbi",
        price: "RM 42.00",
        desc: "将猪排肉用调味汁腌渍以后放到炭 火上烤熟即可。",
        image: "assets/menu/yangnyeom_dwaeji_galbi.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "pork-21",
        category: "pork",
        nameKo: "P07. 한방 돼지왕갈비",
        nameEn: "Hanbang Dwaeji Wang Galbi",
        nameZh: "Hanbang Dwaeji Wang Galbi",
        price: "RM 48.00",
        desc: "Chosen pork ribs specially hand filleted, marinated in special Korean ginseng, herb extracts and special Daorae sauce",
        image: "assets/menu/hanbang_dwaeji_wang_galbi.jpg",
        badge: "Signature",
        serving: "200g",
        spicy: 0
    },
    {
        id: "pork-22",
        category: "pork",
        nameKo: "P08. 돼지 주물럭",
        nameEn: "Dwaeji Jumulluk",
        nameZh: "Dwaeji Jumulluk",
        price: "RM 47.00",
        desc: "Selected cuts of soft pork marinated in special Daorae sauce",
        image: "assets/menu/dwaeji_jumulluk.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "pork-23",
        category: "pork",
        nameKo: "P09. 매운 돼지갈비",
        nameEn: "Maeun Dwaeji Galbi",
        nameZh: "Maeun Dwaeji Galbi",
        price: "RM 42.00",
        desc: "Specially hand filleted chosen pork marinated in Korean spicy chili sauce",
        image: "assets/menu/maeun_dwaeji_galbi.jpg",
        badge: "",
        serving: "200g",
        spicy: 2
    },
    {
        id: "pork-24",
        category: "pork",
        nameKo: "P06. 한방 삼겹살",
        nameEn: "Hanbang Samgyeopsal",
        nameZh: "Hanbang Samgyeopsal",
        price: "RM 35.00",
        desc: "Slices of pork belly marinated in special Korean ginseng and herbs extract",
        image: "assets/menu/hanbang_samgyeopsal.jpg",
        badge: "Signature",
        serving: "200g",
        spicy: 0
    },
    {
        id: "other-bbq-25",
        category: "other-bbq",
        nameKo: "M01. 양념 닭갈비",
        nameEn: "Yangnyeom Dakgalbi",
        nameZh: "Yangnyeom Dakgalbi",
        price: "RM 38.00",
        desc: "鸡肉用辣椒酱调制的调味酱腌一会儿，入味后放在炭火上烤熟即可，是江原道春川的地方特色美食。",
        image: "assets/menu/dak_galbi.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "other-bbq-26",
        category: "other-bbq",
        nameKo: "M02. 닭갈비",
        nameEn: "Dak Galbi",
        nameZh: "Dak Galbi",
        price: "RM 38.00",
        desc: "鸡肉用辣椒酱调制的调味酱腌一会儿，入味后放在炭火上烤熟即可，是江原道春川的地方特色美食。",
        image: "assets/menu/dak_galbi.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "other-bbq-27",
        category: "other-bbq",
        nameKo: "M03. 양념 양고기",
        nameEn: "Yangnyeom Yanggogi",
        nameZh: "Yangnyeom Yanggogi",
        price: "RM 52.00",
        desc: "Chosen cuts of lamb specially hand filleted, marinated in special Daorae sauce",
        image: "assets/menu/yangnyeom_yanggogi.jpg",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "other-bbq-28",
        category: "other-bbq",
        nameKo: "M04. 양념 오징어구이",
        nameEn: "Yangnyeom Ojingeo Gui",
        nameZh: "Yangnyeom Ojingeo Gui",
        price: "RM 57.00",
        desc: "Fresh squid carved and prepared in our hot chili sauce",
        image: "assets/menu/yangnyeom_ojingeo_gui.png",
        badge: "",
        serving: "200g",
        spicy: 0
    },
    {
        id: "other-bbq-29",
        category: "other-bbq",
        nameKo: "M05. 양념 쭈꾸미구이",
        nameEn: "Yangnyeom Jukkumi Gui",
        nameZh: "Yangnyeom Jukkumi Gui",
        price: "RM 57.00",
        desc: "Fresh baby octopus carved and prepared in out hot chili sauce",
        image: "assets/menu/jjuggumi_gui.jpg",
        badge: "",
        serving: "200g",
        spicy: 3
    },
    {
        id: "stew-30",
        category: "stew",
        nameKo: "S01. 김치찌개",
        nameEn: "Kimchi Jjigae",
        nameZh: "猪肉辛奇汤",
        price: "RM 28.00",
        desc: "将酸辛奇放入锅中，再加入猪肉、豆腐以及切成粗丝的葱等材料炖煮即可。肥美的猪肉与酸爽的辛奇形成完美的组合，可谓是韩国人的“灵魂美食”。",
        image: "assets/menu/kimchi_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "stew-31",
        category: "stew",
        nameKo: "S02. 된장찌개",
        nameEn: "DeonJang Jjigae",
        nameZh: "大酱汤",
        price: "RM 30.00",
        desc: "高汤中放入大酱，再加入肉、鱼贝 类、豆腐、西葫芦等熬煮即可。大酱汤的汤汁 浓厚，材料丰富，很适合拌饭吃。",
        image: "assets/menu/doenjang_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "stew-32",
        category: "stew",
        nameKo: "S03. 순두부찌개",
        nameEn: "Sundubujjigae",
        nameZh: "嫩豆腐锅",
        price: "RM 28.00",
        desc: "在砂锅中放入嫩豆腐和牛肉、蛤 蜊、蔬菜，再加入高汤熬煮而成，还可打个鸡 蛋下去。可加入辣椒粉做成辣味，也可不放辣 椒做成清汤。",
        image: "assets/menu/sundubu_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "stew-33",
        category: "stew",
        nameKo: "S04. 해물순두부찌개",
        nameEn: "Haemul Sundubujjigae",
        nameZh: "嫩豆腐锅",
        price: "RM 28.00",
        desc: "在砂锅中放入嫩豆腐和牛肉、蛤 蜊、蔬菜，再加入高汤熬煮而成，还可打个鸡 蛋下去。可加入辣椒粉做成辣味，也可不放辣 椒做成清汤。",
        image: "assets/menu/sundubu_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "stew-34",
        category: "stew",
        nameKo: "S05. 보스된장찌개",
        nameEn: "Boss DoenJang Jjigae",
        nameZh: "Boss大酱汤",
        price: "RM 30.00",
        desc: "Tofu and fresh vegetables in a rich traditional Korean bean broth topped with beef served with rice",
        image: "assets/menu/boss_doenjang_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "stew-35",
        category: "stew",
        nameKo: "S08. 갈비탕",
        nameEn: "GalbiTang",
        nameZh: "牛排骨汤",
        price: "RM 40.00",
        desc: "用牛排骨熬的汤，牛排骨浸泡去血后与萝卜一起熬煮至肉烂，不但汤汁香醇，手抓排骨啃肉的感觉也很畅快。",
        image: "assets/menu/galbi_tang.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "stew-36",
        category: "stew",
        nameKo: "S09. 우거지갈비탕",
        nameEn: "UgeojiGalbiTang",
        nameZh: "干白菜排骨汤",
        price: "RM 40.00",
        desc: "用排骨长时间熬煮制成高汤，再放入泡发的干白菜和大酱熬煮。干白菜是青菜的外表层菜叶，富含膳食纤维，对肠胃好。",
        image: "assets/menu/ugeoji_galbi_tang.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "stew-37",
        category: "stew",
        nameKo: "S10. 육개장",
        nameEn: "YukGaeJang",
        nameZh: "香辣牛肉汤",
        price: "RM 38.00",
        desc: "用牛的排骨和萝卜等长时间熬煮，再加入大葱、青芋茎、蕨菜和辣椒粉等调味而成。",
        image: "assets/menu/yukgaejang.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "hotpot-38",
        category: "hotpot",
        nameKo: "S03. 순두부찌개",
        nameEn: "Sundubujjigae",
        nameZh: "嫩豆腐锅",
        price: "RM 28.00",
        desc: "在砂锅中放入嫩豆腐和牛肉、蛤 蜊、蔬菜，再加入高汤熬煮而成，还可打个鸡 蛋下去。可加入辣椒粉做成辣味，也可不放辣 椒做成清汤。",
        image: "assets/menu/sundubu_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "hotpot-39",
        category: "hotpot",
        nameKo: "S01. 김치찌개",
        nameEn: "Kimchi Jjigae",
        nameZh: "猪肉辛奇汤",
        price: "RM 28.00",
        desc: "将酸辛奇放入锅中，再加入猪肉、豆腐以及切成粗丝的葱等材料炖煮即可。肥美的猪肉与酸爽的辛奇形成完美的组合，可谓是韩国人的“灵魂美食”。",
        image: "assets/menu/kimchi_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "hotpot-40",
        category: "hotpot",
        nameKo: "S02. 된장찌개",
        nameEn: "DeonJang Jjigae",
        nameZh: "大酱汤",
        price: "RM 30.00",
        desc: "高汤中放入大酱，再加入肉、鱼贝 类、豆腐、西葫芦等熬煮即可。大酱汤的汤汁 浓厚，材料丰富，很适合拌饭吃。",
        image: "assets/menu/doenjang_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "hotpot-41",
        category: "hotpot",
        nameKo: "S05. 보스된장찌개",
        nameEn: "Boss DoenJang Jjigae",
        nameZh: "Boss大酱汤",
        price: "RM 30.00",
        desc: "Tofu and fresh vegetables in a rich traditional Korean bean broth topped with beef served with rice",
        image: "assets/menu/boss_doenjang_jjigae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "hotpot-42",
        category: "hotpot",
        nameKo: "S08. 갈비탕",
        nameEn: "GalbiTang",
        nameZh: "牛排骨汤",
        price: "RM 40.00",
        desc: "用牛排骨熬的汤，牛排骨浸泡去血后与萝卜一起熬煮至肉烂，不但汤汁香醇，手抓排骨啃肉的感觉也很畅快。",
        image: "assets/menu/galbi_tang.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "hotpot-43",
        category: "hotpot",
        nameKo: "S09. 우거지갈비탕",
        nameEn: "UgeojiGalbiTang",
        nameZh: "干白菜排骨汤",
        price: "RM 40.00",
        desc: "用排骨长时间熬煮制成高汤，再放入泡发的干白菜和大酱熬煮。干白菜是青菜的外表层菜叶，富含膳食纤维，对肠胃好。",
        image: "assets/menu/ugeoji_galbi_tang.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "hotpot-44",
        category: "hotpot",
        nameKo: "S10. 육개장",
        nameEn: "YukGaeJang",
        nameZh: "香辣牛肉汤",
        price: "RM 38.00",
        desc: "用牛的排骨和萝卜等长时间熬煮，再加入大葱、青芋茎、蕨菜和辣椒粉等调味而成。",
        image: "assets/menu/yukgaejang.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "rice-45",
        category: "rice",
        nameKo: "R01. 돌솥비빔밥",
        nameEn: "Dolsot Bibimbap",
        nameZh: "石锅拌饭",
        price: "RM 30.00",
        desc: "在加热的石锅中分别放入米饭、各种素菜和炒肉丝，用辣椒酱或酱油搅拌即可。石锅有良好的保温效果，可让人细嚼慢咽安心享用，不用担心饭菜变凉。",
        image: "assets/menu/dolsot_bibimbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "rice-46",
        category: "rice",
        nameKo: "R03. 소불고기볶음밥",
        nameEn: "Beep Bulgogi Bokkeumbap",
        nameZh: "Beep Bulgogi Bokkeumbap",
        price: "RM 26.00",
        desc: "Beef bulgogi fried rice",
        image: "assets/menu/beep_bulgogi_bokkeumbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "rice-47",
        category: "rice",
        nameKo: "R04. 돼지불고기볶음밥",
        nameEn: "DwaejiBulgogiBokkeumbap",
        nameZh: "DwaejiBulgogiBokkeumbap",
        price: "RM 26.00",
        desc: "Pork bulgogi fired rice",
        image: "assets/menu/dwaeji_bulgogi_bokkeumbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "rice-48",
        category: "rice",
        nameKo: "R05. 김치볶음밥",
        nameEn: "Kimchi Bokkeumbap",
        nameZh: "辛奇炒饭",
        price: "RM 26.00",
        desc: "Kimchi fried rice topped with fried egg",
        image: "assets/menu/kimchi_bokkeumbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "rice-49",
        category: "rice",
        nameKo: "R06. 잡채볶음밥",
        nameEn: "Japchae Bokkeumbap",
        nameZh: "Japchae Bokkeumbap",
        price: "RM 26.00",
        desc: "Korean glass noodle and rice pan fired with assorted seasoned vegetable",
        image: "assets/menu/japchae_bokkeumbap.png",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "rice-50",
        category: "rice",
        nameKo: "R07. 주먹밥",
        nameEn: "JumeokBap",
        nameZh: "JumeokBap",
        price: "RM 20.00",
        desc: "Rice ball",
        image: "assets/menu/jumeokbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "rice-51",
        category: "rice",
        nameKo: "R08. 공기밥",
        nameEn: "Bap",
        nameZh: "Bap",
        price: "RM 6.00",
        desc: "Steamed rice",
        image: "assets/menu/bap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "noodle-52",
        category: "noodle",
        nameKo: "N03. 물냉면",
        nameEn: "Mul NaengMyeon",
        nameZh: "水冷麺",
        price: "RM 28.00",
        desc: "用白萝卜辛奇汤汁和牛肉高汤调成冰镇汤汁，放入煮熟的荞麦面，再加入一些萝卜、梨等装饰配菜，最后用芥末和食醋调味即可。",
        image: "assets/menu/mul_naengmyeon.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "noodle-53",
        category: "noodle",
        nameKo: "N04. 비빔냉면",
        nameEn: "Bibim NaengMyeon",
        nameZh: "混ぜ冷麺",
        price: "RM 28.00",
        desc: "拌冷面多使用荞麦面。荞麦面煮熟后用凉水冲洗并沥干水分，然后放入白切牛肉片、生拌斑鳐、萝卜、黄瓜等，用调味的辣椒酱拌匀即可",
        image: "assets/menu/bibim_naengmyeon.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "noodle-54",
        category: "noodle",
        nameKo: "N05. 김치비빔국수",
        nameEn: "김치비빔국수",
        nameZh: "김치비빔국수",
        price: "RM 28.00",
        desc: "Chilled Korean noodle mixed in a Korean chili sauce topped with Kimchi",
        image: "assets/menu/image_5d08b9_3.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "noodle-55",
        category: "noodle",
        nameKo: "N06. 김치말이국수",
        nameEn: "KimchiMariGuksu",
        nameZh: "辛奇汤面",
        price: "RM 28.00",
        desc: "用水萝卜辛奇或萝卜缨辛奇、辛奇等的汤汁调和高汤备用，面条煮熟后放入冰镇的高汤中，吃起来十分爽口。上面还可以放些调味后炒熟的牛肉或鸡肉。",
        image: "assets/menu/kimchi_mari_guksu.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "noodle-56",
        category: "noodle",
        nameKo: "N07. 잔치국수",
        nameEn: "JanchiGuksu",
        nameZh: "喜面",
        price: "RM 28.00",
        desc: "在煮熟的面条上放鸡蛋丝等菜码，再浇上鳀鱼汤汁而成。自古用来在婚宴、生日宴、花甲宴时招待宾客。",
        image: "assets/menu/janchi_guksu.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "noodle-57",
        category: "noodle",
        nameKo: "N08. 라면",
        nameEn: "Ramyeon",
        nameZh: "Ramyeon",
        price: "RM 23.00",
        desc: "Korean instant noodle in a spicy and flavorful broth",
        image: "assets/menu/ramyeon.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "other-cuisine-58",
        category: "other-cuisine",
        nameKo: "R01. 돌솥비빔밥",
        nameEn: "Dolsot Bibimbap",
        nameZh: "石锅拌饭",
        price: "RM 30.00",
        desc: "在加热的石锅中分别放入米饭、各种素菜和炒肉丝，用辣椒酱或酱油搅拌即可。石锅有良好的保温效果，可让人细嚼慢咽安心享用，不用担心饭菜变凉。",
        image: "assets/menu/dolsot_bibimbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "other-cuisine-59",
        category: "other-cuisine",
        nameKo: "R03. 소불고기볶음밥",
        nameEn: "Beep Bulgogi Bokkeumbap",
        nameZh: "Beep Bulgogi Bokkeumbap",
        price: "RM 26.00",
        desc: "Beef bulgogi fried rice",
        image: "assets/menu/beep_bulgogi_bokkeumbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "other-cuisine-60",
        category: "other-cuisine",
        nameKo: "R04. 돼지불고기볶음밥",
        nameEn: "DwaejiBulgogiBokkeumbap",
        nameZh: "DwaejiBulgogiBokkeumbap",
        price: "RM 26.00",
        desc: "Pork bulgogi fired rice",
        image: "assets/menu/dwaeji_bulgogi_bokkeumbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "other-cuisine-61",
        category: "other-cuisine",
        nameKo: "R05. 김치볶음밥",
        nameEn: "Kimchi Bokkeumbap",
        nameZh: "辛奇炒饭",
        price: "RM 26.00",
        desc: "Kimchi fried rice topped with fried egg",
        image: "assets/menu/kimchi_bokkeumbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "other-cuisine-62",
        category: "other-cuisine",
        nameKo: "R06. 잡채볶음밥",
        nameEn: "Japchae Bokkeumbap",
        nameZh: "Japchae Bokkeumbap",
        price: "RM 26.00",
        desc: "Korean glass noodle and rice pan fired with assorted seasoned vegetable",
        image: "assets/menu/japchae_bokkeumbap.png",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "other-cuisine-63",
        category: "other-cuisine",
        nameKo: "R07. 주먹밥",
        nameEn: "JumeokBap",
        nameZh: "JumeokBap",
        price: "RM 20.00",
        desc: "Rice ball",
        image: "assets/menu/jumeokbap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "other-cuisine-64",
        category: "other-cuisine",
        nameKo: "R08. 공기밥",
        nameEn: "Bap",
        nameZh: "Bap",
        price: "RM 6.00",
        desc: "Steamed rice",
        image: "assets/menu/bap.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "dosilak-65",
        category: "dosilak",
        nameKo: "L02. 불고기도시락",
        nameEn: "Bulgogi Dosilak",
        nameZh: "Bulgogi Dosilak",
        price: "RM 25.00",
        desc: "Slices of prime beef simmered in its own juices and a special soya sauce broth",
        image: "assets/menu/bulgogi_dosilak.png",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "dosilak-66",
        category: "dosilak",
        nameKo: "L03. 돼지불고기도시락",
        nameEn: "DejiBulgogi Dosilak",
        nameZh: "DejiBulgogi Dosilak",
        price: "RM 25.00",
        desc: "Pork and assortment of vegetable stir fried with Korean chili paste",
        image: "assets/menu/dwaeji_bulgogi_dosilak.png",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "dosilak-67",
        category: "dosilak",
        nameKo: "L04. 오징어볶음도시락",
        nameEn: "Ojingeo Bokeum Dosilak",
        nameZh: "Ojingeo Bokeum Dosilak",
        price: "RM 25.00",
        desc: "Fried squid in a sauce of Korean chili paste",
        image: "assets/menu/ojingeo_bokkeum_dosilak.png",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "dosilak-68",
        category: "dosilak",
        nameKo: "L05. 보쌈도시락",
        nameEn: "Bossam Dosilak",
        nameZh: "Bossam Dosilak",
        price: "RM 25.00",
        desc: "Special recipe steamed tender pork belly",
        image: "assets/menu/bossam_dosilak.png",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "dosilak-69",
        category: "dosilak",
        nameKo: "L07. 김치볶음도시락",
        nameEn: "김치볶음도시락",
        nameZh: "김치볶음도시락",
        price: "RM 25.00",
        desc: "Belly pork fried with Kimchi",
        image: "assets/menu/kimchi_bokkeum_dosilak.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-70",
        category: "beverage",
        nameKo: "V01. Coke",
        nameEn: "Coke",
        nameZh: "Coke",
        price: "RM 5.00",
        desc: "CocaCola (Can)",
        image: "assets/menu/coke.png",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-71",
        category: "beverage",
        nameKo: "V02. Sprite",
        nameEn: "Sprite",
        nameZh: "Sprite",
        price: "RM 5.00",
        desc: "Sprite (Can)",
        image: "assets/menu/sprite.png",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-72",
        category: "beverage",
        nameKo: "V03. 100 Plus",
        nameEn: "100 Plus",
        nameZh: "100 Plus",
        price: "RM 5.00",
        desc: "100 Plus (Can)",
        image: "assets/menu/100_plus.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-73",
        category: "beverage",
        nameKo: "V04. Galamanddeunbae",
        nameEn: "Galamanddeunbae",
        nameZh: "Galamanddeunbae",
        price: "RM 7.00",
        desc: "Korean Crushed Pear Juice (Can)",
        image: "assets/menu/galamanddeunbae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-74",
        category: "beverage",
        nameKo: "V05. 소주",
        nameEn: "Soju",
        nameZh: "Soju",
        price: "RM 35.00",
        desc: "Korean Liqour",
        image: "assets/menu/soju.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-75",
        category: "beverage",
        nameKo: "V08. 레몬소주",
        nameEn: "Lemon Soju",
        nameZh: "Lemon Soju",
        price: "RM 38.00",
        desc: "Korean Liqour with Lemon",
        image: "assets/menu/lemon_soju.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-76",
        category: "beverage",
        nameKo: "V09. 오이소주",
        nameEn: "Cucumber Soju",
        nameZh: "Cucumber Soju",
        price: "RM 38.00",
        desc: "Korean Liqour with Cucumber",
        image: "assets/menu/cucumber_soju.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-77",
        category: "beverage",
        nameKo: "V08. 타이거캔맥주",
        nameEn: "Tiger Beer",
        nameZh: "Tiger Beer",
        price: "RM 13.00",
        desc: "Tiger Beer (Can)",
        image: "assets/menu/tiger_beer.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-78",
        category: "beverage",
        nameKo: "V11. 타이거병맥주",
        nameEn: "Tiger Beer",
        nameZh: "Tiger Beer",
        price: "RM 30.00",
        desc: "Tiger Beer (Bottle)",
        image: "assets/menu/tiger_beer.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-79",
        category: "beverage",
        nameKo: "V12. 한국병맥주",
        nameEn: "Korean Beer",
        nameZh: "Korean Beer",
        price: "RM 35.00",
        desc: "Korean Beer (Bottle)",
        image: "assets/menu/korean_beer.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-80",
        category: "beverage",
        nameKo: "V13. 오십세주",
        nameEn: "OShipSaeJu",
        nameZh: "OShipSaeJu",
        price: "RM 90.00",
        desc: "Combination of Soju & BaekSaeJu in an ice chilled bottle",
        image: "assets/menu/oshipsaeju.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-81",
        category: "beverage",
        nameKo: "V14. 백세주",
        nameEn: "BaekSaeJu",
        nameZh: "BaekSaeJu",
        price: "RM 60.00",
        desc: "Korean Herbal Liqour",
        image: "assets/menu/baeksaeju.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-82",
        category: "beverage",
        nameKo: "V15. 설중매",
        nameEn: "SeolJungMae",
        nameZh: "SeolJungMae",
        price: "RM 65.00",
        desc: "Korean Plum Wine",
        image: "assets/menu/seoljungmae.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
    {
        id: "beverage-83",
        category: "beverage",
        nameKo: "V16. 복분자",
        nameEn: "BokBunJa",
        nameZh: "BokBunJa",
        price: "RM 65.00",
        desc: "Korean Raspberry Wine",
        image: "assets/menu/bokbunja.jpg",
        badge: "",
        serving: "1 Pax",
        spicy: 0
    },
];



// Document Elements
document.addEventListener("DOMContentLoaded", () => {
    // 1. Navigation Sticky & Active Link logic
    const header = document.querySelector(".header");
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    
    window.addEventListener("scroll", () => {
        // Sticky Header Change
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        // Active Link Highlight
        let currentSection = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute("id");
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    });

    // 2. Mobile Menu Toggle
    const menuToggleBtn = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    
    if (menuToggleBtn && navMenu) {
        menuToggleBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const isOpen = navMenu.classList.contains("active");
            menuToggleBtn.innerHTML = isOpen 
                ? '<i data-lucide="x"></i>' 
                : '<i data-lucide="menu"></i>';
            lucide.createIcons();
        });
        
        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                menuToggleBtn.innerHTML = '<i data-lucide="menu"></i>';
                lucide.createIcons();
            });
        });
    }

    // 3. Render Menu items dynamically
    const menuGrid = document.querySelector(".menu-grid");
    
    function renderMenu(items) {
        if (!menuGrid) return;
        menuGrid.innerHTML = "";
        
        items.forEach(item => {
            // Generate spicy pepper icons
            let spicyHtml = "";
            if (item.spicy > 0) {
                spicyHtml = '<div class="menu-spicy">';
                for (let i = 0; i < item.spicy; i++) {
                    spicyHtml += '<i data-lucide="flame" style="width:14px; height:14px;"></i>';
                }
                spicyHtml += '</div>';
            }
            
            // Robust fallback for missing images to avoid misrepresenting food
            let imageSrc = item.image;
            if (!imageSrc || imageSrc === "None") {
                if (item.category === "beef") {
                    imageSrc = "assets/hero.jpg";
                } else if (item.category === "pork") {
                    imageSrc = "assets/pork.jpg";
                } else if (item.category === "stew" || item.category === "hotpot") {
                    imageSrc = "assets/banchan.jpg";
                } else {
                    imageSrc = "assets/banchan.jpg";
                }
            }
            
            const card = document.createElement("div");
            card.className = "menu-card reveal";
            card.setAttribute("data-id", item.id);
            card.innerHTML = `
                <div class="menu-card-img-wrapper">
                    <img src="${imageSrc}" alt="${item.nameEn}" loading="lazy">
                    ${item.badge ? `<span class="menu-card-badge">${item.badge}</span>` : ''}
                </div>
                <div class="menu-card-content">
                    <div class="menu-card-title-row">
                        <div class="menu-titles">
                            <span class="menu-title-ko">${item.nameKo}</span>
                            <h3 class="menu-title-en">${item.nameEn}</h3>
                            <span class="menu-title-zh">${item.nameZh}</span>
                        </div>
                        <span class="menu-price">${item.price}</span>
                    </div>
                    <p class="menu-desc">${item.desc}</p>
                    <div class="menu-card-footer">
                        <div class="menu-serving">
                            <i data-lucide="info" style="width:14px; height:14px;"></i>
                            <span>Serving: ${item.serving}</span>
                        </div>
                        ${spicyHtml}
                    </div>
                </div>
            `;
            menuGrid.appendChild(card);
        });
        
        // Refresh icons and add active class to visible cards for smooth presentation
        lucide.createIcons();
        setTimeout(() => {
            const cards = menuGrid.querySelectorAll(".menu-card");
            cards.forEach(card => card.classList.add("active"));
        }, 50);
    }
    
    // Helper to get unique items for 'All' view to avoid duplicate listings
    function getUniqueItems(items) {
        const unique = [];
        const seen = new Set();
        items.forEach(item => {
            // Exclude beverages from the 'All' view to keep it completely hidden
            if (item.category === "beverage") return;
            
            // Match unique items by English name to remove cross-category copies
            const compareName = item.nameEn.trim().toLowerCase();
            if (!seen.has(compareName)) {
                seen.add(compareName);
                unique.push(item);
            }
        });
        return unique;
    }
    
    // Initial menu rendering
    renderMenu(getUniqueItems(MENU_ITEMS));

    // 4. Menu Filtering Logic
    const filterButtons = document.querySelectorAll(".filter-btn");
    
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const category = btn.getAttribute("data-filter");
            
            // Apply fade-out animation first
            if (menuGrid) {
                const cards = menuGrid.querySelectorAll(".menu-card");
                cards.forEach(card => {
                    card.style.opacity = "0";
                    card.style.transform = "translateY(20px)";
                });
                
                setTimeout(() => {
                    if (category === "all") {
                        renderMenu(getUniqueItems(MENU_ITEMS));
                    } else {
                        const filtered = MENU_ITEMS.filter(item => item.category === category);
                        renderMenu(filtered);
                    }
                }, 300);
            }
        });
    });

    // 5. Reservation Form Submission (Saves to localStorage and redirects to WhatsApp)
    const resForm = document.getElementById("whatsappReservationForm");
    if (resForm) {
        resForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById("res-name");
            const phoneInput = document.getElementById("res-phone");
            const dateInput = document.getElementById("res-date");
            const timeInput = document.getElementById("res-time");
            const paxInput = document.getElementById("res-pax");
            const remarksInput = document.getElementById("res-remarks");
            
            const name = nameInput ? nameInput.value.trim() : "";
            const phone = phoneInput ? phoneInput.value.trim() : "";
            const date = dateInput ? dateInput.value : "";
            const time = timeInput ? timeInput.value : "";
            const pax = paxInput ? paxInput.value : "";
            const remarks = remarksInput ? remarksInput.value.trim() : "";
            
            if (!name || !phone || !date || !time || !pax) {
                alert("Please fill in all required fields (Name, Phone, Date, Time, and Guests Count).");
                return;
            }
            
            // 1. Save Reservation locally/cloud for Admin Panel
            const newReservation = {
                id: "res-" + Date.now(),
                name: name,
                phone: phone,
                date: date,
                time: time,
                pax: pax,
                remarks: remarks,
                status: "Pending", // Statuses: Pending, Confirmed, Cancelled
                createdAt: new Date().toISOString()
            };
            
            if (supabase) {
                try {
                    const { error } = await supabase
                        .from('reservations')
                        .insert([newReservation]);
                    if (error) throw error;
                } catch (err) {
                    console.error("Supabase Save Error, falling back to localStorage:", err);
                    saveToLocalStorage(newReservation);
                }
            } else {
                saveToLocalStorage(newReservation);
            }

            function saveToLocalStorage(resObj) {
                let reservations = JSON.parse(localStorage.getItem("daorae_reservations")) || [];
                reservations.push(resObj);
                localStorage.setItem("daorae_reservations", JSON.stringify(reservations));
            }
            
            // 2. Format WhatsApp Message
            let message = `Hello Daorae Korean BBQ Bukit Indah! 😊\n\n`;
            message += `I would like to make a table reservation:\n`;
            message += `📌Name: ${name}\n`;
            message += `📞Phone: ${phone}\n`;
            message += `📅Date: ${date}\n`;
            message += `⏰Time: ${time}\n`;
            message += `👥Guests: ${pax} pax\n`;
            
            if (remarks) {
                message += `💬Special Requests: ${remarks}\n`;
            }
            
            message += `\nThank you! Please confirm if a table is available.`;
            
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE_NUMBER}&text=${encodedMessage}`;
            
            // Open in new tab and alert user
            window.open(whatsappUrl, "_blank");
            alert("Your reservation has been recorded locally. We are opening WhatsApp to contact our staff!");
            
            // Clear form
            resForm.reset();
        });
    }

    // 6. Dynamic Gallery Logic
    const DEFAULT_GALLERY = [
        {
            src: "assets/menu/wang_galbi.jpg",
            category: "Beef BBQ",
            title: "Charcoal Sizzled Wang Galbi"
        },
        {
            src: "assets/menu/samgyeopsal.jpg",
            category: "Pork BBQ",
            title: "Pristine Samgyeopsal"
        },
        {
            src: "assets/menu/sundubu_jjigae.jpg",
            category: "Korean Stews",
            title: "Fiery Sundubu Jjigae"
        },
        {
            src: "assets/interior.jpg",
            category: "Interior",
            title: "Warm Dining Ambience"
        }
    ];

    async function initGallery() {
        const galleryGrid = document.getElementById("gallery-grid");
        if (!galleryGrid) return;
        
        let gallery = [];
        
        if (supabase) {
            try {
                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('gallery')
                    .select('*')
                    .order('id', { ascending: true });
                
                if (error) throw error;
                
                if (data && data.length > 0) {
                    gallery = data;
                } else {
                    // Seed Supabase with DEFAULT_GALLERY
                    for (const item of DEFAULT_GALLERY) {
                        await supabase.from('gallery').insert([{
                            src: item.src,
                            category: item.category,
                            title: item.title
                        }]);
                    }
                    gallery = DEFAULT_GALLERY;
                }
            } catch (err) {
                console.error("Supabase Gallery fetch failed, using fallback:", err);
                gallery = JSON.parse(localStorage.getItem("daorae_gallery")) || DEFAULT_GALLERY;
            }
        } else {
            gallery = JSON.parse(localStorage.getItem("daorae_gallery"));
            if (!gallery || gallery.length === 0) {
                gallery = DEFAULT_GALLERY;
                localStorage.setItem("daorae_gallery", JSON.stringify(gallery));
            }
        }
        
        galleryGrid.innerHTML = "";
        gallery.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";
            itemDiv.innerHTML = `
                <img src="${item.src}" alt="${item.title}" loading="lazy">
                <div class="gallery-overlay">
                    <span class="gallery-category">${item.category}</span>
                    <h4 class="gallery-title">${item.title}</h4>
                </div>
            `;
            galleryGrid.appendChild(itemDiv);
        });
    }
    
    // Initialize dynamic gallery
    initGallery();

    // 7. Scroll Reveal Animation Logic (Intersection Observer)
    const revealElements = document.querySelectorAll(".reveal");
    
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });
        
        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add("active"));
    }
});


