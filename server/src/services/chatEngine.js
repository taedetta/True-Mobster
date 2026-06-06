import db from '../db/index.js';

import { MOB_ALLY_CONTRIBUTION, avatarUrl } from '../../../shared/gameData.js';

import { normalizeLocale } from '../../../shared/languages.js';

import { translateText } from './translateService.js';



const MAX_MESSAGE_LEN = 500;

const MAX_CHAT_HISTORY = 100;



function sanitize(text) {

  return String(text || '').trim().slice(0, MAX_MESSAGE_LEN);

}



async function getPlayerLocale(userId) {

  const row = await db.get('SELECT locale FROM players WHERE user_id=?', [userId]);

  return normalizeLocale(row?.locale || 'en');

}



async function enrichChatRow(row, viewerUserId, viewerLocale) {

  const sourceLocale = normalizeLocale(row.source_locale || 'en');

  const base = {

    ...row,

    source_locale: sourceLocale,

    messageDisplay: row.message,

    messageOriginal: row.message,

    translated: false,

  };

  if (row.user_id === viewerUserId || sourceLocale === viewerLocale) return base;

  const t = await translateText(row.message, sourceLocale, viewerLocale);

  return {

    ...base,

    messageDisplay: t.text,

    messageOriginal: row.message,

    translated: t.translated,

  };

}



async function enrichPmRow(row, viewerUserId, viewerLocale, box) {

  const sourceLocale = normalizeLocale(row.source_locale || 'en');

  const base = {

    ...row,

    from_id: row.from_id,

    source_locale: sourceLocale,

    bodyDisplay: row.body,

    bodyOriginal: row.body,

    subjectDisplay: row.subject || '',

    subjectOriginal: row.subject || '',

    translated: false,

  };

  if (box === 'sent' || row.from_id === viewerUserId || sourceLocale === viewerLocale) return base;

  const bodyT = await translateText(row.body, sourceLocale, viewerLocale);

  const subjectT = row.subject

    ? await translateText(row.subject, sourceLocale, viewerLocale)

    : { text: '', translated: false };

  return {

    ...base,

    bodyDisplay: bodyT.text,

    bodyOriginal: row.body,

    subjectDisplay: subjectT.text,

    subjectOriginal: row.subject || '',

    translated: bodyT.translated || subjectT.translated,

  };

}



export async function sendChatMessage(userId, channel, message) {

  const body = sanitize(message);

  if (body.length < 1) throw new Error('Message too short');

  const player = await db.get('SELECT display_name, crew_id, locale FROM players WHERE user_id=?', [userId]);

  if (!player) throw new Error('Player not found');



  let ch = channel;

  if (ch === 'crew') {

    if (!player.crew_id) throw new Error('Not in a crew');

    ch = `crew:${player.crew_id}`;

  } else if (ch !== 'world') {

    throw new Error('Invalid channel');

  }



  const sourceLocale = normalizeLocale(player.locale || 'en');

  await db.run(

    'INSERT INTO chat_messages (channel, user_id, display_name, message, source_locale) VALUES (?, ?, ?, ?, ?)',

    [ch, userId, player.display_name, body, sourceLocale],

  );

  const row = await db.get(

    'SELECT * FROM chat_messages WHERE channel=? ORDER BY id DESC LIMIT 1',

    [ch],

  );



  return { ...row, channel: ch, source_locale: sourceLocale };

}



export async function getChatMessages(channel, crewId, viewerUserId, viewerLocale, limit = 50) {

  let ch = channel;

  const locale = normalizeLocale(viewerLocale || 'en');

  if (ch === 'crew') {

    if (!crewId) return [];

    ch = `crew:${crewId}`;

  } else if (ch !== 'world') {

    throw new Error('Invalid channel');

  }

  const rows = await db.all(

    'SELECT id, channel, user_id, display_name, message, source_locale, created_at FROM chat_messages WHERE channel=? ORDER BY created_at DESC LIMIT ?',

    [ch, Math.min(limit, MAX_CHAT_HISTORY)],

  );

  return Promise.all(rows.map((row) => enrichChatRow(row, viewerUserId, locale)));

}



export async function sendPrivateMessage(fromId, toUsername, subject, body) {

  const text = sanitize(body);

  if (text.length < 1) throw new Error('Message too short');

  const fromPlayer = await db.get('SELECT locale FROM players WHERE user_id=?', [fromId]);

  const sourceLocale = normalizeLocale(fromPlayer?.locale || 'en');

  const to = await db.get('SELECT u.id FROM users u JOIN players p ON p.user_id=u.id WHERE u.username=? AND u.is_bot=0', [toUsername]);

  if (!to) throw new Error('Player not found');

  if (to.id === fromId) throw new Error('Cannot message yourself');

  await db.run(

    'INSERT INTO private_messages (from_id, to_id, subject, body, source_locale) VALUES (?, ?, ?, ?, ?)',

    [fromId, to.id, sanitize(subject).slice(0, 80), text, sourceLocale],

  );

  return { toId: to.id };

}



export async function getPrivateMessages(userId, box = 'inbox', viewerLocale = 'en') {

  const locale = normalizeLocale(viewerLocale || 'en');

  if (box === 'sent') {

    const rows = await db.all(

      `SELECT pm.*, p.display_name as other_name FROM private_messages pm

       JOIN players p ON p.user_id=pm.to_id WHERE pm.from_id=? ORDER BY pm.created_at DESC LIMIT 50`,

      [userId],

    );

    return Promise.all(rows.map((row) => enrichPmRow(row, userId, locale, 'sent')));

  }

  const rows = await db.all(

    `SELECT pm.*, p.display_name as other_name FROM private_messages pm

     JOIN players p ON p.user_id=pm.from_id WHERE pm.to_id=? ORDER BY pm.created_at DESC LIMIT 50`,

    [userId],

  );

  return Promise.all(rows.map((row) => enrichPmRow(row, userId, locale, 'inbox')));

}



export async function readPrivateMessage(userId, messageId) {

  await db.run('UPDATE private_messages SET read_status=1 WHERE id=? AND to_id=?', [messageId, userId]);

}



export async function getUnreadPmCount(userId) {

  const row = await db.get('SELECT COUNT(*) as c FROM private_messages WHERE to_id=? AND read_status=0', [userId]);

  return Number(row?.c || 0);

}



export async function addMobAlly(userId, referralCode) {

  if (!referralCode) throw new Error('Invite code required');

  const ally = await db.get('SELECT user_id, display_name, mob_size FROM players WHERE referral_code=?', [referralCode.toUpperCase().trim()]);

  if (!ally) throw new Error('Invalid invite code');

  if (ally.user_id === userId) throw new Error('Cannot add yourself');

  const existing = await db.get('SELECT 1 FROM mob_allies WHERE user_id=? AND ally_id=?', [userId, ally.user_id]);

  if (existing) throw new Error('Already in your mob');

  const count = await db.get('SELECT COUNT(*) as c FROM mob_allies WHERE user_id=?', [userId]);

  if (Number(count?.c || 0) >= 50) throw new Error('Mob ally limit reached (50)');

  await db.run('INSERT INTO mob_allies (user_id, ally_id) VALUES (?, ?)', [userId, ally.user_id]);

  return { ally: { user_id: ally.user_id, display_name: ally.display_name, mob_size: ally.mob_size } };

}



export async function removeMobAlly(userId, allyId) {

  await db.run('DELETE FROM mob_allies WHERE user_id=? AND ally_id=?', [userId, allyId]);

}



export async function getMobAllies(userId) {
  const rows = await db.all(
    `SELECT p.user_id, p.display_name, p.level, p.mob_size, p.referral_code, p.avatar_id, p.avatar_custom, ma.added_at
     FROM mob_allies ma JOIN players p ON p.user_id=ma.ally_id WHERE ma.user_id=? ORDER BY ma.added_at DESC`,
    [userId],
  );
  return rows.map((r) => ({ ...r, avatar_url: avatarUrl(r) }));
}



export async function getEffectiveMobSize(userId, baseMobSize) {

  const row = await db.get('SELECT COUNT(*) as c FROM mob_allies WHERE user_id=?', [userId]);

  const allyCount = Number(row?.c || 0);

  return (baseMobSize || 1) + allyCount * MOB_ALLY_CONTRIBUTION;

}



export { getPlayerLocale };


