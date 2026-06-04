/** UI strings for key game moments — keyed by locale code. */
const EN = {
  fightVictory: 'Victory!',
  fightLost: 'You lost!',
  showOriginal: 'Show original',
  showTranslation: 'Show translation',
  language: 'Language',
  selectLanguage: 'Select your language',
  languageHint: 'Messages you send are translated for players who use another language.',
  saveLanguage: 'Save language',
  languageUpdated: 'Language updated!',
  translatedFrom: 'Translated',
};

const ES = {
  fightVictory: '¡Victoria!',
  fightLost: '¡Perdiste!',
  showOriginal: 'Ver original',
  showTranslation: 'Ver traducción',
  language: 'Idioma',
  selectLanguage: 'Elige tu idioma',
  languageHint: 'Tus mensajes se traducen automáticamente para jugadores en otro idioma.',
  saveLanguage: 'Guardar idioma',
  languageUpdated: '¡Idioma actualizado!',
  translatedFrom: 'Traducido',
};

const ZH = {
  fightVictory: '胜利！',
  fightLost: '你输了！',
  showOriginal: '查看原文',
  showTranslation: '查看译文',
  language: '语言',
  selectLanguage: '选择您的语言',
  languageHint: '您发送的消息会自动翻译成其他玩家的语言。',
  saveLanguage: '保存语言',
  languageUpdated: '语言已更新！',
  translatedFrom: '已翻译',
};

const RU = {
  fightVictory: 'Победа!',
  fightLost: 'Вы проиграли!',
  showOriginal: 'Показать оригинал',
  showTranslation: 'Показать перевод',
  language: 'Язык',
  selectLanguage: 'Выберите язык',
  languageHint: 'Ваши сообщения автоматически переводятся для игроков на других языках.',
  saveLanguage: 'Сохранить язык',
  languageUpdated: 'Язык обновлён!',
  translatedFrom: 'Переведено',
};

const FR = {
  fightVictory: 'Victoire !',
  fightLost: 'Vous avez perdu !',
  showOriginal: 'Voir l\'original',
  showTranslation: 'Voir la traduction',
  language: 'Langue',
  selectLanguage: 'Choisissez votre langue',
  languageHint: 'Vos messages sont traduits pour les joueurs qui parlent une autre langue.',
  saveLanguage: 'Enregistrer',
  languageUpdated: 'Langue mise à jour !',
  translatedFrom: 'Traduit',
};

const DE = {
  fightVictory: 'Sieg!',
  fightLost: 'Du hast verloren!',
  showOriginal: 'Original anzeigen',
  showTranslation: 'Übersetzung anzeigen',
  language: 'Sprache',
  selectLanguage: 'Wähle deine Sprache',
  languageHint: 'Deine Nachrichten werden für Spieler in anderen Sprachen übersetzt.',
  saveLanguage: 'Sprache speichern',
  languageUpdated: 'Sprache aktualisiert!',
  translatedFrom: 'Übersetzt',
};

const IT = {
  fightVictory: 'Vittoria!',
  fightLost: 'Hai perso!',
  showOriginal: 'Mostra originale',
  showTranslation: 'Mostra traduzione',
  language: 'Lingua',
  selectLanguage: 'Seleziona la tua lingua',
  languageHint: 'I tuoi messaggi vengono tradotti per i giocatori che usano un\'altra lingua.',
  saveLanguage: 'Salva lingua',
  languageUpdated: 'Lingua aggiornata!',
  translatedFrom: 'Tradotto',
};

const PT = {
  fightVictory: 'Vitória!',
  fightLost: 'Você perdeu!',
  showOriginal: 'Ver original',
  showTranslation: 'Ver tradução',
  language: 'Idioma',
  selectLanguage: 'Selecione seu idioma',
  languageHint: 'Suas mensagens são traduzidas para jogadores em outro idioma.',
  saveLanguage: 'Salvar idioma',
  languageUpdated: 'Idioma atualizado!',
  translatedFrom: 'Traduzido',
};

const JA = {
  fightVictory: '勝利！',
  fightLost: '敗北！',
  showOriginal: '原文を表示',
  showTranslation: '翻訳を表示',
  language: '言語',
  selectLanguage: '言語を選択',
  languageHint: '送信したメッセージは他の言語のプレイヤー向けに自動翻訳されます。',
  saveLanguage: '言語を保存',
  languageUpdated: '言語を更新しました！',
  translatedFrom: '翻訳済み',
};

export const UI_STRINGS = {
  en: EN,
  es: ES,
  zh: ZH,
  ru: RU,
  fr: FR,
  de: DE,
  it: IT,
  pt: PT,
  ja: JA,
};

export function t(key, locale = 'en') {
  const code = String(locale || 'en').split('-')[0].toLowerCase();
  return UI_STRINGS[code]?.[key] || UI_STRINGS.en[key] || key;
}
