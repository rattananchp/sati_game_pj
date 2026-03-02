// app/game/chat/data.ts

export type Choice = {
    text: string;
    isCorrect?: boolean;
    reaction: string;
    next?: ChatScenario;
    memeTitle?: string;
    memeDesc?: string;
    memeIcon?: string;
    lossType?: 'money' | 'data';
};

export type ChatScenario = {
    id: string;
    category: string;
    categoryTitle: string;
    level: number;
    name: string;
    avatar: string;
    lossType?: 'money' | 'data';
    msgs: string[];
    choices: [Choice, Choice];
    reaction?: string;
};

export const chatData: ChatScenario[] = [
    // ==========================================
    // หมวดที่ 1: แก๊งคอลเซ็นเตอร์ & แอบอ้าง (10 ด่าน ยื้อตึงๆ)
    // ==========================================
    
    // ด่าน 1: ไปรษณีย์ไทย (Classic)
    {
        id: "callcenter-1",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 1,
        name: "ไปรษณีย์ไทย (ฝ่ายตรวจสอบ)",
        avatar: "📦",
        lossType: "money",
        msgs: [
            "สวัสดีครับ แจ้งจากไปรษณีย์ไทย",
            "พัสดุหมายเลข TH998877 ของคุณถูกตีกลับจากศุลกากร",
            "เนื่องจากสแกนพบ 'พาสปอร์ตปลอม 15 เล่ม' ภายในกล่องครับ"
        ],
        choices: [
            {
                text: "A: ตกใจ! ไม่เคยส่งพาสปอร์ตนะ",
                reaction: "พัสดุระบุชื่อและเบอร์โทรของคุณชัดเจนครับ",
                next: {
                    id: "callcenter-1-sub1", category: "callcenter", categoryTitle: "", level: 1, name: "ไปรษณีย์ไทย", avatar: "📦",
                    msgs: [
                        "ตอนนี้ทางเราได้ประสานงานกับ สภ.เมืองเชียงใหม่ แล้ว",
                        "คุณสะดวกเดินทางไปให้ปากคำที่เชียงใหม่ภายใน 2 ชั่วโมงไหมครับ?"
                    ],
                    choices: [
                        {
                            text: "A: ไปไม่ได้ครับ อยู่ไกลมากทำไงดี?",
                            reaction: "งั้นเดี๋ยวผมโอนสายให้ 'ผู้กองสมชาย' รับแจ้งความออนไลน์นะครับ",
                            next: {
                                id: "callcenter-1-sub2", category: "callcenter", categoryTitle: "", level: 1, name: "สภ.เมืองเชียงใหม่", avatar: "👮‍♂️",
                                msgs: [
                                    "(เสียงวิทยุสื่อสารแทรก) สวัสดีครับ ผู้กองสมชายรับสาย",
                                    "เพื่อพิสูจน์ความบริสุทธิ์ คุณต้องโอนเงินในบัญชีมาให้กองปราบตรวจสอบ",
                                    "ใช้เวลา 15 นาที ถ้าไม่ผิดเดี๋ยวโอนคืนให้ครับ"
                                ],
                                choices: [
                                    { text: "A: ได้ครับ โอนไปที่บัญชีไหนครับ?", isCorrect: false, reaction: "โอนเข้าบัญชีกลาง นายสมปอง ครับ", memeTitle: "SAD...", memeDesc: "ตำรวจจริงไม่มีนโยบายให้โอนเงินตรวจสอบ!", memeIcon: "💸" },
                                    { text: "B: ตำรวจบ้าอะไรให้โอนเงิน แจ้งความท้องที่ผมดีกว่า", isCorrect: true, reaction: "เดี๋ยวผมจะออกหมายจับคุณ! (ตัดสาย)", memeTitle: "NICE SAVE", memeDesc: "มีสติ ไม่ตื่นตระหนก รอดไปได้!", memeIcon: "🛡️" }
                                ]
                            }
                        },
                        { text: "B: สะดวกครับ เดี๋ยวเจอกันที่โรงพักเชียงใหม่เลย", isCorrect: true, reaction: "เอ่อ... (รีบตัดสายทิ้ง)", memeTitle: "CALL BLUFF", memeDesc: "เล่นมุกนี้ โจรไปไม่เป็นเลยทีเดียว!", memeIcon: "😏" }
                    ]
                }
            },
            {
                text: "B: ส่งผิดรึเปล่าครับ ผมสั่งแต่เสื้อผ้า",
                reaction: "แต่ชื่อผู้ส่งเป็นชื่อคุณนะครับ",
                next: {
                    id: "callcenter-1-sub3", category: "callcenter", categoryTitle: "", level: 1, name: "ไปรษณีย์ไทย", avatar: "📦",
                    msgs: ["ถ้าคุณยืนยันว่าไม่ได้ส่ง คุณต้องโอนค่าธรรมเนียมยกเลิกพัสดุ 1,500 บาท", "ไม่งั้นจะมีความผิดทางกฎหมายครับ"],
                    choices: [
                        { text: "A: โอนก็ได้ครับ จะได้จบๆ ไป", isCorrect: false, reaction: "รอรับสลิปนะครับ (บล็อก)", memeTitle: "EASY PREY", memeDesc: "ตัดรำคาญด้วยการโอนเงิน = เสร็จโจร", memeIcon: "🤦" },
                        { text: "B: งั้นทิ้งไปเลยครับ ยกให้", isCorrect: true, reaction: "ไม่ได้ครับ มันผิดกฎหมาย! ฮัลโหล! (ตู๊ดๆ)", memeTitle: "DON'T CARE", memeDesc: "ไม่แคร์ ไม่สน โจรก็ทำอะไรไม่ได้", memeIcon: "🗿" }
                    ]
                }
            }
        ]
    },

    // ด่าน 2: กสทช. (อายัดเบอร์)
    {
        id: "callcenter-2",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 2,
        name: "กสทช. (ฝ่ายระงับสัญญาณ)",
        avatar: "📡",
        lossType: "data",
        msgs: [
            "ประกาศจาก กสทช. เบอร์มือถือของคุณมีประวัติส่งข้อความหลอกลวง 5,000 ครั้ง",
            "สัญญาณของคุณจะถูกระงับภายใน 1 ชั่วโมง",
            "หากต้องการตรวจสอบ กรุณากด 9"
        ],
        choices: [
            {
                text: "A: (กด 9) ติดต่อเจ้าหน้าที่",
                reaction: "สวัสดีครับ กสทช. รับสายครับ เบอร์คุณไปผูกกับบัญชีม้าครับ",
                next: {
                    id: "callcenter-2-sub1", category: "callcenter", categoryTitle: "", level: 2, name: "เจ้าหน้าที่ กสทช.", avatar: "👨‍💼",
                    msgs: [
                        "เราจำเป็นต้องตรวจสอบข้อมูลทะเบียนราษฎร์ของคุณ",
                        "กรุณาแอดไลน์ไอดี @NBTC-Police เพื่อส่งรูปบัตรประชาชนหน้า-หลัง"
                    ],
                    choices: [
                        { text: "A: แอดไลน์ไปแล้วครับ ต้องถ่ายรูปคู่บัตรไหม?", isCorrect: false, reaction: "ถ่ายมาให้ชัดเจนนะครับ (โดนเอาข้อมูลไปกู้เงิน)", memeTitle: "IDENTITY THEFT", memeDesc: "ส่งรูปบัตรให้คนแปลกหน้า = หายนะ!", memeIcon: "🪪" },
                        { text: "B: หน่วยงานรัฐใช้ LINE @ ธรรมดาหรอครับ?", isCorrect: true, reaction: "เป็นไลน์พิเศษสำหรับคดีด่วนครับ! (แถ)", memeTitle: "SHARP EYE", memeDesc: "หน่วยงานรัฐไม่ให้แอดไลน์คุยเรื่องบัตร ปชช. หรอกนะ", memeIcon: "👀" }
                    ]
                }
            },
            {
                text: "B: ระงับไปเลยครับ ใช้เบอร์อื่นอยู่",
                reaction: "ทางเราจะดำเนินคดีตามกฎหมายสูงสุดนะครับ!",
                next: {
                    id: "callcenter-2-sub2", category: "callcenter", categoryTitle: "", level: 2, name: "กสทช.", avatar: "📡",
                    msgs: ["ถ้าไม่ให้ความร่วมมือ จะส่งตำรวจไปจับที่บ้านเดี๋ยวนี้"],
                    choices: [
                        { text: "A: ยอมแล้วครับ ต้องทำไงบอกมาเลย", isCorrect: false, reaction: "โอนเงินมาประกันตัว 5,000 บาทครับ", memeTitle: "PANIC MODE", memeDesc: "โดนขู่คำเดียว สติหลุดเลย!", memeIcon: "😱" },
                        { text: "B: มาเลยครับ ซื้อหมูปิ้งมารอแล้ว", isCorrect: true, reaction: "ไอ้... (ด่าพ่อแล้วตัดสาย)", memeTitle: "HUNGRY TROLL", memeDesc: "หิวหมูปิ้งมากกว่ากลัวโดนจับ!", memeIcon: "🍢" }
                    ]
                }
            }
        ]
    },

    // ด่าน 3: บัตรเครดิต (รูดผิดปกติ)
    {
        id: "callcenter-3",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 3,
        name: "ศูนย์บัตรเครดิต K-Bank",
        avatar: "💳",
        lossType: "money",
        msgs: [
            "สวัสดีค่ะ แจ้งเตือนยอดรูดบัตรเครดิตผิดปกติ",
            "มีการรูดซื้อทองคำมูลค่า 50,000 บาท ที่ห้างในภูเก็ต",
            "หากคุณไม่ได้ทำรายการ กรุณายืนยันเพื่อยกเลิก"
        ],
        choices: [
            {
                text: "A: ไม่ได้รูดเลยค่ะ! ยกเลิกด่วน",
                reaction: "เพื่อการยกเลิก รบกวนแจ้งหมายเลขหน้าบัตร 16 หลักค่ะ",
                next: {
                    id: "callcenter-3-sub1", category: "callcenter", categoryTitle: "", level: 3, name: "เจ้าหน้าที่บัตร", avatar: "👩‍💼",
                    msgs: [
                        "ขอบคุณค่ะ ต่อไปขอตัวเลข CVV 3 ตัวหลังบัตร",
                        "และรหัส OTP ที่กำลังจะส่งไปที่มือถือคุณค่ะ"
                    ],
                    choices: [
                        { text: "A: ได้ค่ะ รหัส OTP คือ 884521", isCorrect: false, reaction: "ขอบคุณที่ให้รหัสนะคะ (บัตรโดนรูดจริงทันที)", memeTitle: "OTP = OH TERRIBLE PROBLEM", memeDesc: "ห้ามบอกรหัส OTP กับใครเด็ดขาด!", memeIcon: "🔥" },
                        { text: "B: เจ้าหน้าที่ธนาคารทำไมไม่รู้เลขบัตรลูกค้าล่ะ?", isCorrect: true, reaction: "ระบบเราโดนล็อกค่ะ เลยต้องถามเพื่อยืนยัน (แถสุดๆ)", memeTitle: "LOGIC WIN", memeDesc: "ตรรกะง่ายๆ แต่ทำมิจฉาชีพไปไม่เป็น!", memeIcon: "🧠" }
                    ]
                }
            },
            {
                text: "B: รูดเองแหละค่ะ รวยจัด",
                reaction: "เอ่อ... คุณลูกค้าแน่ใจนะคะว่ารูดซื้อทอง?",
                next: {
                    id: "callcenter-3-sub2", category: "callcenter", categoryTitle: "", level: 3, name: "เจ้าหน้าที่บัตร", avatar: "👩‍💼",
                    msgs: ["ถ้าใช่ รบกวนโอนค่าธรรมเนียมรูดบัตรข้ามจังหวัด 500 บาทด้วยค่ะ"],
                    choices: [
                        { text: "A: โอนก็โอนค่ะ (ยอมจ่าย 500)", isCorrect: false, reaction: "เรียบร้อยค่ะ (กินเงินฟรี)", memeTitle: "FLEX GONE WRONG", memeDesc: "รวยทิพย์ โดนหลอกจริง!", memeIcon: "💸" },
                        { text: "B: ผมไม่มีบัตรเครดิตธนาคารนี้ครับ", isCorrect: true, reaction: "อ้าว หรอคะ... (ตื๊ดๆๆ)", memeTitle: "NO CARD NO PROBLEM", memeDesc: "ไม่มีบัตร ก็ไม่มีหนี้ให้แฮก!", memeIcon: "🙅" }
                    ]
                }
            }
        ]
    },

    // ด่าน 4: การไฟฟ้านครหลวง (จะตัดไฟ)
    {
        id: "callcenter-4",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 4,
        name: "การไฟฟ้านครหลวง (ฝ่ายบัญชี)",
        avatar: "⚡",
        lossType: "money",
        msgs: [
            "สวัสดีครับ คุณค้างชำระค่าไฟ 3 เดือน ยอด 4,500 บาท",
            "เจ้าหน้าที่จะเข้าไปตัดมิเตอร์ไฟที่บ้านภายใน 1 ชั่วโมงครับ",
            "จะชำระตอนนี้เพื่อเลื่อนการตัดไฟไหมครับ?"
        ],
        choices: [
            {
                text: "A: อ้าว ลืมจ่ายหรอ! จ่ายตอนนี้เลยครับ",
                reaction: "ดีครับ แอดไลน์การไฟฟ้ามาที่ @MEA-Help เพื่อรับคิวอาร์โค้ด",
                next: {
                    id: "callcenter-4-sub1", category: "callcenter", categoryTitle: "", level: 4, name: "แอดมิน กฟน.", avatar: "📱",
                    msgs: [
                        "ระบบสร้าง QR Code ไม่ได้ครับ",
                        "รบกวนโหลดแอป MEA (ไฟล์ APK) จากลิงก์นี้เพื่อกดชำระเงินแทนครับ"
                    ],
                    choices: [
                        { text: "A: โหลดแล้วครับ กำลังกดเข้าแอป", isCorrect: false, reaction: "(มือถือจอดำ โดนดูดเงินหมดบัญชี)", memeTitle: "REMOTE HACKED", memeDesc: "โหลดแอปเถื่อน โดนรีโมทควบคุมมือถือ!", memeIcon: "📱" },
                        { text: "B: ขอไปจ่ายที่ 7-11 หน้าปากซอยดีกว่า", isCorrect: true, reaction: "ไม่ได้ครับ ต้องจ่ายผ่านแอปเราเท่านั้น!", memeTitle: "SAFE WALK", memeDesc: "เดินไปจ่ายเอง ปลอดภัยกว่าโหลดลิงก์มั่ว!", memeIcon: "🚶‍♂️" }
                    ]
                }
            },
            {
                text: "B: ตัดเลยครับ ช่วงนี้อากาศหนาว",
                reaction: "คุณจะไม่มีไฟฟ้าใช้นะครับ! โทรศัพท์ก็จะชาร์จไม่ได้!",
                next: {
                    id: "callcenter-4-sub2", category: "callcenter", categoryTitle: "", level: 4, name: "ช่างไฟจำแลง", avatar: "🛠️",
                    msgs: ["ถ้าช่างไปถึงหน้าบ้าน จะเสียค่าต่อไฟใหม่ 2,000 บาทนะ จ่ายครึ่งเดียวก่อนไหม?"],
                    choices: [
                        { text: "A: งั้นโอนครึ่งนึงก่อนก็ได้ หยวนๆ", isCorrect: false, reaction: "ดีมากครับน้อง (หวานเจี๊ยบ)", memeTitle: "HALF SCAMMED", memeDesc: "จะครึ่งเดียวหรือเต็มจำนวน ก็โดนหลอกอยู่ดี", memeIcon: "📉" },
                        { text: "B: ผมจุดเทียนอยู่ครับ โรแมนติกดี", isCorrect: true, reaction: "...ไอ้บ้าเอ้ย (วางสาย)", memeTitle: "ROMANTIC VIBES", memeDesc: "สุนทรีย์เกินไป โจรรับมือไม่ไหว!", memeIcon: "🕯️" }
                    ]
                }
            }
        ]
    },

    // ด่าน 5: DSI (คดีฟอกเงินระดับชาติ)
    {
        id: "callcenter-5",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 5,
        name: "กรมสอบสวนคดีพิเศษ (DSI)",
        avatar: "🕵️‍♂️",
        lossType: "data",
        msgs: [
            "ผมพันตำรวจโท... แจ้งจาก DSI",
            "เราจับกุม 'เสี่ยโป้' ได้ และพบสมุดบัญชีชื่อคุณในตู้เซฟ",
            "คุณถูกซัดทอดว่ารับจ้างเปิดบัญชีม้าครับ"
        ],
        choices: [
            {
                text: "A: บัญชีม้าอะไร ไม่เคยรู้จักเสี่ยโป้นะ!",
                reaction: "อย่าเพิ่งปฏิเสธครับ เรามีหลักฐาน",
                next: {
                    id: "callcenter-5-sub1", category: "callcenter", categoryTitle: "", level: 5, name: "ผู้บัญชาการ DSI", avatar: "👮",
                    msgs: [
                        "เราจะทำการบันทึกเสียงและวิดีโอคอลเพื่อสอบปากคำ",
                        "รบกวนมองกล้องและอ่านข้อความตามที่ผมบอก เพื่อบันทึกไบโอเมตริกใบหน้า"
                    ],
                    choices: [
                        { text: "A: (มองกล้อง สแกนหน้า พยักหน้าตามคำสั่ง)", isCorrect: false, reaction: "บันทึกใบหน้าสำเร็จ (เอาไปปลดล็อกแอปธนาคาร)", memeTitle: "FACE SCANNED", memeDesc: "โดนหลอกสแกนหน้าเอาไปทำธุรกรรมเรียบร้อย!", memeIcon: "📸" },
                        { text: "B: ไม่คอลครับ จะสอบปากคำก็ส่งหมายเรียกมา", isCorrect: true, reaction: "ถ้าไม่ร่วมมือเราจะบุกไปค้นบ้านเดี๋ยวนี้!", memeTitle: "LAW EXPERT", memeDesc: "รู้กฎหมาย หมายเรียกต้องเป็นกระดาษเท่านั้น!", memeIcon: "📄" }
                    ]
                }
            },
            {
                text: "B: ดีเลยครับ กำลังอยากเข้าคุกไปหาเพื่อน",
                reaction: "คุณคิดว่าเรื่องนี้เป็นเรื่องล้อเล่นหรอครับ?",
                next: {
                    id: "callcenter-5-sub2", category: "callcenter", categoryTitle: "", level: 5, name: "DSI (เสียงโมโห)", avatar: "😠",
                    msgs: ["โทษจำคุก 10 ปี ปรับ 1 ล้านบาท โอนมาเคลียร์ใต้โต๊ะซะดีๆ 5,000 พอ"],
                    choices: [
                        { text: "A: 5,000 ก็ได้ครับ ถูกกว่าติดคุก", isCorrect: false, reaction: "ขอบคุณครับ ยินดีที่ได้ทำธุรกิจ", memeTitle: "BRIBE GONE WRONG", memeDesc: "คิดจะติดสินบนตำรวจ เจอโจรตัวจริงซะงั้น!", memeIcon: "🤝" },
                        { text: "B: DSI ที่ไหนรับเงินใต้โต๊ะผ่านแชท", isCorrect: true, reaction: "เก่งนักนะมึง! (วางสาย)", memeTitle: "UNBREAKABLE", memeDesc: "โจรโมโหที่หลอกเราไม่ได้!", memeIcon: "😂" }
                    ]
                }
            }
        ]
    },

    // ด่าน 6: กรมที่ดิน (คืนเงินประกันมิเตอร์)
    {
        id: "callcenter-6",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 6,
        name: "กรมที่ดิน (ฝ่ายภาษี)",
        avatar: "🏡",
        lossType: "data",
        msgs: [
            "สวัสดีครับ ติดต่อจากกรมที่ดิน",
            "รัฐบาลมีนโยบายคืนเงินภาษีที่ดินประจำปี 2,500 บาท",
            "คุณยังมีสิทธิ์รับเงินอยู่นะครับ"
        ],
        choices: [
            {
                text: "A: ดีจังเลย ต้องทำยังไงบ้างคะ?",
                reaction: "รบกวนติดตั้งแอป 'Smart Land' เพื่อยืนยันรับสิทธิ์ครับ",
                next: {
                    id: "callcenter-6-sub1", category: "callcenter", categoryTitle: "", level: 6, name: "กรมที่ดิน", avatar: "📱",
                    msgs: [
                        "พอโหลดเสร็จ ให้เข้าไปตั้งรหัส PIN 6 หลัก",
                        "(แนะนำให้ใช้รหัสเดียวกับแอปธนาคาร เพื่อความจำง่ายนะครับ)"
                    ],
                    choices: [
                        { text: "A: โหลดแล้ว ตั้งรหัสเดิมเลย จะได้ไม่ลืม", isCorrect: false, reaction: "(โดนดูดรหัส PIN เอาไปปลดล็อกแอปธนาคาร)", memeTitle: "PIN COMPROMISED", memeDesc: "ให้รหัส PIN ไปง่ายๆ เงินก็ไปง่ายๆ เช่นกัน", memeIcon: "🔢" },
                        { text: "B: จะคืนเงินก็โอนเข้าพร้อมเพย์สิ โหลดแอปทำไม?", isCorrect: true, reaction: "ขั้นตอนใหม่ของรัฐบาลครับ! (พยายามแถ)", memeTitle: "LOGICAL THINKING", memeDesc: "แค่ถามหาเหตุผล โจรก็จนตรอก", memeIcon: "🤔" }
                    ]
                }
            },
            {
                text: "B: ผมเช่าบ้านเขาอยู่ครับ ไม่มีที่ดิน",
                reaction: "งั้นเปลี่ยนเป็นรับสิทธิ์คนละครึ่งแทนไหมครับ?",
                next: {
                    id: "callcenter-6-sub2", category: "callcenter", categoryTitle: "", level: 6, name: "กรมที่ดิน... เอ้ย คนละครึ่ง", avatar: "😅",
                    msgs: ["แค่บอกเลขบัตรประชาชนมา เดี๋ยวพี่ลงทะเบียนให้"],
                    choices: [
                        { text: "A: เอาครับ เลข 1100...", isCorrect: false, reaction: "เสร็จโจร!", memeTitle: "GULLIBLE", memeDesc: "เปลี่ยนมุกหลอก ก็ยังอุตส่าห์ไปเชื่อมันอีก!", memeIcon: "🤦‍♂️" },
                        { text: "B: กรมที่ดินแจกคนละครึ่งตั้งแต่เมื่อไหร่ มั่วละ", isCorrect: true, reaction: "ฝากไว้ก่อนเถอะ! (วางสาย)", memeTitle: "CAUGHT RED-HANDED", memeDesc: "มุกมั่วซั่วแบบนี้ หลอกคนมีสติไม่ได้หรอก!", memeIcon: "🚫" }
                    ]
                }
            }
        ]
    },

    // ด่าน 7: สรรพากร (แจ้งภาษีรายได้)
    {
        id: "callcenter-7",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 7,
        name: "กรมสรรพากร (RD)",
        avatar: "📊",
        lossType: "money",
        msgs: [
            "สวัสดีครับ เราพบว่าปีนี้คุณมีรายได้เข้าบัญชีเกิน 2 ล้านบาท",
            "แต่ยังไม่ได้ยื่นแบบภาษี ภ.ง.ด. 90",
            "กรุณาชำระภาษีย้อนหลังด่วนเพื่อหลีกเลี่ยงค่าปรับ"
        ],
        choices: [
            {
                text: "A: ตกใจ! ปีนี้หนูเพิ่งทำงานได้เดือนเดียวเองนะคะ",
                reaction: "อาจจะมีคนแอบอ้างใช้บัญชีคุณรับเงินสีเทาครับ",
                next: {
                    id: "callcenter-7-sub1", category: "callcenter", categoryTitle: "", level: 7, name: "กรมสรรพากร", avatar: "📊",
                    msgs: [
                        "เพื่ออายัดเงินส่วนนั้น คุณต้องโอนเงินค่ามัดจำศาล 5,000 บาท",
                        "โอนเข้าบัญชีส่วนตัวของหัวหน้าแผนกก่อนได้เลยครับ"
                    ],
                    choices: [
                        { text: "A: โอนไปแล้วค่ะ ช่วยเคลียร์ให้หนูด้วยนะ", isCorrect: false, reaction: "ขอบคุณครับน้อง (หายไปกับสายลม)", memeTitle: "MONEY GONE", memeDesc: "สรรพากรไม่มีบัญชีส่วนตัวให้โอนหรอกนะ!", memeIcon: "💨" },
                        { text: "B: บัญชีส่วนตัวหัวหน้า? สรรพากรทำงานแบบนี้หรอ?", isCorrect: true, reaction: "เอ่อ... เป็นมาตรการเร่งด่วนครับ", memeTitle: "COMMON SENSE", memeDesc: "โอนเงินราชการต้องเป็นชื่อหน่วยงานเท่านั้น!", memeIcon: "🏛️" }
                    ]
                }
            },
            {
                text: "B: สาธุ! ขอให้มีเงินเข้า 2 ล้านจริงๆ เถอะ",
                reaction: "นี่ไม่ใช่เรื่องล้อเล่นนะครับ จะให้ส่งหมายศาลไปไหม?",
                next: {
                    id: "callcenter-7-sub2", category: "callcenter", categoryTitle: "", level: 7, name: "สรรพากร (เริ่มหงุดหงิด)", avatar: "😤",
                    msgs: ["ถ้าไม่โอนภาษีมาตอนนี้ ผมจะสั่งอายัดทุกบัญชีของคุณ!"],
                    choices: [
                        { text: "A: อย่านะครับ ยอมแล้วๆ โอนเลย", isCorrect: false, reaction: "ฮ่าๆ ง่ายจังวะ", memeTitle: "SCAREDY CAT", memeDesc: "โดนขู่นิดเดียวก็ยอมเสียเงินฟรีซะแล้ว", memeIcon: "😿" },
                        { text: "B: ตอนนี้มีอยู่ 20 บาท อายัดไปเลยพี่", isCorrect: true, reaction: "โถ่เอ้ย เสียเวลาคุย! (ตัดสาย)", memeTitle: "EMPTY WALLET", memeDesc: "มีแค่ 20 บาท โจรยังต้องร้องไห้", memeIcon: "🪙" }
                    ]
                }
            }
        ]
    },

    // ด่าน 8: สายการบิน (แจกตั๋วฟรี)
    {
        id: "callcenter-8",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 8,
        name: "Thai Smile Airways (ฝ่ายโปรโมชั่น)",
        avatar: "✈️",
        lossType: "data",
        msgs: [
            "สวัสดีค่ะ ยินดีด้วย! เบอร์ของคุณได้รับเลือกเป็นผู้โชคดี",
            "รับตั๋วเครื่องบินไป-กลับ ญี่ปุ่น ฟรี 2 ที่นั่ง!",
            "เงื่อนไขคือต้องลงทะเบียนรับสิทธิ์ภายใน 10 นาทีนี้ค่ะ"
        ],
        choices: [
            {
                text: "A: กรี๊ดดด! อยากไปญี่ปุ่นพอดี ต้องทำไงคะ?",
                reaction: "รบกวนแอดไลน์ @JapanFreeTrip เพื่อกรอกข้อมูลพาสปอร์ตค่ะ",
                next: {
                    id: "callcenter-8-sub1", category: "callcenter", categoryTitle: "", level: 8, name: "แอดมินสายการบิน", avatar: "👩‍✈️",
                    msgs: [
                        "ทางเราขอเก็บ 'ค่าภาษีสนามบิน' ก่อนนะคะ จำนวน 3,500 บาท",
                        "พอไปถึงสนามบินแล้ว จะคืนเป็นเงินสดให้ค่ะ"
                    ],
                    choices: [
                        { text: "A: แค่ 3,500 แลกกับตั๋วฟรี คุ้ม! โอนค่ะ", isCorrect: false, reaction: "ตั๋วทิพย์บินตรงสู่ความว่างเปล่า~", memeTitle: "FLY TO NOWHERE", memeDesc: "ค่าภาษีสนามบินล่วงหน้า? โดนหลอกแล้ว!", memeIcon: "🛬" },
                        { text: "B: ไหนบอกว่าฟรีทุกอย่างไง ทำไมต้องจ่ายเพิ่ม?", isCorrect: true, reaction: "เป็นกฎกติกาค่ะ... (แถไม่ออก)", memeTitle: "READ THE FINE PRINT", memeDesc: "ของฟรีมักมีเงื่อนไข (แอบแฝง) เสมอ", memeIcon: "🔍" }
                    ]
                }
            },
            {
                text: "B: สายการบินนี้เขาเลิกบินไปแล้วไม่ใช่หรอ?",
                reaction: "เอ่อ... เราเป็นสายการบินเปิดใหม่ ชื่อคล้ายกันค่ะ",
                next: {
                    id: "callcenter-8-sub2", category: "callcenter", categoryTitle: "", level: 8, name: "แอดมิน (เริ่มล่ก)", avatar: "💦",
                    msgs: ["ถ้าไม่รับสิทธิ์ จะโอนให้ผู้โชคดีท่านอื่นเลยนะคะ!"],
                    choices: [
                        { text: "A: เอ้ย รับสิทธิ์ๆ เดี๋ยวกดลิงก์ให้", isCorrect: false, reaction: "(โดนสแปมไวรัสลงมือถือ)", memeTitle: "FOMO", memeDesc: "กลัวพลาดของดี จนลืมเช็คความจริง!", memeIcon: "🏃‍♂️" },
                        { text: "B: โอนให้คนอื่นเลยจ้า ตามสบาย", isCorrect: true, reaction: "ชิ! รู้มากนักนะ (วางสาย)", memeTitle: "GIGA CHAD", memeDesc: "ไม่โลภ ก็ไม่โดนหลอก", memeIcon: "🍷" }
                    ]
                }
            }
        ]
    },

    // ด่าน 9: เพื่อนเก่าขอยืมเงิน (Social Engineering)
    {
        id: "callcenter-9",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 9,
        name: "สมพร (เพื่อนสมัยประถม)",
        avatar: "👦",
        lossType: "money",
        msgs: [
            "เห้ยมึง สบายดีป่าววะ ไม่ได้คุยกันนานเลย",
            "จำกูได้ป่าว สมพรไง ที่เคยเตะบอลด้วยกัน",
            "พอดียายกูเข้าโรงบาล กูช็อตหนักมาก ขอยืมสัก 3,000 ได้ไหม"
        ],
        choices: [
            {
                text: "A: เห้ย สมพรหรอ ได้ๆ ส่งเลขบัญชีมาเลยเพื่อน",
                reaction: "แต๊งกิ้วมากมึง บัญชีชื่อ น.ส.สมศรี นะ (บัญชีแฟนกูเอง)",
                next: {
                    id: "callcenter-9-sub1", category: "callcenter", categoryTitle: "", level: 9, name: "สมพร (เพื่อนรัก)", avatar: "👦",
                    msgs: [
                        "โอนแล้วส่งสลิปมานะ เดี๋ยวเดือนหน้ากูรีบคืนให้พร้อมดอกเลย"
                    ],
                    choices: [
                        { text: "A: โอนละเพื่อน สู้ๆ นะเว้ย", isCorrect: false, reaction: "ขอบใจมากโง่จังเพื่อนรัก (บล็อก)", memeTitle: "BETRAYED", memeDesc: "เพื่อนก็ปลอม บัญชีก็ม้า!", memeIcon: "🔪" },
                        { text: "B: เดี๋ยวๆ ทำไมชื่อบัญชีผู้หญิง? ขอวิดีโอคอลหน่อยดิ", isCorrect: true, reaction: "กูอยู่ไอซียู หมอไม่ให้ใช้เสียง (แถ)", memeTitle: "TRUST ISSUES", memeDesc: "เช็คให้ชัวร์ก่อนโอนให้เพื่อน (ที่ไม่ได้เจอนาน)", memeIcon: "🕵️" }
                    ]
                }
            },
            {
                text: "B: สมพรไหนวะ กูเรียนโรงเรียนหญิงล้วน",
                reaction: "เอ่อ... สงสัยกูจำผิดคน โทษทีๆ",
                next: {
                    id: "callcenter-9-sub2", category: "callcenter", categoryTitle: "", level: 9, name: "มิจฉาชีพ (โป๊ะแตก)", avatar: "🤡",
                    msgs: ["ไหนๆ ก็ทักมาละ สนใจกู้เงินรายวันไหมเจ๊?"],
                    choices: [
                        { text: "A: สนใจค่ะ ดอกเบี้ยเท่าไหร่?", isCorrect: false, reaction: "มาทรงนี้ เสร็จโจรอีกรอบ", memeTitle: "DOUBLE TRAP", memeDesc: "รอดมุกเพื่อนยืมเงิน มาตกม้าตายมุกเงินกู้", memeIcon: "🤦‍♀️" },
                        { text: "B: จะแคปหน้าจอส่งตำรวจละนะ ไปไกลๆ", isCorrect: true, reaction: "กลัวแล้วจ้าาา (หนี)", memeTitle: "SAVAGE", memeDesc: "ด่ากลับแบบสวยๆ โจรหนีหางจุกตูด", memeIcon: "💅" }
                    ]
                }
            }
        ]
    },

    // ด่าน 10: ศาลอาญา (Boss Fight)
    {
        id: "callcenter-10",
        category: "callcenter",
        categoryTitle: "📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง",
        level: 10,
        name: "ศาลอาญาสูงสุด (ฝ่ายเร่งด่วน)",
        avatar: "⚖️",
        lossType: "money",
        msgs: [
            "เราขอแจ้งหมายจับฉบับที่ 45/2567 แจ้งไปยังคุณ...",
            "ศาลได้อนุมัติหมายจับคุณในข้อหา 'ค้ามนุษย์'",
            "กรุณากด 1 เพื่อฟังรายละเอียด หรือเตรียมตัวรับหมายค้นที่บ้าน"
        ],
        choices: [
            {
                text: "A: (มือสั่นกด 1) มีเรื่องเข้าใจผิดแน่ๆ ครับ!",
                reaction: "โอนสายไปยังสารวัตรสืบสวน... รอสักครู่",
                next: {
                    id: "callcenter-10-sub1", category: "callcenter", categoryTitle: "", level: 10, name: "สารวัตรสืบสวน", avatar: "👨‍✈️",
                    msgs: [
                        "ทางเราพบเงินโอนจากแก๊งค้ามนุษย์เข้าบัญชีคุณ 5 ล้านบาท",
                        "เพื่อให้ศาลคุ้มครองชั่วคราว คุณต้องจ่ายเงินประกันตัว 50,000 บาททันที",
                        "ห้ามวางสายเด็ดขาด ถตระเตรียมโอนผ่านแอปเดี๋ยวนี้"
                    ],
                    choices: [
                        { text: "A: โอนให้หมดเลยครับ อย่าจับผมนะ!", isCorrect: false, reaction: "รับทราบครับ ศาลปล่อยตัวคุณแล้ว (หรอ?)", memeTitle: "BOSS DEFEATED... YOU", memeDesc: "บอสแก๊งคอลเซ็นเตอร์เอาชนะคุณได้!", memeIcon: "☠️" },
                        { text: "B: หมายจับบ้าอะไรโทรมาบอกก่อน? มาจับที่บ้านเลยมา", isCorrect: true, reaction: "คุณท้าทายอำนาจศาลหรอ! ตู๊ดๆๆ...", memeTitle: "FINAL BOSS SLAIN", memeDesc: "สติแข็งแกร่งดั่งหินผา! คุณเคลียร์หมวดนี้ได้แล้ว!", memeIcon: "🏆" }
                    ]
                }
            },
            {
                text: "B: ศาลอาญาสูงสุดไม่มีในประเทศไทยครับ มีแต่ศาลฎีกา",
                reaction: "เอ่อ... ทางเราเปลี่ยนชื่อหน่วยงานใหม่ครับ!",
                next: {
                    id: "callcenter-10-sub2", category: "callcenter", categoryTitle: "", level: 10, name: "มิจฉาชีพ (เริ่มสั่น)", avatar: "🥵",
                    msgs: ["ถ้าคุณยังเถียง ผมจะเพิ่มข้อหาหมิ่นประมาทศาลอีกคดี!"],
                    choices: [
                        { text: "A: ขอโทษครับๆ ยอมจ่ายค่าปรับให้จบเรื่อง", isCorrect: false, reaction: "ดีมากครับ โอนมา 5,000 พอ (โล่งอก)", memeTitle: "ALMOST THERE", memeDesc: "มาดีตลอด มาตกม้าตายตอนจบ!", memeIcon: "📉" },
                        { text: "B: ไปเรียนกฎหมายมาใหม่นะน้องนะ", isCorrect: true, reaction: "ฝากไว้ก่อนเถอะมึง! (ปาโทรศัพท์ทิ้ง)", memeTitle: "LEGAL WEAPON", memeDesc: "ความรู้คืออาวุธ มิจฉาชีพแพ้ราบคาบ!", memeIcon: "📜" }
                    ]
                }
            }
        ]
    },

    // ==========================================
    // หมวดที่ 2: หลอกลวงออนไลน์ (Scam & Romance) - 10 ด่าน
    // ==========================================
    
    // ด่าน 1: โค้ชหลอกลงทุน
    {
        id: "scam-1",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 1,
        name: "โค้ชอเล็กซ์ (คริปโตพารวย)",
        avatar: "📈",
        lossType: "money",
        msgs: [
            "สวัสดีครับ สนใจให้เงินทำงานไหม?",
            "โปรเจกต์ใหม่ AI Trade กำไร 30% ใน 10 นาที!",
            "เริ่มต้นแค่ 500 บาท ถอนได้จริง 100%"
        ],
        choices: [
            {
                text: "A: จริงเหรอคะ! สอนหนูหน่อย",
                reaction: "ง่ายมากครับ แค่สมัครเว็บนี้แล้วเติมเงิน",
                next: {
                    id: "scam-1-sub1", category: "scam", categoryTitle: "", level: 1, name: "โค้ชอเล็กซ์", avatar: "🤑",
                    msgs: ["นี่ครับ รีวิวจากลูกศิษย์คนอื่น (ส่งรูปสลิปปลอม)", "โอนเข้าบัญชีแอดมินตอนนี้ แถมโบนัสเทรดฟรี 500 บาท!"],
                    choices: [
                        { text: "A: จัดไป 5,000 เลยค่ะโค้ช!", isCorrect: false, reaction: "พอร์ตแตกแล้วครับ ต้องเติมเงินแก้พอร์ตด่วน!", memeTitle: "RUG PULL", memeDesc: "กำไรทิพย์! เงินจริงหายวับไปกับตา", memeIcon: "📉" },
                        { text: "B: ถ้ากำไรดีขนาดนี้ โค้ชกู้มาลงเองสิ", isCorrect: true, reaction: "คุณพลาดโอกาสรวยแล้ว! (บล็อก)", memeTitle: "EMOTIONAL DAMAGE", memeDesc: "เจ็บจี๊ด! ถามแทงใจดำมิจฉาชีพ", memeIcon: "🎤" }
                    ]
                }
            },
            {
                text: "B: ไม่ว่างครับ กำลังนับเงินที่มีอยู่",
                reaction: "ขี้โม้! คนรวยจริงเขาไม่พูดหรอก",
                next: {
                    id: "scam-1-sub2", category: "scam", categoryTitle: "", level: 1, name: "โค้ชอเล็กซ์ (เริ่มหัวร้อน)", avatar: "😤",
                    msgs: ["ถ้าแน่จริงก็ลองลงทุนสักหมื่นสิ จะได้รู้ว่าของจริง!"],
                    choices: [
                        { text: "A: เอ้า ท้าทายหรอ! โอนไปหมื่นนึงเลย", isCorrect: false, reaction: "ขอบคุณสำหรับเงินหมื่นนะไอ้หน้าโง่", memeTitle: "EGO TRAP", memeDesc: "แพ้ภัยตัวเองเพราะความอีโก้!", memeIcon: "🤡" },
                        { text: "B: เอาเลขบัญชีมึงไปให้ตำรวจเช็คดีกว่า", isCorrect: true, reaction: "กรรม! (ปิดเฟซบุ๊กหนี)", memeTitle: "RICH & SMART", memeDesc: "รวยด้วย ฉลาดด้วย โจรเกลียดสิ่งนี้!", memeIcon: "💰" }
                    ]
                }
            }
        ]
    },

    // ด่าน 2: Romance Scam (ทหารอเมริกัน)
    {
        id: "scam-2",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 2,
        name: "Capt. William (US Army)",
        avatar: "👱‍♂️",
        lossType: "money",
        msgs: [
            "Hello my beautiful queen. I am William from USA.",
            "I found 2 million dollars in Iraq war.",
            "I want to send this box to you, my future wife."
        ],
        choices: [
            {
                text: "A: Wow! Really? You trust me?",
                reaction: "Yes, but the package is stuck at Thai Customs.",
                next: {
                    id: "scam-2-sub1", category: "scam", categoryTitle: "", level: 2, name: "ศุลกากร (ปลอม)", avatar: "🛃",
                    msgs: ["(ทักไลน์มา) แจ้งจากศุลกากร มีพัสดุจากต่างประเทศติดภาษี", "กรุณาโอนค่าภาษี 35,000 บาท เพื่อรับกล่องดอลลาร์ครับ"],
                    choices: [
                        { text: "A: ที่รักรอแป๊บนะ กำลังโอนค่าภาษีให้!", isCorrect: false, reaction: "William: Good girl. (หายไปพร้อมเงินภาษี)", memeTitle: "LOVE BLINDNESS", memeDesc: "ความรักบังตา... ภาษีทิพย์ก็มา", memeIcon: "💔" },
                        { text: "B: แกะกล่องเอาดอลลาร์ในนั้นจ่ายค่าภาษีไปเลยสิ", isCorrect: true, reaction: "Customs: เอ่อ... ทำไม่ได้ครับ มันผิดกฎ (แถ)", memeTitle: "LOOPHOLE", memeDesc: "เจอคนจริง ศุลกากรทิพย์ถึงกับไปไม่เป็น", memeIcon: "🧠" }
                    ]
                }
            },
            {
                text: "B: I don't need your money, I have a sugar daddy.",
                reaction: "What?! But I love you!",
                next: {
                    id: "scam-2-sub2", category: "scam", categoryTitle: "", level: 2, name: "William (Broken Heart)", avatar: "😭",
                    msgs: ["Please, just pay 500 THB for my internet bill.", "So we can keep talking."],
                    choices: [
                        { text: "A: โธ่ น่าสงสาร โอนให้ 500 ละกัน", isCorrect: false, reaction: "Thank you fool! (บล็อก)", memeTitle: "PITY SCAM", memeDesc: "สงสารโจร สุดท้ายเราเดือดร้อนเอง", memeIcon: "💸" },
                        { text: "B: I only eat Pad Thai, no money for you.", isCorrect: true, reaction: "Damn! (Blocked)", memeTitle: "PAD THAI SUPREMACY", memeDesc: "ผัดไทยชนะทุกสิ่ง! โจรท้อแท้", memeIcon: "🍜" }
                    ]
                }
            }
        ]
    },

    // ด่าน 3: งานกดไลค์ TikTok
    {
        id: "scam-3",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 3,
        name: "แอดมินฟ้า (หารายได้เสริม)",
        avatar: "👍",
        lossType: "money",
        msgs: [
            "รับสมัครคนกดไลค์ TikTok จ่ายคลิปละ 50 บาท!",
            "ทำที่บ้านได้ วันละ 500-1000 บาท สบายๆ",
            "สนใจพิมพ์ 'สนใจ' เลยค่ะ"
        ],
        choices: [
            {
                text: "A: สนใจค่ะ! ว่างงานพอดี",
                reaction: "ยินดีด้วยค่ะ ขั้นแรกต้องโอนเงิน 'มัดจำรับงาน' 500 บาทนะคะ",
                next: {
                    id: "scam-3-sub1", category: "scam", categoryTitle: "", level: 3, name: "แอดมินฟ้า", avatar: "📝",
                    msgs: ["ทำภารกิจแรกเสร็จ ถอนทุนคืนพร้อมกำไร 600 บาทได้ทันทีค่ะ", "มีรีวิวคนได้เงินจริงเพียบเลยนะคะ โอนเลยไหม?"],
                    choices: [
                        { text: "A: โอนค่ะ! อยากได้เงิน", isCorrect: false, reaction: "ได้รับยอดแล้วค่ะ... ภารกิจต่อไปมัดจำ 3,000 นะคะ", memeTitle: "ENDLESS LOOP", memeDesc: "งานง่ายไม่มีจริง มีแต่หลอกให้เติมเงินเพิ่ม!", memeIcon: "🔄" },
                        { text: "B: หักมัดจำจากค่าจ้างสิคะ", isCorrect: true, reaction: "ไม่ได้ค่ะ ระบบไม่อนุญาต", memeTitle: "LOGIC STRIKES AGAIN", memeDesc: "รู้ทันสเต็ปโกง ไม่เสียตังฟรี!", memeIcon: "🧠" }
                    ]
                }
            },
            {
                text: "B: กดไลค์บ้าอะไรคลิปละ 50 หลอกเด็กเถอะ",
                reaction: "ไม่ได้หลอกนะคะ บริษัทเราจดทะเบียนถูกต้อง!",
                next: {
                    id: "scam-3-sub2", category: "scam", categoryTitle: "", level: 3, name: "แอดมินฟ้า (เริ่มวีน)", avatar: "💢",
                    msgs: ["ถ้าไม่เชื่อก็ลองเปิดใจดู ส่งเลขบัญชีมาเดี๋ยวโอนให้ฟรี 50 บาทก่อนเลย"],
                    choices: [
                        { text: "A: เอาดิ ส่งเลขบัญชีไปละ", isCorrect: false, reaction: "(โดนเอาเลขบัญชีไปแอบอ้างเป็นบัญชีม้า)", memeTitle: "MULE ACCOUNT", memeDesc: "ได้เงิน 50 บาท แต่ติดคุกฐานบัญชีม้า!", memeIcon: "🐴" },
                        { text: "B: ไม่เอาอะ ขี้เกียจกดไลค์", isCorrect: true, reaction: "คนขี้เกียจก็จนต่อไปเถอะ! (บล็อก)", memeTitle: "LAZY BUT SAFE", memeDesc: "ความขี้เกียจช่วยรักษาทรัพย์สินไว้ได้!", memeIcon: "🦥" }
                    ]
                }
            }
        ]
    },

    // ด่าน 4: ซื้อของออนไลน์ (iPhone ราคาถูก)
    {
        id: "scam-4",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 4,
        name: "Mobile Center (หลุดจำนำ)",
        avatar: "📱",
        lossType: "money",
        msgs: [
            "🔥 โปรไฟไหม้! iPhone 15 Pro Max หลุดจำนำ",
            "สภาพ 99% ราคาเพียง 8,900 บาทเท่านั้น!!",
            "สินค้ามีชิ้นเดียว โอนก่อนได้ก่อนครับ"
        ],
        choices: [
            {
                text: "A: เอาครับ! ขอเลขบัญชีเลย",
                reaction: "เลขบัญชี 123-4-5678 นายสมชาย โอนแล้วแจ้งสลิปนะครับ",
                next: {
                    id: "scam-4-sub1", category: "scam", categoryTitle: "", level: 4, name: "Mobile Center", avatar: "📦",
                    msgs: ["ยอดเข้าแล้วครับ... แต่มีค่าประกันสินค้าสูญหายระหว่างขนส่งอีก 3,000", "พอของถึงบ้านแล้วจะโอนคืนให้ครับ"],
                    choices: [
                        { text: "A: อ๋อ ได้ครับ โอนไปละ", isCorrect: false, reaction: "ขอบคุณครับ (เพจปลิวเรียบร้อย)", memeTitle: "GHOST SHOP", memeDesc: "ของถูกเกินจริง มักจะไม่มีจริง!", memeIcon: "👻" },
                        { text: "B: เก็บปลายทางได้ไหมครับ?", isCorrect: true, reaction: "โปรนี้ไม่รับปลายทางครับพี่ (บล็อกหนี)", memeTitle: "COD SAVIOR", memeDesc: "เก็บเงินปลายทางคือเกราะป้องกันโจร!", memeIcon: "📦" }
                    ]
                }
            },
            {
                text: "B: ขอวิดีโอคอลดูของพร้อมบัตรประชาชนหน่อย",
                reaction: "กล้องเสียครับพี่ ถ่ายรูปให้ดูแทนนะ",
                next: {
                    id: "scam-4-sub2", category: "scam", categoryTitle: "", level: 4, name: "Mobile Center (แถ)", avatar: "📸",
                    msgs: ["(ส่งรูปบัตร ปชช. ที่ตัดต่อเนียนๆ มาให้) รีบหน่อยนะพี่ มีคิว 2 รอโอนอยู่"],
                    choices: [
                        { text: "A: โห คิว 2 รออยู่ งั้นผมรีบโอนเลย", isCorrect: false, reaction: "(จัดส่งลมไปให้)", memeTitle: "RUSHED MISTAKE", memeDesc: "โจรชอบกดดันให้เรารีบโอน จะได้ไม่ทันคิด", memeIcon: "🏃‍♂️" },
                        { text: "B: เลขบัตรฟอนต์แปลกๆ นะ เอาไปเช็ค blacklistseller แป๊บ", isCorrect: true, reaction: "ไอ้หัวหมอ! (บล็อก)", memeTitle: "SMART BUYER", memeDesc: "เช็คประวัติคนโกงก่อนโอนเสมอ รอดชัวร์!", memeIcon: "🔍" }
                    ]
                }
            }
        ]
    },

    // ด่าน 5: แชทยืมเงิน (เพื่อนปลอม)
    {
        id: "scam-5",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 5,
        name: "สมพร (เพื่อนสมัยประถม)",
        avatar: "👦",
        lossType: "money",
        msgs: [
            "เห้ยมึง สบายดีป่าววะ ไม่ได้คุยกันนานเลย",
            "จำกูได้ป่าว สมพรไง ที่เคยเตะบอลด้วยกัน",
            "พอดียายกูเข้าโรงบาล กูช็อตหนักมาก ขอยืมสัก 3,000 ได้ไหม"
        ],
        choices: [
            {
                text: "A: เห้ย สมพรหรอ ได้ๆ ส่งเลขบัญชีมา",
                reaction: "แต๊งกิ้วมากมึง บัญชีชื่อ น.ส.สมศรี นะ (บัญชีแฟนกูเอง)",
                next: {
                    id: "scam-5-sub1", category: "scam", categoryTitle: "", level: 5, name: "สมพร (ตัวปลอม)", avatar: "👦",
                    msgs: ["โอนแล้วส่งสลิปมานะ เดี๋ยวเดือนหน้ากูรีบคืนให้พร้อมดอกเลย"],
                    choices: [
                        { text: "A: โอนละเพื่อน สู้ๆ นะเว้ย", isCorrect: false, reaction: "ขอบใจมากโง่จังเพื่อนรัก (บล็อก)", memeTitle: "BETRAYED", memeDesc: "เพื่อนก็ปลอม บัญชีก็ม้า!", memeIcon: "🔪" },
                        { text: "B: ทำไมชื่อบัญชีผู้หญิง? ขอวิดีโอคอลหน่อยดิ", isCorrect: true, reaction: "กูอยู่ไอซียู หมอไม่ให้ใช้เสียง (แถ)", memeTitle: "TRUST ISSUES", memeDesc: "เช็คให้ชัวร์ก่อนโอนให้เพื่อน (ที่ไม่ได้เจอนาน)", memeIcon: "🕵️" }
                    ]
                }
            },
            {
                text: "B: สมพรไหนวะ กูเรียนโรงเรียนหญิงล้วน",
                reaction: "เอ่อ... สงสัยกูจำผิดคน โทษทีๆ",
                next: {
                    id: "scam-5-sub2", category: "scam", categoryTitle: "", level: 5, name: "มิจฉาชีพ (โป๊ะแตก)", avatar: "🤡",
                    msgs: ["ไหนๆ ก็ทักมาละ สนใจกู้เงินรายวันไหมเจ๊?"],
                    choices: [
                        { text: "A: สนใจค่ะ ดอกเบี้ยเท่าไหร่?", isCorrect: false, reaction: "มาทรงนี้ เสร็จโจรอีกรอบ", memeTitle: "DOUBLE TRAP", memeDesc: "รอดมุกเพื่อนยืมเงิน มาตกม้าตายมุกเงินกู้", memeIcon: "🤦‍♀️" },
                        { text: "B: จะแคปหน้าจอส่งตำรวจละนะ ไปไกลๆ", isCorrect: true, reaction: "กลัวแล้วจ้าาา (หนี)", memeTitle: "SAVAGE", memeDesc: "ด่ากลับแบบสวยๆ โจรหนีหางจุกตูด", memeIcon: "💅" }
                    ]
                }
            }
        ]
    },

    // ด่าน 6: หลอกแจกของรางวัลทิพย์
    {
        id: "scam-6",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 6,
        name: "ฝ่ายการตลาด (Major Cineplex)",
        avatar: "🍿",
        lossType: "money",
        msgs: [
            "ยินดีด้วย! คุณคือผู้โชคดีได้รับ 'ทองคำหนัก 1 บาท'",
            "จากการสุ่มแจกรางวัลลูกค้าที่ซื้อตั๋วหนังในเดือนนี้",
            "กรุณายืนยันสิทธิ์เพื่อรับของรางวัลค่ะ"
        ],
        choices: [
            {
                text: "A: กรี๊ด! ยืนยันสิทธิ์ค่ะ ต้องทำไงบ้าง?",
                reaction: "ทางเราจะจัดส่งทองให้ฟรีค่ะ แต่มีค่าภาษีหัก ณ ที่จ่าย 5%",
                next: {
                    id: "scam-6-sub1", category: "scam", categoryTitle: "", level: 6, name: "ฝ่ายการตลาด", avatar: "🎫",
                    msgs: ["รบกวนโอนค่าภาษี 2,000 บาท เข้าบัญชีแอดมินนะคะ", "โอนปุ๊บ ส่งทองให้ปั๊บเลยค่ะ"],
                    choices: [
                        { text: "A: ทองตั้ง 4 หมื่น จ่ายภาษี 2 พัน คุ้มมาก! โอนค่ะ", isCorrect: false, reaction: "(โดนบล็อกเรียบร้อย)", memeTitle: "GOLD DIGGER DEFEATED", memeDesc: "ความโลภบังตา จ่ายภาษีแต่ไม่ได้ทอง!", memeIcon: "💰" },
                        { text: "B: หักภาษีจากทองไปเลยสิคะ ส่งมาแค่เศษทองก็ได้", isCorrect: true, reaction: "ไม่ได้ค่ะ บริษัทไม่มีนโยบายหักทองลูกค้า!", memeTitle: "SMART NEGOTIATOR", memeDesc: "ต่อรองเก่ง โจรเถียงไม่ออก", memeIcon: "🗣️" }
                    ]
                }
            },
            {
                text: "B: ไม่ได้รับคิ้วหนังมา 2 ปีแล้วนะ จะสุ่มโดนได้ไง?",
                reaction: "อ้าว... คุณคือเบอร์ 089-xxx-xxxx ใช่ไหมคะ?",
                next: {
                    id: "scam-6-sub2", category: "scam", categoryTitle: "", level: 6, name: "มิจฉาชีพ (ล่ก)", avatar: "💦",
                    msgs: ["อาจจะเป็นเบอร์เก่าคุณที่เคยใช้ค่ะ จะรับสิทธิ์ไหมคะ ถ้าไม่รับจะให้คนอื่น"],
                    choices: [
                        { text: "A: เอ้ยๆ รับสิทธิ์ๆ กดผิดๆ", isCorrect: false, reaction: "(เข้าสู่สเต็ปหลอกโอนค่าภาษีต่อ)", memeTitle: "WEAK MINDED", memeDesc: "รู้ทันแล้วเชียว แต่สุดท้ายก็แพ้ความโลภ", memeIcon: "😩" },
                        { text: "B: ให้คนอื่นไปเลยจ้า ตามสบาย", isCorrect: true, reaction: "ชิ! โง่จริงๆ ของฟรีไม่เอา (วางสาย)", memeTitle: "BULLET DODGED", memeDesc: "หลบกระสุนมิจฉาชีพได้แบบเท่ๆ", memeIcon: "😎" }
                    ]
                }
            }
        ]
    },

    // ด่าน 7: หลอกจองห้องพัก/พูลวิลล่าปลอม
    {
        id: "scam-7",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 7,
        name: "พูลวิลล่าพัทยา ราคาถูก (เพจ)",
        avatar: "🏖️",
        lossType: "money",
        msgs: [
            "สวัสดีค่ะ พูลวิลล่า 4 ห้องนอน ติดทะเล",
            "คืนวันเสาร์นี้หลุดจอง 1 หลังค่ะ ลดพิเศษเหลือ 3,900 บาท!",
            "ราคานี้รวมปิ้งย่าง คาราโอเกะ สนใจจองไหมคะ?"
        ],
        choices: [
            {
                text: "A: สนใจมากค่ะ! โอนจองเลย",
                reaction: "ยินดีค่ะ โอนเต็มจำนวนเพื่อล็อกบ้านนะคะ บัญชี นายโจร ใจร้าย",
                next: {
                    id: "scam-7-sub1", category: "scam", categoryTitle: "", level: 7, name: "เพจบ้านพักปลอม", avatar: "🏠",
                    msgs: ["อ้อ มีค่าประกันความเสียหายอีก 2,000 ด้วยนะคะ", "โอนรวม 5,900 บาท คืนให้ตอนเช็คเอาท์ค่ะ"],
                    choices: [
                        { text: "A: โอเคค่ะ โอนให้แล้ว ไปทะเลกัน!", isCorrect: false, reaction: "(ไปถึงพัทยา เจอแต่ที่ดินเปล่า)", memeTitle: "HOLIDAY RUINED", memeDesc: "จองพูลวิลล่าทิพย์ ได้ไปนั่งร้องไห้ริมหาด!", memeIcon: "😭" },
                        { text: "B: ทำไมบัญชีรับโอนเป็นชื่อบุคคล ไม่ใช่ชื่อบริษัท?", isCorrect: true, reaction: "แอดมินใช้บัญชีส่วนตัวรับชั่วคราวค่ะ บัญชีบริษัทมีปัญหา", memeTitle: "RED FLAG ALERT", memeDesc: "เช็คชื่อบัญชีก่อนโอน เซฟเงินได้ชัวร์!", memeIcon: "🚩" }
                    ]
                }
            },
            {
                text: "B: ขอคอลดูบ้านพักตอนสดๆ ตอนนี้ได้ไหมคะ?",
                reaction: "ตอนนี้แม่บ้านกำลังทำความสะอาด ไม่สะดวกคอลค่ะ",
                next: {
                    id: "scam-7-sub2", category: "scam", categoryTitle: "", level: 7, name: "แอดมินเพจ (หัวหมอ)", avatar: "😈",
                    msgs: ["ถ้าไม่รีบจอง มีลูกค้าอีกท่านรอโอนอยู่นะคะ จะหลุดคิวเอานะ"],
                    choices: [
                        { text: "A: งั้นโอนมัดจำไปก่อนครึ่งนึงละกัน", isCorrect: false, reaction: "(บล็อกหนีทันทีหลังจากได้มัดจำ)", memeTitle: "HALF SCAMMED", memeDesc: "มัดจำครึ่งเดียว โจรก็เอา!", memeIcon: "📉" },
                        { text: "B: งั้นให้คิวต่อไปเลยค่ะ เพจคนตามแค่หลักร้อย ไม่น่าไว้ใจ", isCorrect: true, reaction: "เรื่องมากนักนะอีป้า! (บล็อกเราแทน)", memeTitle: "SHARP INVESTIGATOR", memeDesc: "ดูยอดคนตามเพจก่อนจอง ช่วยรอดตายได้!", memeIcon: "🕵️‍♀️" }
                    ]
                }
            }
        ]
    },

    // ด่าน 8: หลอกขายตั๋วคอนเสิร์ต
    {
        id: "scam-8",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 8,
        name: "Nong Narak (ปล่อยบัตรคอน)",
        avatar: "🎤",
        lossType: "money",
        msgs: [
            "ปล่อยบัตรคอนเสิร์ต โซน VIP แถวหน้าสุด 1 ใบค่ะ",
            "เพื่อนเทไปไม่ได้ ขายราคาเท่าทุน 6,500 บาท",
            "นัดรับหน้างานได้เลยค่ะ สนใจเด็มมาน้า"
        ],
        choices: [
            {
                text: "A: ทักค่ะ! สนใจรับบัตร นัดรับหน้างานนะคะ",
                reaction: "ได้เลยค่ะเตง แต่นัดรับหน้างานขอโอนมัดจำก่อน 2,000 น้า",
                next: {
                    id: "scam-8-sub1", category: "scam", categoryTitle: "", level: 8, name: "Nong Narak", avatar: "👩",
                    msgs: ["พอดีมีคนทักมาเยอะมาก ถ้าไม่มัดจำเค้าปล่อยให้คนอื่นนะคะ", "(ส่งรูปบัตรคอนเสิร์ตที่มีลายน้ำทับบางๆ มาให้ดู)"],
                    choices: [
                        { text: "A: โอนมัดจำเรียบร้อย เจอกันหน้าคอนนะคะ", isCorrect: false, reaction: "(วันงานหายตัว ติดต่อไม่ได้ บล็อกหนี)", memeTitle: "CONCERT CANCELED", memeDesc: "นัดรับหน้างาน แต่มัดจำก่อน = เสี่ยง 99%!", memeIcon: "🎫" },
                        { text: "B: ไปเจอกันหน้างานแล้วจ่ายเต็มเลย ไม่โอนมัดจำค่ะ", isCorrect: true, reaction: "งั้นผ่านก่อนนะคะ ไม่รับจองปากเปล่า (หนีไปหาเหยื่ออื่น)", memeTitle: "HARD TO GET", memeDesc: "ไม่จ่ายก่อนเห็นของ โจรก็ทำอะไรไม่ได้", memeIcon: "🛡️" }
                    ]
                }
            },
            {
                text: "B: รหัสบัตรอะไรคะ ขอเอาไปเช็คในระบบก่อน",
                reaction: "บัตรกระดาษค่ะ เช็คไม่ได้ ต้องดูของจริง",
                next: {
                    id: "scam-8-sub2", category: "scam", categoryTitle: "", level: 8, name: "Nong Narak (แถ)", avatar: "🙄",
                    msgs: ["ถ้าเตงกลัวโกง งั้นวิดีโอคอลมาดูบัตรได้เลยค่ะ (ตั้งใจจะโชว์บัตรของคนอื่น)"],
                    choices: [
                        { text: "A: (วิดีโอคอลไปเห็นบัตรแว๊บๆ) โอเคเชื่อละ โอนมัดจำให้", isCorrect: false, reaction: "(โดนโกงอยู่ดี เพราะบัตรนั้นขโมยรูปมา)", memeTitle: "ILLUSION", memeDesc: "เห็นบัตรจริง แต่คนขายไม่ใช่เจ้าของบัตร!", memeIcon: "😵‍💫" },
                        { text: "B: วิดีโอคอลแล้วให้เอาบัตรแนบกับบัตร ปชช. ชู 3 นิ้วด้วยค่ะ", isCorrect: true, reaction: "โรคจิตปะเนี่ย! (บล็อกหนี)", memeTitle: "VERIFICATION MASTER", memeDesc: "สั่งให้ทำท่าแปลกๆ คู่บัตร โจรปลอมรูปไม่ได้แน่นอน!", memeIcon: "✌️" }
                    ]
                }
            }
        ]
    },

    // ด่าน 9: โรแมนติกสแกมขั้นแอดวานซ์ (Hybrid Scam)
    {
        id: "scam-9",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 9,
        name: "Oppa Ji-Hoon (Tinder Match)",
        avatar: "🧑🏻",
        lossType: "money",
        msgs: [
            "อันยองครับ ผมจีฮุนนะ เพิ่งย้ายมาทำงานที่ไทย",
            "คุณน่ารักจัง เราคุยกันมา 2 อาทิตย์แล้ว",
            "ผมรู้สึกดีกับคุณมากๆ เลยนะ"
        ],
        choices: [
            {
                text: "A: เขินจัง อปป้าก็น่ารักเหมือนกันค่ะ",
                reaction: "ผมมีเรื่องอยากให้คุณช่วยหน่อยครับ",
                next: {
                    id: "scam-9-sub1", category: "scam", categoryTitle: "", level: 9, name: "Oppa Ji-Hoon", avatar: "🥺",
                    msgs: ["ผมเล่นคริปโตได้กำไรมาเยอะมาก อยากสอนคุณเล่นจัง", "โหลดแอป 'CryptoWin' สิ เดี๋ยวผมพากดแป๊บเดียวได้เงินไปกินข้าวกัน"],
                    choices: [
                        { text: "A: ได้สิคะ โหลดแอปละ เติมเงินยังไงอะ?", isCorrect: false, reaction: "(โดนหลอกให้ลงทุนจนหมดตัว แล้วอปป้าก็หายไป)", memeTitle: "PIG BUTCHERING", memeDesc: "หลอกให้รัก แล้วเชือดเอาเงิน (Pig Butchering Scam)", memeIcon: "🐷" },
                        { text: "B: ไม่เล่นคริปโตค่ะ เล่นแต่สลากออมสิน", isCorrect: true, reaction: "โถ่... คุณไม่คิดจะสร้างอนาคตกับผมหรอ? (พยายามดราม่า)", memeTitle: "SAVINGS QUEEN", memeDesc: "ความรักไม่ช่วยให้รวย เล่นสลากออมสินปลอดภัยกว่า!", memeIcon: "🏦" }
                    ]
                }
            },
            {
                text: "B: คุยตั้งนานไม่ยอมนัดเจอ ตัวปลอมปะเนี่ย",
                reaction: "ผมยุ่งกับธุรกิจจริงๆ ครับ ไม่เชื่อใจผมหรอ?",
                next: {
                    id: "scam-9-sub2", category: "scam", categoryTitle: "", level: 9, name: "Oppa Ji-Hoon (ดราม่า)", avatar: "😢",
                    msgs: ["ผมอุตส่าห์อยากพาคุณรวยไปด้วยกัน ส่งลิงก์เทรด VIP ให้เลยนะเนี่ย"],
                    choices: [
                        { text: "A: อะๆ ลองดูก็ได้ สัก 1,000 นึง", isCorrect: false, reaction: "(เงินหายวับไปกับตา)", memeTitle: "MIND CONTROLLED", memeDesc: "ใจแข็งมาตลอด มาแพ้ลูกอ้อนซะงั้น", memeIcon: "🫠" },
                        { text: "B: รวยคนเดียวไปเถอะพ่อหนุ่ม ปัดทิ้งละนะ", isCorrect: true, reaction: "เดี๋ยวสิครับคุณ! (เรากดอันแมตช์)", memeTitle: "SWIPE LEFT", memeDesc: "ปัดซ้ายให้คนแปลกหน้าที่ชวนลงทุน!", memeIcon: "👈" }
                    ]
                }
            }
        ]
    },

    // ด่าน 10: หลอกบริจาคทำบุญ
    {
        id: "scam-10",
        category: "scam",
        categoryTitle: "💸 หลอกลงทุน & ความรักบังตา",
        level: 10,
        name: "มูลนิธิหมาแมวสัญจร (เพจ)",
        avatar: "🐶",
        lossType: "money",
        msgs: [
            "ด่วน! น้องหมาถูกรถชนต้องการเลือดและค่าผ่าตัด 20,000 บาท",
            "ตอนนี้น้องอาการสาหัสมาก ขาดอีกแค่ 3,000 บาทเท่านั้น",
            "ช่วยสมทบทุนต่อลมหายใจให้น้องด้วยนะคะ 😭"
        ],
        choices: [
            {
                text: "A: สงสารน้องจัง โอนช่วย 500 บาทค่ะ",
                reaction: "ขอบคุณแทนน้องด้วยนะคะ โอนเข้าบัญชี 'น.ส. แอบอ้าง หากิน' ได้เลยค่ะ",
                next: {
                    id: "scam-10-sub1", category: "scam", categoryTitle: "", level: 10, name: "มูลนิธิหมาแมว", avatar: "🐱",
                    msgs: ["(ส่งรูปหมาใส่สายน้ำเกลือที่ก๊อปมาจากเน็ต) รบกวนส่งสลิปด้วยนะคะ"],
                    choices: [
                        { text: "A: โอนเรียบร้อยค่ะ ขอให้น้องปลอดภัยนะ", isCorrect: false, reaction: "(เงินเข้ากระเป๋ามิจฉาชีพ ไม่ได้ไปช่วยหมา)", memeTitle: "FAKE CHARITY", memeDesc: "ทำบุญบูชาโทษ โอนเงินให้โจรใจบาป!", memeIcon: "💸" },
                        { text: "B: ทำไมชื่อบัญชีเป็นบุคคลธรรมดา ไม่ใช่ชื่อมูลนิธิ?", isCorrect: true, reaction: "แอดมินเป็นคนจัดการค่าใช้จ่ายให้น้องโดยตรงค่ะ!", memeTitle: "SUSPICIOUS SAINT", memeDesc: "ทำบุญต้องมีสติ เช็คชื่อบัญชีก่อนเสมอ", memeIcon: "🧐" }
                    ]
                }
            },
            {
                text: "B: น้องรักษาอยู่คลินิกไหนคะ เดี๋ยวโทรไปเช็ค",
                reaction: "คลินิกรักษาสัตว์รักดี ค่ะ แถวๆ ชลบุรี",
                next: {
                    id: "scam-10-sub2", category: "scam", categoryTitle: "", level: 10, name: "แอดมินเพจ (เหงื่อตก)", avatar: "💧",
                    msgs: ["แต่คลินิกปิดรับสายแล้วนะคะ โอนผ่านทางเพจสะดวกกว่าค่ะ รบกวนช่วยน้องด่วนๆ"],
                    choices: [
                        { text: "A: กลัวน้องตาย โอนผ่านเพจไปก่อนละกัน", isCorrect: false, reaction: "(เสร็จโจรตามระเบียบ)", memeTitle: "EMOTIONAL HIJACK", memeDesc: "ใช้ความสงสารมากดดัน คือไม้ตายของโจร", memeIcon: "😿" },
                        { text: "B: งั้นพรุ่งนี้เช้าคลินิกเปิด เดี๋ยวผมโอนตรงเข้าคลินิกเอง", isCorrect: true, reaction: "คนใจดำ! ปล่อยน้องตาย! (ด่าแล้วบล็อก)", memeTitle: "RATIONAL SAVIOR", memeDesc: "ช่วยด้วยสติ ไม่โดนโจรหลอกใช้ความใจดี!", memeIcon: "🦸‍♂️" }
                    ]
                }
            }
        ]
    },


    // ==========================================
    // หมวดที่ 3: ฟิชชิ่ง & ลิงก์ดูดเงิน (Phishing & Malware) - 10 ด่าน
    // ==========================================

    // ด่าน 1: แอปสินเชื่อเถื่อน (เหมือนเดิม)
    {
        id: "phishing-1",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 1,
        name: "สินเชื่อฉับไว (อนุมัติง่าย)",
        avatar: "🏦",
        lossType: "data",
        msgs: [
            "ร้อนเงินมั้ย? กู้ได้ทันที 50,000 บาท!",
            "ไม่เช็คบูโร แค่กดลิงก์โหลดแอปนี้: bit.ly/fast-money-apk"
        ],
        choices: [
            { text: "A: กำลังช็อตพอดี! โหลดเลย", isCorrect: false, reaction: "(ดูดข้อมูลเกลี้ยง + โทรทวงประจาน)", memeTitle: "DATA LEAK!", memeDesc: "กู้หลักพัน ดอกหลักแสน แถมโดนประจาน!", memeIcon: "📱" },
            { text: "B: ดอกเบี้ยโหดมั้ย? ไม่โหลดมั่วซั่วหรอก", isCorrect: true, reaction: "เรื่องมากจังวะ (ไม่คุยด้วย)", memeTitle: "LAWYER STYLE", memeDesc: "ไม่โหลดแอปเถื่อน ปลอดภัยที่สุด", memeIcon: "⚖️" }
        ]
    },

    // ด่าน 2: แจ้งเตือนแอปธนาคาร
    {
        id: "phishing-2",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 2,
        name: "K-Bank (ระบบอัตโนมัติ SMS)",
        avatar: "🏦",
        lossType: "data",
        msgs: [
            "แอปพลิเคชัน K-PLUS ของท่านหมดอายุการใช้งาน",
            "เพื่อป้องกันบัญชีถูกล็อก กรุณาอัปเดตระบบทันที",
            "คลิก: www.kbank-update-security.com"
        ],
        choices: [
            {
                text: "A: ตกใจ! รีบกดลิงก์เข้าไปอัปเดต",
                reaction: "(เปิดเว็บหน้าตาเหมือนของธนาคารเป๊ะ)",
                next: {
                    id: "phishing-2-sub1", category: "phishing", categoryTitle: "", level: 2, name: "หน้าเว็บปลอม", avatar: "🌐",
                    msgs: ["กรุณากรอก Username, Password และเลขบัตร ปชช. เพื่อเข้าสู่ระบบ"],
                    choices: [
                        { text: "A: กรอกข้อมูลให้ครบ จะได้รีบอัปเดต", isCorrect: false, reaction: "(เงินถูกโอนออกหมดบัญชีภายใน 1 นาที)", memeTitle: "PHISHED", memeDesc: "กรอกรหัสผ่านในเว็บปลอม = มอบกุญแจเซฟให้โจร!", memeIcon: "🎣" },
                        { text: "B: เอ๊ะ ทำไม URL ไม่ใช่เว็บธนาคารหลัก ปิดทิ้งดีกว่า", isCorrect: true, reaction: "(รอดพ้นจากการถูกแฮก)", memeTitle: "URL INSPECTOR", memeDesc: "เช็ค URL ทุกครั้งก่อนพิมพ์รหัสผ่าน!", memeIcon: "🕵️" }
                    ]
                }
            },
            { text: "B: โหลดแอปอัปเดตผ่าน App Store / Play Store เองดีกว่า", isCorrect: true, reaction: "...", memeTitle: "SAFE ZONE", memeDesc: "อัปเดตแอปผ่าน Store ทางการ ปลอดภัย 100%", memeIcon: "✅" }
        ]
    },

    // ด่าน 3: แจกสติกเกอร์ไลน์ฟรี
    {
        id: "phishing-3",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 3,
        name: "LINE Official (ปลอม)",
        avatar: "💬",
        lossType: "data",
        msgs: [
            "ฉลองครบรอบ 10 ปี LINE ประเทศไทย 🎉",
            "แจกสติกเกอร์โดราเอมอนดุ๊กดิ๊ก ฟรี!",
            "แอดไลน์และกดลิงก์นี้เพื่อรับเลย: bit.ly/free-line-sticker"
        ],
        choices: [
            {
                text: "A: โห อยากได้! กดเข้าไปรับเลย",
                reaction: "กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน LINE เพื่อรับสติกเกอร์",
                next: {
                    id: "phishing-3-sub1", category: "phishing", categoryTitle: "", level: 3, name: "หน้าเว็บล็อกอินปลอม", avatar: "🔑",
                    msgs: ["และต้องส่งลิงก์นี้ต่อให้เพื่อนอีก 10 คนเพื่อปลดล็อก"],
                    choices: [
                        { text: "A: กรอกรหัสและส่งต่อให้เพื่อนรัวๆ", isCorrect: false, reaction: "(โดนแฮกไลน์เอาไปยืมเงินเพื่อนต่อ)", memeTitle: "CHAIN REACTION", memeDesc: "เสียไลน์ไม่พอ พาเพื่อนซวยไปด้วย!", memeIcon: "💥" },
                        { text: "B: ทำไมแจกฟรีต้องให้ล็อกอินด้วย โหลดในแอปไลน์ปกติก็จบปะ", isCorrect: true, reaction: "(ไม่ได้สติกเกอร์ แต่ได้ความปลอดภัย)", memeTitle: "NO FREE LUNCH", memeDesc: "สติกเกอร์ฟรีที่ต้องแลกด้วยรหัสผ่าน คือสติกเกอร์โจร!", memeIcon: "🙅‍♂️" }
                    ]
                }
            },
            { text: "B: ไม่เอาอะ ซื้อเอง 50 คอยน์สบายใจกว่า", isCorrect: true, reaction: "(ปลอดภัย 100%)", memeTitle: "PAY TO WIN", memeDesc: "ยอมเสียเงินซื้อเอง ดีกว่าเสียบัญชีไลน์ให้แฮกเกอร์", memeIcon: "💸" }
        ]
    },

    // ด่าน 4: แจ้งเตือนไวรัสเข้าเครื่อง
    {
        id: "phishing-4",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 4,
        name: "System Security Popup",
        avatar: "⚠️",
        lossType: "data",
        msgs: [
            "⚠️ โทรศัพท์ของคุณติดไวรัสทรอจัน 5 ตัว!",
            "รูปภาพและแอปธนาคารกำลังถูกขโมยข้อมูล",
            "กดปุ่ม 'ล้างไวรัสเดี๋ยวนี้' เพื่อติดตั้งแอป Anti-Virus"
        ],
        choices: [
            {
                text: "A: ตกใจ! รีบกดติดตั้งแอปสแกนไวรัสด่วน",
                reaction: "กำลังดาวน์โหลดไฟล์ cleaner.apk...",
                next: {
                    id: "phishing-4-sub1", category: "phishing", categoryTitle: "", level: 4, name: "แอปเถื่อน", avatar: "👾",
                    msgs: ["เพื่อการสแกนที่ล้ำลึก กรุณากดอนุญาตการเข้าถึง 'การช่วยเหลือพิเศษ (Accessibility)'"],
                    choices: [
                        { text: "A: อนุญาตให้หมดเลย รีบล้างไวรัสที", isCorrect: false, reaction: "(โดนรีโมทควบคุมหน้าจอ โอนเงินเกลี้ยง)", memeTitle: "REMOTE CONTROLLED", memeDesc: "แอปสแกนไวรัสนี่แหละ ตัวไวรัสของจริง!", memeIcon: "🤖" },
                        { text: "B: เอ๊ะ ไปโหลดแอปใน Play Store ชัวร์กว่า", isCorrect: true, reaction: "(ลบไฟล์ .apk ทิ้ง ปลอดภัย)", memeTitle: "NICE SAVE", memeDesc: "ไม่ติดตั้งไฟล์จากนอก Store ปลอดภัยสุด", memeIcon: "🛡️" }
                    ]
                }
            },
            { text: "B: ป๊อปอัปหลอกเด็ก ปิดแท็บเว็บนี้ทิ้งดีกว่า", isCorrect: true, reaction: "(หน้าต่างแจ้งเตือนหายไป)", memeTitle: "IGNORE MASTER", memeDesc: "เว็บแจ้งเตือนไวรัส = มุกหากินคลาสสิก ปิดทิ้งได้เลย", memeIcon: "❌" }
        ]
    },

    // ด่าน 5: กรมการค้าภายใน (แอปโครงการรัฐ)
    {
        id: "phishing-5",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 5,
        name: "กรมการค้าภายใน (DIT)",
        avatar: "🏛️",
        lossType: "data",
        msgs: [
            "คุณได้รับสิทธิ์ร้านค้าธงฟ้าประชารัฐ",
            "รับเงินอุดหนุน 2,000 บาท/เดือน",
            "แอดไลน์เจ้าหน้าที่เพื่อรับสิทธิ์: @dit-support"
        ],
        choices: [
            {
                text: "A: แอดไลน์ไปเลยจ้า อยากได้เงินอุดหนุน",
                reaction: "เจ้าหน้าที่: สวัสดีครับ โหลดแอป 'ทางรัฐ (เวอร์ชั่นอัปเดต)' จากลิงก์นี้ครับ",
                next: {
                    id: "phishing-5-sub1", category: "phishing", categoryTitle: "", level: 5, name: "เจ้าหน้าที่ปลอม", avatar: "👨‍💻",
                    msgs: ["(ส่งลิงก์โหลดไฟล์ .apk มาให้) ติดตั้งแล้วสแกนใบหน้าเพื่อยืนยันตัวตนนะครับ"],
                    choices: [
                        { text: "A: ทำตามขั้นตอน สแกนหน้าเรียบร้อย", isCorrect: false, reaction: "(โดนดูดเงินหมดบัญชีตอนเผลอ)", memeTitle: "BIOMETRIC HACK", memeDesc: "แอปเถื่อน + สแกนหน้า = เตรียมบอกลาเงินในบัญชี", memeIcon: "💸" },
                        { text: "B: ทำไมไม่ให้โหลดใน App Store ล่ะ?", isCorrect: true, reaction: "แอปยังไม่ขึ้น Store ครับ รบกวนโหลดผ่านลิงก์ก่อน", memeTitle: "SUSPICIOUS", memeDesc: "แอปราชการต้องอยู่ใน Store เท่านั้น!", memeIcon: "🤔" }
                    ]
                }
            },
            { text: "B: ไม่ได้ลงทะเบียนร้านค้าไว้ จะได้สิทธิ์ได้ไง?", isCorrect: true, reaction: "(ไม่สนใจข้อความ มิจฉาชีพทำอะไรไม่ได้)", memeTitle: "LOGIC WON", memeDesc: "ไม่เคยลงทะเบียน แต่อยู่ๆ ได้สิทธิ์ = หลอกลวงชัวร์", memeIcon: "🧠" }
        ]
    },

    // ด่าน 6: การบินไทย (ชวนทำแบบสอบถาม)
    {
        id: "phishing-6",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 6,
        name: "Thai Airways (โปรโมชั่น)",
        avatar: "✈️",
        lossType: "data",
        msgs: [
            "ร่วมตอบแบบสอบถามประเมินการบริการของการบินไทย",
            "รับฟรี! บัตรกำนัลสตาร์บัคส์ 500 บาท",
            "คลิกตอบเลย: www.thaiair-survey-reward.com"
        ],
        choices: [
            {
                text: "A: ตอบคำถามแป๊บเดียว ได้กาแฟฟรี เอาสิ",
                reaction: "ขอบคุณที่ตอบแบบสอบถาม กรุณากรอกที่อยู่และ 'เบอร์บัตรเครดิต' เพื่อจ่ายค่าส่งบัตรกำนัล 20 บาท",
                next: {
                    id: "phishing-6-sub1", category: "phishing", categoryTitle: "", level: 6, name: "หน้าเว็บจ่ายเงินปลอม", avatar: "💳",
                    msgs: ["ยอดชำระ 20.00 THB", "รอรับรหัส OTP ทาง SMS เพื่อยืนยันการชำระเงิน"],
                    choices: [
                        { text: "A: ยอมจ่าย 20 บาท กรอก OTP รัวๆ", isCorrect: false, reaction: "(SMS เข้าว่าโดนรูดไป 20,000 ไม่ใช่ 20 บาท!)", memeTitle: "EXPENSIVE COFFEE", memeDesc: "จ่ายค่าส่ง 20 บาท แต่โดนรูดบัตรไปสองหมื่น!", memeIcon: "☕" },
                        { text: "B: แจกฟรีทำไมต้องเก็บค่าส่งด้วยบัตรเครดิต? ปิดเว็บดีกว่า", isCorrect: true, reaction: "(รอดตัวไป)", memeTitle: "SMART MOVE", memeDesc: "เอะใจเรื่องค่าส่ง ช่วยเซฟเงินก้อนโตได้", memeIcon: "🛡️" }
                    ]
                }
            },
            { text: "B: เอาเว็บแปลกๆ มาหลอกอีกละ บล็อกจ้า", isCorrect: true, reaction: "(รอดตัวไปชิลๆ)", memeTitle: "TOO SMART FOR THIS", memeDesc: "แค่เห็นชื่อเว็บแปลกๆ ก็รู้ทันแล้ว", memeIcon: "😎" }
        ]
    },

    // ด่าน 7: สายการบิน (เลื่อนไฟลท์)
    {
        id: "phishing-7",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 7,
        name: "AirAsia Alert",
        avatar: "🛫",
        lossType: "data",
        msgs: [
            "เที่ยวบิน FD3025 ของคุณถูกยกเลิก!",
            "กรุณากดลิงก์เพื่อทำเรื่องขอคืนเงิน (Refund)",
            "หรือเปลี่ยนเที่ยวบินด่วนภายใน 2 ชม."
        ],
        choices: [
            {
                text: "A: อ้าว พรุ่งนี้จะบินแล้ว! รีบกดเข้าไปดู",
                reaction: "กรุณาล็อกอินผ่าน Facebook หรืออีเมลเพื่อยืนยันตัวตน",
                next: {
                    id: "phishing-7-sub1", category: "phishing", categoryTitle: "", level: 7, name: "หน้าล็อกอินปลอม", avatar: "🔑",
                    msgs: ["(เว็บหน้าตาเหมือนจริงมาก แต่ URL แปลกๆ)"],
                    choices: [
                        { text: "A: รีบกรอกรหัสผ่าน เดี๋ยวเปลี่ยนไฟลท์ไม่ทัน", isCorrect: false, reaction: "(โดนแฮกเฟซบุ๊กเอาไปหลอกยืมเงินเพื่อน)", memeTitle: "PANIC LOGIN", memeDesc: "ตกใจกลัวตกเครื่อง จนลืมดูว่าเว็บปลอม!", memeIcon: "😱" },
                        { text: "B: โทรเข้า Call Center สายการบินตรงๆ ดีกว่า", isCorrect: true, reaction: "Call Center: เที่ยวบินยังบินปกตินะคะ", memeTitle: "DOUBLE CHECK", memeDesc: "เช็คข้อมูลจากช่องทางหลัก ปลอดภัยที่สุด", memeIcon: "☎️" }
                    ]
                }
            },
            { text: "B: เดือนนี้ฉันไม่ได้จองตั๋วไปไหนเลยนะ มั่วละ", isCorrect: true, reaction: "(ไม่สนใจ ปล่อยผ่าน)", memeTitle: "STAY HOME SAFE", memeDesc: "คนไม่ได้บิน จะโดนเลื่อนไฟลท์ได้ไงเล่า!", memeIcon: "🛋️" }
        ]
    },

    // ด่าน 8: ใบสั่งจราจรปลอม
    {
        id: "phishing-8",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 8,
        name: "ตำรวจจราจร (SMS)",
        avatar: "🚦",
        lossType: "money",
        msgs: [
            "คุณมีใบสั่งค้างชำระ (ขับรถเร็วเกินกำหนด)",
            "โปรดชำระค่าปรับ 500 บาท ภายในวันนี้เพื่อหลีกเลี่ยงการอายัดทะเบียน",
            "ชำระผ่านเว็บ: e-ticket-police-online.com"
        ],
        choices: [
            {
                text: "A: ซวยละ! เมื่อวานเพิ่งเหยียบ 120 กดลิงก์ไปจ่ายดีกว่า",
                reaction: "กรุณากรอกข้อมูลบัตรเครดิตเพื่อชำระค่าปรับ",
                next: {
                    id: "phishing-8-sub1", category: "phishing", categoryTitle: "", level: 8, name: "เว็บจ่ายค่าปรับ(ปลอม)", avatar: "💳",
                    msgs: ["ระบบรองรับเฉพาะบัตรเครดิตและเดบิตเท่านั้น"],
                    choices: [
                        { text: "A: กรอกข้อมูลบัตรและรหัสหลังบัตร", isCorrect: false, reaction: "(โดนเอาข้อมูลบัตรไปรูดซื้อเกมออนไลน์ 3 หมื่น)", memeTitle: "SPEEDING TICKET TO HELL", memeDesc: "ค่าปรับ 500 แต่โดนโจรปรับไป 3 หมื่น!", memeIcon: "🏎️" },
                        { text: "B: ปกติใบสั่งสแกนจ่ายคิวอาร์โค้ดผ่านแอปแบงก์ได้นิ เว็บนี้แปลกๆ", isCorrect: true, reaction: "(ปิดเว็บทิ้ง รอดตัวไป)", memeTitle: "RULE KNOW-HOW", memeDesc: "รู้ระบบจ่ายค่าปรับจริง โจรก็หลอกไม่ได้", memeIcon: "👮" }
                    ]
                }
            },
            { text: "B: ผมไม่มีรถยนต์ครับ นั่งแต่รถเมล์", isCorrect: true, reaction: "(รอดจากการหลอกลวง)", memeTitle: "BUS RIDER", memeDesc: "คนไม่มีรถ โดนใบสั่งความเร็วได้ไง!", memeIcon: "🚌" }
        ]
    },

    // ด่าน 9: ข้อมูลบัตรเครดิตหลุด (ย้อนศร)
    {
        id: "phishing-9",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 9,
        name: "ฝ่ายความปลอดภัย Cyber Security",
        avatar: "🛡️",
        lossType: "data",
        msgs: [
            "แจ้งเตือนด่วน! ข้อมูลของคุณหลุดไหลใน Dark Web",
            "กรุณาโหลดแอป 'SafeGuard Pro' ทันทีเพื่อล็อกบัญชีธนาคารทั้งหมด",
            "หากเพิกเฉย เงินคุณอาจหายได้ในคืนนี้"
        ],
        choices: [
            {
                text: "A: น่ากลัวมาก! รีบกดโหลดแอปเลย",
                reaction: "แอป SafeGuard Pro ขอสิทธิ์เข้าถึงข้อความ SMS ของคุณ",
                next: {
                    id: "phishing-9-sub1", category: "phishing", categoryTitle: "", level: 9, name: "SafeGuard (แอปเถื่อน)", avatar: "📱",
                    msgs: ["เพื่อใช้ในการดักจับรหัส OTP ที่แฮกเกอร์อาจขอเข้ามา"],
                    choices: [
                        { text: "A: ฟังดูมีเหตุผล กด 'อนุญาต' สิทธิ์ SMS", isCorrect: false, reaction: "(มิจฉาชีพเอาสิทธิ์ไปอ่านรหัส OTP และโอนเงินออกหมดบัญชี)", memeTitle: "IRONIC SECURITY", memeDesc: "โหลดแอปมากันแฮกเกอร์ แต่แอปนั่นแหละคือแฮกเกอร์!", memeIcon: "🤦" },
                        { text: "B: แอปกันแฮกอะไรขออ่าน SMS ส่วนตัว ไม่ให้หรอก ลบทิ้ง!", isCorrect: true, reaction: "(ลบแอปทิ้ง ปลอดภัย)", memeTitle: "PRIVACY FIRST", memeDesc: "ไม่ให้สิทธิ์เข้าถึงข้อมูลส่วนตัว ปลอดภัยชัวร์", memeIcon: "🔒" }
                    ]
                }
            },
            { text: "B: หลอกให้โหลดแอปดูดเงินอีกละสิ ไม่เนียนไปเรียนมาใหม่", isCorrect: true, reaction: "(เมินข้อความ)", memeTitle: "TOO EXPERIENCED", memeDesc: "มุกเก่าแล้วจ้า หลอกคนมีสติไม่ได้หรอก", memeIcon: "🥱" }
        ]
    },

    // ด่าน 10: การ์ดเชิญงานแต่ง (Boss Fight - Malware)
    {
        id: "phishing-10",
        category: "phishing",
        categoryTitle: "🔗 ฟิชชิ่ง & ลิงก์ดูดเงิน",
        level: 10,
        name: "เบอร์แปลก (ส่ง SMS)",
        avatar: "💌",
        lossType: "data",
        msgs: [
            "ขอเชิญร่วมงานแต่งงานของเรา (สมชาย & ฟ้า)",
            "วันเสาร์นี้ที่โรงแรม แกรนด์ พลาซ่า",
            "เปิดดูการ์ดเชิญและแผนที่ได้ที่นี่: wedding-invite.apk"
        ],
        choices: [
            {
                text: "A: สมชายไหนวะ? ลองกดเปิดดูหน่อยละกัน",
                reaction: "ไฟล์ถูกดาวน์โหลดแล้ว... คุณต้องการติดตั้ง 'Wedding_Invite.apk' หรือไม่?",
                next: {
                    id: "phishing-10-sub1", category: "phishing", categoryTitle: "", level: 10, name: "System Installer", avatar: "⚙️",
                    msgs: [
                        "เพื่อติดตั้งแอปพลิเคชันนี้",
                        "กรุณาไปที่การตั้งค่า และเปิด 'อนุญาตให้ติดตั้งแอปจากแหล่งที่ไม่รู้จัก'"
                    ],
                    choices: [
                        { text: "A: อยากรู้ว่าใครแต่งงาน กดเปิดสิทธิ์และติดตั้งเลย!", isCorrect: false, reaction: "(หน้าจอมือถือค้าง... เงินในบัญชีถูกโอนออกไป 500,000 บาท)", memeTitle: "THE WEDDING CRASHER", memeDesc: "งานแต่งทิพย์ ดูดเงินจริง! บอสฟิชชิ่งเอาชนะคุณได้", memeIcon: "💀" },
                        { text: "B: เห้ย นามสกุล .apk มันคือแอปติดตั้ง นี่ไม่ใช่รูปภาพการ์ดเชิญ ลบทิ้งด่วน!", isCorrect: true, reaction: "(ลบไฟล์ทิ้ง มือถือปลอดภัย 100%)", memeTitle: "MALWARE SLAYER", memeDesc: "สติและไหวพริบยอดเยี่ยม! คุณเคลียร์ด่านฟิชชิ่งทั้งหมดได้แล้ว!", memeIcon: "🏆" }
                    ]
                }
            },
            {
                text: "B: ถ้าเป็นเพื่อนเราจริง ต้องทักไลน์มาสิ ไม่ใช่ส่ง SMS เบอร์แปลก",
                reaction: "...",
                next: {
                    id: "phishing-10-sub2", category: "phishing", categoryTitle: "", level: 10, name: "ความคิดในหัวคุณ", avatar: "🧠",
                    msgs: ["มิจฉาชีพสมัยนี้เปลี่ยนจากการส่งลิงก์เว็บ มาเป็นการส่งไฟล์แอปเถื่อน (.apk) แล้ว"],
                    choices: [
                        { text: "A: ลองโหลดมาแงะโค้ดดูหน่อยดีกว่าว่ามันทำงานยังไง", isCorrect: false, reaction: "(เผลอกดรันไฟล์ มัลแวร์ทำงาน ดูดข้อมูลเกลี้ยง)", memeTitle: "CURIOSITY KILLED THE CAT", memeDesc: "ความอยากรู้อยากเห็น ฆ่าแมว (และเงินในบัญชี) ได้เสมอ!", memeIcon: "🐈" },
                        { text: "B: บล็อกเบอร์นี้ทิ้ง ลบข้อความไปเลย ปลอดภัยสุด", isCorrect: true, reaction: "(รอดพ้นภัยไซเบอร์อย่างสวยงาม)", memeTitle: "ULTIMATE SHIELD", memeDesc: "ไม่ยุ่งกับไฟล์แปลกปลอม คือการป้องกันขั้นสูงสุด!", memeIcon: "🛡️" }
                    ]
                }
            }
        ]
    }
]; // <--- ปิด Array ของ chatData ตรงนี้