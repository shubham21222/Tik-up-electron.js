export interface WordPack {
  id: string;
  category: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
  words: string[];
}

export const prebuiltWordPacks: WordPack[] = [
  {
    id: "hate_speech",
    category: "hate_speech",
    label: "Hate Speech & Slurs",
    emoji: "🔥",
    description: "Racial, ethnic, religious, gender & orientation slurs",
    color: "text-red-400",
    words: [
      "nigger", "nigga", "nig", "chink", "gook", "spic", "wetback", "kike",
      "paki", "raghead", "towelhead", "coon", "darkie", "gypsy", "jap",
      "beaner", "cracker", "honky", "gringo", "redskin", "zipperhead",
      "faggot", "fag", "dyke", "tranny", "shemale", "homo", "queer",
      "retard", "retarded", "mongoloid", "ching chong", "slope",
      "white power", "heil hitler", "sieg heil", "gas the", "race war",
    ],
  },
  {
    id: "sexual",
    category: "sexual",
    label: "Sexual & Explicit",
    emoji: "❌",
    description: "Sexual slang, explicit terms & adult content references",
    color: "text-pink-400",
    words: [
      "dick", "cock", "pussy", "boobs", "tits", "ass", "cum", "jizz",
      "blowjob", "handjob", "deepthroat", "anal", "dildo", "vibrator",
      "porn", "pornhub", "onlyfans", "camgirl", "sex tape", "nudes",
      "send nudes", "naked", "horny", "orgasm", "boner", "erection",
      "masturbate", "wank", "fap", "milf", "hentai", "xxx",
      "slutty", "whore", "hooker", "prostitute",
    ],
  },
  {
    id: "violence",
    category: "violence",
    label: "Violence & Self-Harm",
    emoji: "⚠️",
    description: "Threats, self-harm encouragement & violent language",
    color: "text-orange-400",
    words: [
      "kill yourself", "kys", "go die", "neck yourself", "hang yourself",
      "slit your wrists", "jump off a bridge", "drink bleach",
      "suicide", "self harm", "cut yourself", "end your life",
      "i will kill you", "death threat", "bomb threat", "shoot up",
      "school shooting", "mass shooting", "murder", "stab you",
      "rape", "molest", "assault", "beat you up",
    ],
  },
  {
    id: "fraud",
    category: "fraud",
    label: "Illegal & Fraud",
    emoji: "🚫",
    description: "Scams, illegal activity & fraud-related terms",
    color: "text-yellow-400",
    words: [
      "scam", "fraud", "phishing", "hack", "hacking", "ddos",
      "credit card", "social security", "drug dealer", "drug dealing",
      "cocaine", "heroin", "meth", "weed dealer", "buy drugs",
      "money laundering", "counterfeit", "stolen credit",
      "free money glitch", "cash app flip", "paypal flip",
      "pyramid scheme", "ponzi", "get rich quick",
    ],
  },
  {
    id: "deceptive",
    category: "deceptive",
    label: "Deceptive & Spam",
    emoji: "📉",
    description: "Fake growth, misleading claims & spam phrases",
    color: "text-amber-400",
    words: [
      "buy followers", "buy likes", "buy views", "f4f", "follow4follow",
      "like4like", "l4l", "sub4sub", "s4s", "follow back",
      "guaranteed growth", "free followers", "free likes",
      "click my bio", "check my profile", "dm me for", "link in bio",
      "make money fast", "work from home", "passive income",
      "free giveaway", "you won", "congratulations you",
      "claim your prize", "gift card giveaway",
    ],
  },
  {
    id: "bullying",
    category: "bullying",
    label: "Bullying & Insults",
    emoji: "🚷",
    description: "Personal attacks, harassment & offensive insults",
    color: "text-purple-400",
    words: [
      "ugly", "fat", "fatass", "lard", "obese", "anorexic",
      "stupid", "idiot", "moron", "dumbass", "braindead",
      "loser", "pathetic", "worthless", "nobody likes you",
      "no one cares", "shut up", "stfu", "gtfo", "kms",
      "trash", "garbage", "waste of space", "kill yourself",
      "you suck", "go away", "die", "cancer", "autistic",
    ],
  },
];
