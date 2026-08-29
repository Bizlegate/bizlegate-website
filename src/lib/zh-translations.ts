/**
 * Draft Traditional Chinese translations, keyed by the exact same CMS
 * content key used on the English side (e.g. "home.hero.title"). This is a
 * first-pass draft — every one of these is fully editable from /admin under
 * the "中文" tab, and the user is expected to rewrite freely rather than
 * treat this as final copy.
 *
 * Used as the fallback text for the ".zh"-suffixed CMS key: if the admin
 * hasn't saved a Chinese override for a given key yet, the visitor sees this
 * draft instead of blank text (and never sees English by accident when
 * they've switched the site to 中文).
 */
export const ZH_TRANSLATIONS: Record<string, string> = {
  // ---- Home ----
  "home.hero.eyebrow": "美國 · 台灣 · 吉隆坡",
  "home.hero.title": "通往台灣商務的頂級門戶",
  "home.hero.subtitle":
    "Bizlegate 是專精美台商務出訪規劃的頂尖顧問公司。我們為重要企業訪問提供在地引薦與後勤統籌,並安排低調奢華的生活起居,讓您的代表團從落地到啟程都從容自信。我們也提供獨家的吉隆坡商務門路;若您的業務目標涵蓋更廣泛的亞洲市場,歡迎諮詢我們的策略顧問服務。",
  "home.hero.tagline": "直接人脈引薦、精簡高效執行、無需操心的舒適體驗。",
  "home.pain.eyebrow": "現實的挑戰",
  "home.pain.title": "打入台灣市場,不該這麼困難。",
  "home.pain.unfamiliar.title": "不知道該從哪裡切入。",
  "home.pain.unfamiliar.body":
    "從外部看,台灣的機構體系並不透明。沒有由上而下的引薦,單靠信件詢問往往石沉大海。",
  "home.pain.language.title": "英文內容看得懂,卻抓不到重點。",
  "home.pain.language.body":
    "在地網站表面上是英文,但邏輯、架構與真正的用意在翻譯過程中經常流失,讓人只能靠猜測。",
  "home.pain.tradeshow.title": "參展往往收效有限。",
  "home.pain.tradeshow.body":
    "您花了實實在在的預算,結果卻多半流於形式。真正的決策者不會出現在展場,活動結束後也少有後續追蹤。",
  "home.guide.eyebrow": "您有我們",
  "home.guide.title": "Bizlegate,您在台灣的在地夥伴",
  "home.guide.savings.title": "精簡人力,降低成本",
  "home.guide.savings.body":
    "派出龐大團隊已不合時宜。一位值得信賴的在地夥伴,就能大幅減少差旅開銷,同時確保您原有團隊的營運不中斷。",
  "home.guide.navigator.title": "您的在地領航員",
  "home.guide.navigator.body":
    "優秀的領導者懂得把對的人放在對的位置上。在當地事務的安排上,我們能輕鬆帶來您團隊觸及不到的洞察與資源。",
  "home.guide.local.title": "最全方位的在地夥伴",
  "home.guide.local.body":
    "我們深入了解您的產業,真正以同事的角色陪同您出席拜訪與會議。哪些內容須保密,我們也會與您逐一確認,確保任何敏感資訊都不會外流。",
  "home.guide.photos.title": "珍貴時刻,妥善記錄",
  "home.guide.photos.body":
    "每個重要時刻都值得留存,不留遺憾。在取得您完全同意的前提下,我們低調記錄每場會面,產出足以提升企業形象的高品質影像。",

  // ---- Services ----
  "services.hero.eyebrow": "我們的服務",
  "services.hero.title": "為高層出訪打造的完整服務架構。",
  "services.hero.subtitle":
    "從進入董事會的門路,到抵台後的貼心生活安排,每個環節都經過精心設計,讓您的代表團全程保持最佳狀態,並帶著能長久維繫的人脈關係離開。",

  "services.facilitation.eyebrow": "專業商務引薦",
  "services.facilitation.title": "讓會議真正接觸到對的人。",
  "services.facilitation.description":
    "我們開啟真正重要的大門,協調產業、學術與政府層級的高層引薦,讓您的目標能與真正有決策權的人直接對話,持續推進。",
  "services.facilitation.b1":
    "精心安排與產業領袖、投資人及決策者的一對一引薦。",
  "services.facilitation.b2": "對接學術機構、研究單位與政府部門的管道。",
  "services.facilitation.b3": "每場會議提供在地口譯、會前簡報與文化指引。",
  "services.facilitation.b4": "會後持續追蹤協調,讓合作動能在您返程後依然延續。",

  "services.living.eyebrow": "舒適生活安排",
  "services.living.title": "抵台即休息,全程維持最佳狀態。",
  "services.living.description":
    "會議室之外的時間,決定了您走進會議室時的狀態。我們統籌住宿、交通與生活起居,讓每次移動都不消耗您的專注力與精力。",
  "services.living.b1": "市中心精選的五星級住宿與私人管家式公寓。",
  "services.living.b2": "彈性包時或定點接送的專屬禮賓司機服務。",
  "services.living.b3": "台灣頂尖醫院的優先高階健檢安排。",
  "services.living.b4": "可依需求安排的頂級高爾夫球場與私人休閒活動。",

  "services.culture.eyebrow": "精緻文化體驗",
  "services.culture.title": "從內部認識台灣。",
  "services.culture.description":
    "亞洲的人脈關係,往往建立在正式議程之外。我們為您規劃文化體驗,讓此行更有深度、更有溫度,把商務夥伴變成真正的朋友。",
  "services.culture.b1": "私人導覽台北 101 與城市經典建築地標。",
  "services.culture.b2": "故宮博物院與其珍貴皇家典藏。",
  "services.culture.b3": "傳統茶道體驗與職人工藝交流。",
  "services.culture.b4": "靜謐走訪行天宮等台灣人文古蹟。",

  "services.cuisine.eyebrow": "道地美食饗宴",
  "services.cuisine.title": "談判在餐桌上悄悄升溫。",
  "services.cuisine.description":
    "從米其林餐廳到在地人鍾愛的夜市小吃,我們依照您的口味設計美食體驗,呈現最真實的台灣風味。",
  "services.cuisine.b1": "嚴選米其林餐廳。",
  "services.cuisine.b2": "體驗鼎泰豐傳奇十八摺工藝的極致美味。",
  "services.cuisine.b3": "台灣經典熱炒攤名店。",
  "services.cuisine.b4": "凱馬蘭酒廠 VIP 威士忌品鑑之旅。",

  "services.cta.title": "這趟行程,您心中已有藍圖了嗎?",
  "services.cta.description":
    "告訴我們您的目標,我們將依此規劃整趟行程。每項合作,都從一場保密的初步溝通開始。",

  // ---- Process ----
  "process.hero.eyebrow": "我們的合作方式",
  "process.hero.title": "從初次接洽到完美執行,嚴謹規劃的每一步。",
  "process.hero.subtitle":
    "每一次合作都遵循清晰、保密的流程。您隨時掌握進度,清楚誰在負責什麼,以及接下來會發生什麼。",

  "process.step.1.title": "保密初步諮詢",
  "process.step.1.body":
    "透過官網提交諮詢表單與我們聯繫,分享您的目標與時程,我們將於 3 個工作天內完成審閱回覆。",
  "process.step.2.title": "需求釐清會議",
  "process.step.2.body":
    "我們安排線上會議,深入了解您的代表團、優先順序,以及您定義成功的方式。這是策略成形的階段,我們會以聆聽為主。",
  "process.step.3.title": "客製化提案與訂金",
  "process.step.3.body":
    "您將收到一份清楚的計畫:我們能開啟的引薦、建議的行程、我們負責的後勤事項,以及透明的合作條件——不強迫承諾,沒有隱藏費用。正式啟動專案、確保檔期時,接受提案後須支付 50% 訂金。",
  "process.step.4.title": "前置作業與引薦準備",
  "process.step.4.body":
    "確認合作後,我們啟動在地人脈網絡、確認會議行程,並為每位對接窗口做好準備,同時向您說明背景資訊、禮儀重點與即將會面的對象。",
  "process.step.5.title": "尾款結清",
  "process.step.5.body":
    "為確認所有安排並鎖定訂位,尾款須於出發日前至少兩週全數付清。",
  "process.step.6.title": "現場執行陪同",
  "process.step.6.body":
    "我們全程陪同您的代表團,即時應變調整,並記錄每個重要時刻。您可以安心前行,因為值得信賴的夥伴始終在您身旁。",
  "process.step.7.title": "後續追蹤服務(選配)",
  "process.step.7.body":
    "行程結束後,我們協助維繫您建立的關係、進行後續追蹤,並在您返程後持續擔任您在台灣的聯繫窗口——需要時可另行付費延續合作。",

  "process.cta.title": "準備好踏出第一步了嗎?",
  "process.cta.description":
    "一切從一場保密的對話開始。告訴我們您希望在台灣達成什麼目標,其餘的交給我們。",

  // ---- Inquire ----
  "inquire.hero.eyebrow": "私密諮詢",
  "inquire.hero.title": "為您量身規劃此行。",
  "inquire.hero.subtitle":
    "留下幾項基本資訊,我們將於 3 個工作天內親自回覆。您所提供的一切資訊,我們都將嚴格保密。",

  "inquire.form.fullName.label": "姓名",
  "inquire.form.fullName.placeholder": "王小明",
  "inquire.form.organization.label": "公司 / 機構",
  "inquire.form.organization.placeholder": "范例股份有限公司",
  "inquire.form.title.label": "職稱",
  "inquire.form.title.placeholder": "執行長",
  "inquire.form.email.label": "電子郵件",
  "inquire.form.email.placeholder": "john@company.com",
  "inquire.form.email.description": "使用公司信箱有助於我們加快核實與回覆速度。",
  "inquire.form.linkedin.label": "LinkedIn 個人檔案(選填)",
  "inquire.form.linkedin.placeholder": "https://linkedin.com/in/username",
  "inquire.form.arrival.label": "預計抵達日期",
  "inquire.form.departure.label": "預計離開日期",
  "inquire.form.date.placeholder": "請選擇日期",
  "inquire.form.flexible.label": "我的行程日期可以彈性調整",
  "inquire.form.partySize.label": "隨行人數(選填)",
  "inquire.form.partySize.placeholder": "例如:3",
  "inquire.form.interests.label": "感興趣的服務項目(可複選)",
  "inquire.form.interests.description": "請勾選所有符合的項目,我們將依此為您規劃行程。",
  "inquire.form.objectives.label": "此行目標",
  "inquire.form.objectives.placeholder":
    "請告訴我們您希望在此行中達成的目標——最重要的會議、關係,或成果。",
  "inquire.form.privacy.text":
    "我了解所提供的一切資訊將被嚴格保密,僅用於安排此次行程。Bizlegate 絕不會將客戶資料提供予任何第三方。",
  "inquire.form.submit.label": "送出諮詢",

  "inquire.interest.facilitation": "已確認拜訪對象,並已建立聯繫窗口。",
  "inquire.interest.government": "已確認拜訪對象,但尚未建立聯繫窗口。",
  "inquire.interest.investment": "拜訪機構或對象尚待確認。",
  "inquire.interest.living": "其他行程安排需求(請於下方「此行目標」欄位說明)。",
  "inquire.interest.health": "在地交通接送。",
  "inquire.interest.culture": "現場口譯服務。",
  "inquire.interest.cuisine": "專業攝影記錄。",
  "inquire.interest.golf": "會後摘要與追蹤服務。",

  "inquire.success.title": "感謝您的諮詢。",
  "inquire.success.body":
    "我們已收到您的諮詢,所有資訊將嚴格保密。我們團隊將於 3 個工作天內親自回覆。",
};
