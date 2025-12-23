
import { BetOption } from '../types';

// Lowercase, no-accent names for realistic usernames
const FIRST_NAMES = [
  "an", "binh", "cuong", "dung", "giang", "hai", "hung", "huy", "khanh", "khoa", 
  "lam", "linh", "long", "minh", "nam", "nghia", "phong", "phuc", "quan", "quang", 
  "son", "thang", "thanh", "thien", "thinh", "toan", "tri", "trung", "tuan", "tung", 
  "viet", "vinh", "vu", "chau", "duong", "dat", "hieu", "hoang", "kien", "loc", 
  "tam", "tin", "trong", "truong", "tu", "bao", "cong", "duc", "hau", "khai",
  "beo", "coi", "lun", "map", "tit", "mit", "tun", "ken", "bi", "bo", "zin"
];

const LAST_NAMES = [
  "nguyen", "tran", "le", "pham", "hoang", "huynh", "phan", "vu", "vo", "dang", 
  "bui", "do", "ho", "ngo", "duong", "ly", "dao", "doan", "vuong", "trinh"
];

// Slang, abbreviations, complaints, cheering - typical casino chat
export const USER_CHATS = [
  "tai di", "tai", "xiu", "xiu chu", "chet roi", "xa bo qua", "cuu net", 
  "all in tai", "all in", "tat tay", "bip vkl", "bip roi", "nha cai bip", 
  "lag qua", "mang lag", "cho xin loc", "loc la", "xin code", "code dau", 
  "thua thong 3 tay", "den vcl", "do nhu cho", "chan doi", "con cai nit", 
  "ve bo", "ve bo an toan", "mai go", "cho vay tien", "vay 50k", "nap tien o dau",
  "rut tien lau the", "uy tin", "game rac", "ao ma canada", "cau nay tai", 
  "cau nay xiu", "be cau", "be roi", "gay cau", "nuoi tai", "nuoi xiu",
  "1 1 dep", "cau 2 2", "bao roi", "bao tai", "bao xiu", "no hu", 
  "len thuyen", "xuong xac", "kho tho qua", "tim dap chan run", "run tay", 
  "dung so", "so gi", "liem", "lum lua", "an du", "ngon", "thom", 
  "chet me", "xoa app", "xoa game", "bo game", "nghien", "khat nuoc",
  "choi not van nay", "van cuoi", "hoi hop vkl", "tai 11", "xiu 10", 
  "xiu 7", "tai 17", "ao that", "khong the tin duoc", "thanh nien hoi",
  "ga", "non", "pro", "dai gia", "xin 20k", "card 10k", "momo",
  "ck tui 50k", "lua dao", "scam", "admin check", "soi cau", "thanh soi",
  "theo tui", "theo tui ve bo", "tin tui", "tin chuan", "uy tin luon",
  "ban nha", "cam xe", "ra de", "o gam cau", "lanh qua", "chuc ae may man",
  "thua nhieu qua roi", "go lai nao", "tam linh", "ba do", "ong ba ganh cong lung",
  "hap hoi", "tho oxy", "cuu voi", "admin oi", "mod dau", "nhan code",
  "tai 100%", "xiu 100%", "chac keo", "xuong xac di", "so gi ma khong choi",
  "run qua", "tim dap", "huyet ap tang", "nhay cau", "cau 1-1", "cau bet",
  "vkl", "clgt", "vl", "vcl", "omg", "wth", "vai chuong", "vai dan"
];

// Messages when bots detect spam
export const SPAM_COMPLAINTS = [
  "spam cc gi vay", "spam lam gi cha", "admin ban no di", "nhuc dau qua",
  "bot mom di", "noi it thoi", "loi tin nhan roi", "spam ban acc do",
  "report no di ae", "chat cham thoi", "thang kia im di", "spam cai gi the"
];

export const DEALER_MESSAGES = {
  OPEN: [
    "Mời anh em đặt cược!", "Cầu đẹp, xuống tiền nào!", "Phiên mới bắt đầu.", 
    "Làm giàu không khó, mời bà con!", "Cược đi chờ chi!", "Ai chưa cược thì nhanh tay nhé!",
    "Tài hay Xỉu đây?", "Cầu này dễ về Tài lắm nha.", "Xỉu đang nuôi, anh em cân nhắc.",
    "Bắt đầu phiên cược mới.", "Đặt cược đi nào.", "Cơ hội về bờ đây rồi."
  ],
  CLOSE_SOON: [
    "Còn 5 giây nha!", "Nhanh tay nào!", "Sắp khóa sổ!", "Chốt nhanh kẻo lỡ!", 
    "Những giây cuối cùng!", "Quyết định đi nào!"
  ],
  CLOSED: [
    "Ngưng đặt cược!", "Khóa sổ!", "Chờ kết quả nhé.", "Tay ai người nấy giữ.", "Dừng tay!"
  ],
  WIN_TAI: [
    "Tài rực rỡ!", "Tài nổ!", "Về bờ anh em ơi!", "Chúc mừng team Tài!", "Tài 11, quá đẹp!", "Nhà cái thua rồi!"
  ],
  WIN_XIU: [
    "Xỉu chủ!", "Xỉu rồi!", "Ăn chặt!", "Team Xỉu điểm danh!", "Xỉu 10, đau tim chưa!", "Xỉu đẹp như mơ."
  ],
  TRIPLE: [
    "Bão rồi!!!", "Nổ hũ to!", "Tam bảo!", "Nhà cái ăn hết nha haha!", "Kỳ tích xuất hiện!", "Bão về bão về!"
  ]
};

export const generateBotName = (): string => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const num = Math.floor(Math.random() * 999);
  // No spaces, all lowercase
  return `${last}${first}${num}`;
};

export const getRandomUserChat = (): string => {
  return USER_CHATS[Math.floor(Math.random() * USER_CHATS.length)];
};

export const getRandomSpamComplaint = (): string => {
  return SPAM_COMPLAINTS[Math.floor(Math.random() * SPAM_COMPLAINTS.length)];
};

export const getRandomDealerMessage = (type: keyof typeof DEALER_MESSAGES): string => {
  const list = DEALER_MESSAGES[type];
  return list[Math.floor(Math.random() * list.length)];
};

// Generates a random bet for simulation
export const generateBotBet = (): { side: BetOption, amount: number } => {
  const side = Math.random() > 0.5 ? BetOption.TAI : BetOption.XIU;
  // Biased towards smaller amounts
  const r = Math.random();
  let amount = 1000;
  if (r > 0.95) amount = 500000;
  else if (r > 0.8) amount = 100000;
  else if (r > 0.6) amount = 50000;
  else if (r > 0.3) amount = 10000;
  else amount = 5000;
  
  return { side, amount };
};
