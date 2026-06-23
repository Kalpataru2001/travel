// src/utils/language.ts
import type { TravelPhrase } from '../types/travel';

export interface LanguageDetails {
  langCode: string;
  langName: string;
  phrases: TravelPhrase[];
}

const DICTIONARY: Record<string, { name: string; phrases: TravelPhrase[] }> = {
  French: {
    name: 'French',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Bonjour', phonetic: 'bon-zhoor' },
      { english: 'Thank you', translation: 'Merci', phonetic: 'mair-see' },
      { english: 'Please', translation: "S'il vous plaît", phonetic: 'seel voo play' },
      { english: 'Excuse me / Sorry', translation: 'Excusez-moi', phonetic: 'ex-koo-zay mwah' },
      { english: 'Yes', translation: 'Oui', phonetic: 'wee' },
      { english: 'No', translation: 'Non', phonetic: 'noh' },
      { english: 'How much is this?', translation: "C'est combien?", phonetic: 'say kohm-byahn' },
      { english: 'Where is the bathroom?', translation: 'Où sont les toilettes?', phonetic: 'oo sohn lay twah-let' },
      { english: 'Do you speak English?', translation: 'Parlez-vous anglais?', phonetic: 'par-lay voo ahn-glay' },
      { english: 'Delicious!', translation: 'Délicieux!', phonetic: 'day-lee-syuh' }
    ]
  },
  Spanish: {
    name: 'Spanish',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Hola', phonetic: 'oh-lah' },
      { english: 'Thank you', translation: 'Gracias', phonetic: 'grah-syahs' },
      { english: 'Please', translation: 'Por favor', phonetic: 'por fah-vor' },
      { english: 'Excuse me / Sorry', translation: 'Disculpe', phonetic: 'dees-kool-peh' },
      { english: 'Yes', translation: 'Sí', phonetic: 'see' },
      { english: 'No', translation: 'No', phonetic: 'noh' },
      { english: 'How much is this?', translation: '¿Cuánto cuesta?', phonetic: 'kwahn-toh kwes-tah' },
      { english: 'Where is the bathroom?', translation: '¿Dónde está el baño?', phonetic: 'dohn-deh es-tah el bah-nyoh' },
      { english: 'Do you speak English?', translation: '¿Habla inglés?', phonetic: 'ah-blah een-gles' },
      { english: 'Delicious!', translation: '¡Delicioso!', phonetic: 'deh-lee-syoh-soh' }
    ]
  },
  Japanese: {
    name: 'Japanese',
    phrases: [
      { english: 'Hello / Welcome', translation: 'こんにちは', phonetic: 'Konnichiwa' },
      { english: 'Thank you', translation: 'ありがとう', phonetic: 'Arigatou' },
      { english: 'Please', translation: 'お願いします', phonetic: 'Onegai shimasu' },
      { english: 'Excuse me / Sorry', translation: 'すみません', phonetic: 'Sumimasen' },
      { english: 'Yes', translation: 'はい', phonetic: 'Hai' },
      { english: 'No', translation: 'いいえ', phonetic: 'Iie' },
      { english: 'How much is this?', translation: 'いくらですか？', phonetic: 'Ikura desu ka?' },
      { english: 'Where is the bathroom?', translation: 'トイレはどこですか？', phonetic: 'Toire wa doko desu ka?' },
      { english: 'Do you speak English?', translation: '英語は話せますか？', phonetic: 'Eigo wa hanasemasu ka?' },
      { english: 'Delicious!', translation: '美味しい！', phonetic: 'Oishii!' }
    ]
  },
  Italian: {
    name: 'Italian',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Ciao', phonetic: 'chow' },
      { english: 'Thank you', translation: 'Grazie', phonetic: 'grah-tsyeh' },
      { english: 'Please', translation: 'Per favore', phonetic: 'pehr fah-voh-reh' },
      { english: 'Excuse me / Sorry', translation: 'Mi scusi', phonetic: 'mee skoo-zee' },
      { english: 'Yes', translation: 'Sì', phonetic: 'see' },
      { english: 'No', translation: 'No', phonetic: 'noh' },
      { english: 'How much is this?', translation: 'Quanto costa?', phonetic: 'kwahn-toh kohs-tah' },
      { english: 'Where is the bathroom?', translation: "Dov'è il bagno?", phonetic: 'doh-veh eel bah-nyoh' },
      { english: 'Do you speak English?', translation: 'Parla inglese?', phonetic: 'par-lah een-gleh-zeh' },
      { english: 'Delicious!', translation: 'Delizioso!', phonetic: 'deh-lee-tzyoh-soh' }
    ]
  },
  German: {
    name: 'German',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Hallo', phonetic: 'hah-loh' },
      { english: 'Thank you', translation: 'Danke', phonetic: 'dahn-kuh' },
      { english: 'Please', translation: 'Bitte', phonetic: 'bit-tuh' },
      { english: 'Excuse me / Sorry', translation: 'Entschuldigung', phonetic: 'ent-shool-dee-goong' },
      { english: 'Yes', translation: 'Ja', phonetic: 'yah' },
      { english: 'No', translation: 'Nein', phonetic: 'nine' },
      { english: 'How much is this?', translation: 'Wie viel kostet das?', phonetic: 'vee feel kohs-tet dahs' },
      { english: 'Where is the bathroom?', translation: 'Wo ist die Toilette?', phonetic: 'voh ist dee twah-let-tuh' },
      { english: 'Do you speak English?', translation: 'Sprechen Sie Englisch?', phonetic: 'shpreh-khen zee eng-lish' },
      { english: 'Delicious!', translation: 'Lecker!', phonetic: 'leck-er' }
    ]
  },
  Hindi: {
    name: 'Hindi',
    phrases: [
      { english: 'Hello / Welcome', translation: 'नमस्ते', phonetic: 'Namaste' },
      { english: 'Thank you', translation: 'धन्यवाद', phonetic: 'Dhanyavaad' },
      { english: 'Please', translation: 'कृपया', phonetic: 'Kripya' },
      { english: 'Excuse me / Sorry', translation: 'माफ़ कीजिये', phonetic: 'Maaf kijiye' },
      { english: 'Yes', translation: 'हाँ', phonetic: 'Haan' },
      { english: 'No', translation: 'नहीं', phonetic: 'Nahin' },
      { english: 'How much is this?', translation: 'यह कितने का है?', phonetic: 'Yeh kitne ka hai?' },
      { english: 'Where is the bathroom?', translation: 'शौचालय कहाँ है?', phonetic: 'Shauchalay kahan hai?' },
      { english: 'Do you speak English?', translation: 'क्या आप अंग्रेज़ी बोलते हैं?', phonetic: 'Kya aap angrezi bolte hain?' },
      { english: 'Delicious!', translation: 'स्वादिष्ट!', phonetic: 'Svaadishth!' }
    ]
  },
  Thai: {
    name: 'Thai',
    phrases: [
      { english: 'Hello / Welcome', translation: 'สวัสดี', phonetic: 'Sawasdee' },
      { english: 'Thank you', translation: 'ขอบคุณ', phonetic: 'Khob khun' },
      { english: 'Please', translation: 'กรุณา', phonetic: 'Karuna' },
      { english: 'Excuse me / Sorry', translation: 'ขอโทษ', phonetic: 'Kho thot' },
      { english: 'Yes', translation: 'ใช่', phonetic: 'Chai' },
      { english: 'No', translation: 'ไม่', phonetic: 'Mai' },
      { english: 'How much is this?', translation: 'เท่าไหร่?', phonetic: 'Thao rai?' },
      { english: 'Where is the bathroom?', translation: 'ห้องน้ำอยู่ที่ไหน?', phonetic: 'Hong nam yoo thee nai?' },
      { english: 'Do you speak English?', translation: 'พูดภาษาอังกฤษได้ไหม?', phonetic: 'Phoot phasa angkrit dai mai?' },
      { english: 'Delicious!', translation: 'อร่อย!', phonetic: 'Aroi!' }
    ]
  },
  Portuguese: {
    name: 'Portuguese',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Olá / Bem-vindo', phonetic: 'oh-lah / behm veen-doo' },
      { english: 'Thank you', translation: 'Obrigado', phonetic: 'oh-bree-gah-doo' },
      { english: 'Please', translation: 'Por favor', phonetic: 'por fah-vor' },
      { english: 'Excuse me / Sorry', translation: 'Com licença / Desculpe', phonetic: 'kohm lee-sehn-sah / dehs-kool-peh' },
      { english: 'Yes', translation: 'Sim', phonetic: 'seem' },
      { english: 'No', translation: 'Não', phonetic: 'now' },
      { english: 'How much is this?', translation: 'Quanto custa?', phonetic: 'kwahn-too koos-tah' },
      { english: 'Where is the bathroom?', translation: 'Onde fica o banheiro?', phonetic: 'ohn-deh fee-kah oo bah-nyay-roo' },
      { english: 'Do you speak English?', translation: 'Fala inglês?', phonetic: 'fah-lah een-glehs' },
      { english: 'Delicious!', translation: 'Delicioso!', phonetic: 'deh-lee-see-oh-zoo' }
    ]
  },
  Korean: {
    name: 'Korean',
    phrases: [
      { english: 'Hello / Welcome', translation: '안녕하세요', phonetic: 'Annyeonghaseyo' },
      { english: 'Thank you', translation: '감사합니다', phonetic: 'Gamsahabnida' },
      { english: 'Please', translation: '부탁드립니다', phonetic: 'Butag deuribnida' },
      { english: 'Excuse me / Sorry', translation: '죄송합니다', phonetic: 'Joesonghabnida' },
      { english: 'Yes', translation: '네', phonetic: 'Ne' },
      { english: 'No', translation: '아니요', phonetic: 'Aniyo' },
      { english: 'How much is this?', translation: '이것은 얼마인가요?', phonetic: 'Igeoseun eolmaingayo?' },
      { english: 'Where is the bathroom?', translation: '화장실은 어디인가요?', phonetic: 'Hwajangshireun eodiingayo?' },
      { english: 'Do you speak English?', translation: '영어 할 줄 아세요?', phonetic: 'Yeongeo hal jul aseyo?' },
      { english: 'Delicious!', translation: '맛있어요!', phonetic: 'Masisseoyo!' }
    ]
  },
  Chinese: {
    name: 'Chinese',
    phrases: [
      { english: 'Hello / Welcome', translation: '你好', phonetic: 'Nǐ hǎo' },
      { english: 'Thank you', translation: '谢谢', phonetic: 'Xièxiè' },
      { english: 'Please', translation: '请', phonetic: 'Qǐng' },
      { english: 'Excuse me / Sorry', translation: '对不起', phonetic: 'Duìbuqǐ' },
      { english: 'Yes', translation: '是的', phonetic: 'Shì de' },
      { english: 'No', translation: '不是', phonetic: 'Bú shì' },
      { english: 'How much is this?', translation: '这个多少钱？', phonetic: 'Zhège duōshǎo qián?' },
      { english: 'Where is the bathroom?', translation: '洗手间在哪里？', phonetic: 'Xǐshǒujiān zài nǎlǐ?' },
      { english: 'Do you speak English?', translation: '你会说英语吗？', phonetic: 'Nǐ huì shuō Yīngyǔ ma?' },
      { english: 'Delicious!', translation: '好吃！', phonetic: 'Hǎochī!' }
    ]
  },
  Arabic: {
    name: 'Arabic',
    phrases: [
      { english: 'Hello / Welcome', translation: 'مرحباً / أهلاً', phonetic: 'Marhaban / Ahlan' },
      { english: 'Thank you', translation: 'شكراً', phonetic: 'Shukran' },
      { english: 'Please', translation: 'من فضلك', phonetic: 'Min fadlik' },
      { english: 'Excuse me / Sorry', translation: 'عذراً / آسف', phonetic: 'Uthran / Aasif' },
      { english: 'Yes', translation: 'نعم', phonetic: 'Naam' },
      { english: 'No', translation: 'لا', phonetic: 'Laa' },
      { english: 'How much is this?', translation: 'بكم هذا؟', phonetic: 'Bikam haatha?' },
      { english: 'Where is the bathroom?', translation: 'أين الحمام؟', phonetic: 'Ayna al-hammaam?' },
      { english: 'Do you speak English?', translation: 'هل تتحدث الإنجليزية؟', phonetic: 'Hal tatahaddath al-injleeziah?' },
      { english: 'Delicious!', translation: 'لذيذ!', phonetic: 'Latheeth!' }
    ]
  },
  Turkish: {
    name: 'Turkish',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Merhaba', phonetic: 'Mair-hah-bah' },
      { english: 'Thank you', translation: 'Teşekkür ederim', phonetic: 'Teh-sheh-kur eh-deh-reem' },
      { english: 'Please', translation: 'Lütfen', phonetic: 'Loot-fen' },
      { english: 'Excuse me / Sorry', translation: 'Afedersiniz / Üzgünüm', phonetic: 'Ah-feh-dair-see-neez / Ooz-gun-um' },
      { english: 'Yes', translation: 'Evet', phonetic: 'Eh-vet' },
      { english: 'No', translation: 'Hayır', phonetic: 'Hah-yuhr' },
      { english: 'How much is this?', translation: 'Bu ne kadar?', phonetic: 'Bu neh kah-dahr' },
      { english: 'Where is the bathroom?', translation: 'Tuvalet nerede?', phonetic: 'Too-vah-let neh-reh-deh' },
      { english: 'Do you speak English?', translation: 'İngilizce biliyor musunuz?', phonetic: 'Een-gee-leez-jeh bee-lee-yohr mus-unuz' },
      { english: 'Delicious!', translation: 'Lezzetli!', phonetic: 'Lez-zet-lee' }
    ]
  },
  Vietnamese: {
    name: 'Vietnamese',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Xin chào', phonetic: 'Seen chow' },
      { english: 'Thank you', translation: 'Cảm ơn', phonetic: 'Gam uhn' },
      { english: 'Please', translation: 'Làm ơn', phonetic: 'Lam uhn' },
      { english: 'Excuse me / Sorry', translation: 'Xin lỗi', phonetic: 'Seen loy' },
      { english: 'Yes', translation: 'Vâng', phonetic: 'Vuhng' },
      { english: 'No', translation: 'Không', phonetic: 'Khom' },
      { english: 'How much is this?', translation: 'Cái này bao nhiêu?', phonetic: 'Kai nay bao nyew' },
      { english: 'Where is the bathroom?', translation: 'Nhà vệ sinh ở đâu?', phonetic: 'Nha vay seen uh dow' },
      { english: 'Do you speak English?', translation: 'Bạn có nói tiếng Anh không?', phonetic: 'Ban co noy tyeng Anh khom' },
      { english: 'Delicious!', translation: 'Ngon quá!', phonetic: 'Ngong kwah' }
    ]
  },
  Greek: {
    name: 'Greek',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Γειά σας', phonetic: 'Yah sas' },
      { english: 'Thank you', translation: 'Ευχαριστώ', phonetic: 'Ef-khah-rees-toh' },
      { english: 'Please', translation: 'Παρακαλώ', phonetic: 'Pah-rah-kah-loh' },
      { english: 'Excuse me / Sorry', translation: 'Συγνώμη', phonetic: 'See-ghnoh-mee' },
      { english: 'Yes', translation: 'Ναι', phonetic: 'Neh' },
      { english: 'No', translation: 'Όχι', phonetic: 'Oh-khee' },
      { english: 'How much is this?', translation: 'Πόσο κάνει αυτό;', phonetic: 'Poh-soh kah-nee ahf-toh' },
      { english: 'Where is the bathroom?', translation: 'Πού είναι η τουαλέτα;', phonetic: 'Poo ee-neh ee too-ah-leh-tah' },
      { english: 'Do you speak English?', translation: 'Μιλάτε αγγλικά;', phonetic: 'Mee-lah-teh ahng-glee-kah' },
      { english: 'Delicious!', translation: 'Νόστιμο!', phonetic: 'Nohs-tee-moh' }
    ]
  }
};

const LANGUAGE_MAP: Record<string, { code: string; name: string }> = {
  france: { code: 'fr-FR', name: 'French' },
  paris: { code: 'fr-FR', name: 'French' },
  spain: { code: 'es-ES', name: 'Spanish' },
  barcelona: { code: 'es-ES', name: 'Spanish' },
  madrid: { code: 'es-ES', name: 'Spanish' },
  mexico: { code: 'es-ES', name: 'Spanish' },
  cancun: { code: 'es-ES', name: 'Spanish' },
  argentina: { code: 'es-ES', name: 'Spanish' },
  chile: { code: 'es-ES', name: 'Spanish' },
  colombia: { code: 'es-ES', name: 'Spanish' },
  peru: { code: 'es-ES', name: 'Spanish' },
  japan: { code: 'ja-JP', name: 'Japanese' },
  tokyo: { code: 'ja-JP', name: 'Japanese' },
  kyoto: { code: 'ja-JP', name: 'Japanese' },
  osaka: { code: 'ja-JP', name: 'Japanese' },
  italy: { code: 'it-IT', name: 'Italian' },
  rome: { code: 'it-IT', name: 'Italian' },
  venice: { code: 'it-IT', name: 'Italian' },
  florence: { code: 'it-IT', name: 'Italian' },
  milan: { code: 'it-IT', name: 'Italian' },
  germany: { code: 'de-DE', name: 'German' },
  berlin: { code: 'de-DE', name: 'German' },
  munich: { code: 'de-DE', name: 'German' },
  austria: { code: 'de-DE', name: 'German' },
  vienna: { code: 'de-DE', name: 'German' },
  switzerland: { code: 'de-DE', name: 'German' },
  zurich: { code: 'de-DE', name: 'German' },
  india: { code: 'hi-IN', name: 'Hindi' },
  delhi: { code: 'hi-IN', name: 'Hindi' },
  mumbai: { code: 'hi-IN', name: 'Hindi' },
  bangalore: { code: 'hi-IN', name: 'Hindi' },
  thailand: { code: 'th-TH', name: 'Thai' },
  bangkok: { code: 'th-TH', name: 'Thai' },
  phuket: { code: 'th-TH', name: 'Thai' },
  portugal: { code: 'pt-BR', name: 'Portuguese' },
  lisbon: { code: 'pt-BR', name: 'Portuguese' },
  brazil: { code: 'pt-BR', name: 'Portuguese' },
  rio: { code: 'pt-BR', name: 'Portuguese' },
  korea: { code: 'ko-KR', name: 'Korean' },
  seoul: { code: 'ko-KR', name: 'Korean' },
  china: { code: 'zh-CN', name: 'Chinese' },
  beijing: { code: 'zh-CN', name: 'Chinese' },
  shanghai: { code: 'zh-CN', name: 'Chinese' },
  egypt: { code: 'ar-EG', name: 'Arabic' },
  cairo: { code: 'ar-EG', name: 'Arabic' },
  dubai: { code: 'ar-EG', name: 'Arabic' },
  uae: { code: 'ar-EG', name: 'Arabic' },
  turkey: { code: 'tr-TR', name: 'Turkish' },
  istanbul: { code: 'tr-TR', name: 'Turkish' },
  vietnam: { code: 'vi-VN', name: 'Vietnamese' },
  hanoi: { code: 'vi-VN', name: 'Vietnamese' },
  indonesia: { code: 'id-ID', name: 'Indonesian' },
  bali: { code: 'id-ID', name: 'Indonesian' },
  greece: { code: 'el-GR', name: 'Greek' },
  athens: { code: 'el-GR', name: 'Greek' }
};

/**
 * Returns BCP 47 language code, language name, and fallback phrase translations for a destination.
 */
export function getFallbackLanguageDetails(destination: string): LanguageDetails {
  const destLower = destination.toLowerCase();

  let matchedLang = 'English';
  let matchedCode = 'en-US';

  for (const [key, details] of Object.entries(LANGUAGE_MAP)) {
    if (destLower.includes(key)) {
      matchedLang = details.name;
      matchedCode = details.code;
      break;
    }
  }

  const dictEntry = DICTIONARY[matchedLang] || {
    name: 'English',
    phrases: [
      { english: 'Hello / Welcome', translation: 'Hello', phonetic: 'heh-loh' },
      { english: 'Thank you', translation: 'Thank you', phonetic: 'thangk yoo' },
      { english: 'Please', translation: 'Please', phonetic: 'pleez' },
      { english: 'Excuse me / Sorry', translation: 'Excuse me', phonetic: 'ik-skyooz mee' },
      { english: 'Yes', translation: 'Yes', phonetic: 'yes' },
      { english: 'No', translation: 'No', phonetic: 'noh' },
      { english: 'How much is this?', translation: 'How much is this?', phonetic: 'how muhch' },
      { english: 'Where is the bathroom?', translation: 'Where is the bathroom?', phonetic: 'wair is the bath-room' },
      { english: 'Do you speak English?', translation: 'Do you speak English?', phonetic: 'do yoo speek ing-glish' },
      { english: 'Delicious!', translation: 'Delicious!', phonetic: 'di-lish-uhs' }
    ]
  };

  return {
    langCode: matchedCode,
    langName: dictEntry.name,
    phrases: dictEntry.phrases
  };
}

/**
 * Speaks a text using native SpeechSynthesis in the chosen language.
 */
export function speakPhrase(text: string, langCode: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel active speech to avoid queuing delays
  window.speechSynthesis.cancel();

  // Short timeout resolves synchronous execution freeze on Chromium browsers
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    
    // Attempt exact voice match, then short locale code match
    let voice = voices.find((v) => v.lang === langCode);
    if (!voice) {
      const short = langCode.split('-')[0];
      voice = voices.find((v) => v.lang.startsWith(short));
    }

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }, 50);
}
