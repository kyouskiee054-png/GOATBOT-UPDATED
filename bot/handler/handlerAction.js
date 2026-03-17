const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

// ────────────────────────────────────────────────
//          REACTION COMMANDS CONFIGURATION
// ────────────────────────────────────────────────
const REACTION_COMMANDS = {
  kick:    "🦵",       // Kick user from group
  unsend:  ["😠", "😡", "😾", "🤬"],   // Unsend angry reactions
  mute:    "🔇",       // Mute (kick + add to muted list)
  unmute:  "🔊",       // Remove from muted list
  warn:    "⚠️",       // Warn user (count + auto-kick at 3)
  ban:     "🚫",       // Ban (kick + add to banned list)
  unban:   "🔓"        // Remove from banned list
};

// ────────────────────────────────────────────────
//          MAIN MODULE EXPORT
// ────────────────────────────────────────────────
module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
  
  // Load event handlers (dev or production)
  const handlerEvents = require(
    process.env.NODE_ENV === "development" ? "./handlerEvents.dev.js" : "./handlerEvents.js"
  )(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

  // Cooldown to prevent reaction spam
  const reactionCooldowns = new Map();
  const COOLDOWN_MS = 4500; // 4.5 seconds

  // Helper: Check if user is bot admin
  const isBotAdmin = (userID) => global.GoatBot.config.adminBot.includes(userID);

  // ────────────────────────────────────────────────
  //      REACTION COMMAND HANDLER (only admins)
  // ────────────────────────────────────────────────
  async function handleReactionCommand(event, message) {
    const { threadID, userID, messageID, reaction } = event;

    // Only bot admins can use reaction commands
    if (!isBotAdmin(userID)) return;

    // Cooldown check
    const key = `${threadID}_${userID}`;
    const now = Date.now();
    if (now - (reactionCooldowns.get(key) || 0) < COOLDOWN_MS) return;
    reactionCooldowns.set(key, now);

    const targetID = event.targetID || event.senderID;

    // Prevent targeting self or other admins (except unban)
    if (reaction !== REACTION_COMMANDS.unban) {
      if (targetID === userID || isBotAdmin(targetID)) {
        return message.send("❌ You cannot target yourself or another admin.");
      }
    }

    // ┌─────────────────────────────────────────────┐
    // │                  KICK                       │
    // └─────────────────────────────────────────────┘
    if (reaction === REACTION_COMMANDS.kick) {
      try {
        await api.removeUserFromGroup(targetID, threadID);
        api.setMessageReaction("✅", messageID, () => {}, true);
      } catch (err) {
        console.error("[Kick Error]", err);
        await message.send(`Kick failed: ${err.message || "unknown error"}`);
      }
      return;
    }

    // ┌─────────────────────────────────────────────┐
    // │                 UNSEND                      │
    // └─────────────────────────────────────────────┘
    if (REACTION_COMMANDS.unsend.includes(reaction)) {
      try {
        await api.unsendMessage(messageID);
      } catch (err) {
        // Silent ignore if message already gone
        if (!err?.message?.includes("doesn't exist") && !err?.message?.includes("not found")) {
          console.error("[Unsend Error]", err);
        }
      }
      return;
    }

    // ┌─────────────────────────────────────────────┐
    // │                  MUTE                       │
    // └─────────────────────────────────────────────┘
    if (reaction === REACTION_COMMANDS.mute) {
      try {
        await api.removeUserFromGroup(targetID, threadID);

        const data = await threadsData.get(threadID) || {};
        data.muted = data.muted || [];
        if (!data.muted.includes(targetID)) {
          data.muted.push(targetID);
          await threadsData.set(threadID, data);
        }

        api.setMessageReaction("✅", messageID, () => {}, true);
        await message.send(`🔇 <@${targetID}> muted (removed + blocked from rejoining)`);
      } catch (err) {
        console.error("[Mute Error]", err);
        await message.send(`Mute failed → ${err.message || "?"}`);
      }
      return;
    }

    // ┌─────────────────────────────────────────────┐
    // │                 UNMUTE                      │
    // └─────────────────────────────────────────────┘
    if (reaction === REACTION_COMMANDS.unmute) {
      try {
        const data = await threadsData.get(threadID) || {};
        if (!data.muted?.includes(targetID)) {
          return message.send(`ℹ️ <@${targetID}> is not muted.`);
        }

        data.muted = data.muted.filter(id => id !== targetID);
        await threadsData.set(threadID, data);

        api.setMessageReaction("✅", messageID, () => {}, true);
        await message.send(`🔊 <@${targetID}> has been unmuted.`);
      } catch (err) {
        console.error("[Unmute Error]", err);
      }
      return;
    }

    // ┌─────────────────────────────────────────────┐
    // │                  WARN                       │
    // └─────────────────────────────────────────────┘
    if (reaction === REACTION_COMMANDS.warn) {
      try {
        const data = await threadsData.get(threadID) || { warns: {} };
        data.warns = data.warns || {};

        data.warns[targetID] = (data.warns[targetID] || 0) + 1;
        const count = data.warns[targetID];

        await threadsData.set(threadID, data);

        await message.send(`⚠️ Warning [${count}/3] <@${targetID}>`);
        api.setMessageReaction("⚠️", messageID, () => {}, true);

        if (count >= 3) {
          await api.removeUserFromGroup(targetID, threadID);
          await message.send(`🚨 3 warnings reached → <@${targetID}> kicked.`);
          delete data.warns[targetID];
          await threadsData.set(threadID, data);
        }
      } catch (err) {
        console.error("[Warn Error]", err);
      }
      return;
    }

    // ┌─────────────────────────────────────────────┐
    // │                   BAN                       │
    // └─────────────────────────────────────────────┘
    if (reaction === REACTION_COMMANDS.ban) {
      try {
        await api.removeUserFromGroup(targetID, threadID);

        const data = await threadsData.get(threadID) || {};
        data.banned = data.banned || [];
        if (!data.banned.includes(targetID)) {
          data.banned.push(targetID);
          await threadsData.set(threadID, data);
        }

        api.setMessageReaction("✅", messageID, () => {}, true);
        await message.send(`🚫 <@${targetID}> banned from this group.`);
      } catch (err) {
        console.error("[Ban Error]", err);
        await message.send(`Ban failed → ${err.message || "?"}`);
      }
      return;
    }

    // ┌─────────────────────────────────────────────┐
    // │                  UNBAN                      │
    // └─────────────────────────────────────────────┘
    if (reaction === REACTION_COMMANDS.unban) {
      try {
        const data = await threadsData.get(threadID) || {};
        if (!data.banned?.includes(targetID)) {
          return message.send(`ℹ️ <@${targetID}> is not banned.`);
        }

        data.banned = data.banned.filter(id => id !== targetID);
        await threadsData.set(threadID, data);

        api.setMessageReaction("✅", messageID, () => {}, true);
        await message.send(`🔓 <@${targetID}> has been unbanned.`);
      } catch (err) {
        console.error("[Unban Error]", err);
      }
      return;
    }
  }

  // ────────────────────────────────────────────────
  //           MAIN EVENT LISTENER
  // ────────────────────────────────────────────────
  return async function mainEventHandler(event) {
    // Anti-inbox protection
    if (
      global.GoatBot.config.antiInbox === true &&
      (event.senderID === event.threadID ||
       event.userID === event.senderID ||
       event.isGroup === false) &&
      (event.senderID || event.userID || event.isGroup === false)
    ) {
      return;
    }

    const message = createFuncMessage(api, event);

    await handlerCheckDB(usersData, threadsData, event);

    const handlers = await handlerEvents(event, message);
    if (!handlers) return;

    const {
      onAnyEvent, onFirstChat, onStart, onChat,
      onReply, onEvent, handlerEvent, onReaction,
      typ, presence, read_receipt
    } = handlers;

    onAnyEvent();

    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        onFirstChat();
        onChat();
        onStart();
        onReply();
        break;

      case "event":
        handlerEvent();
        onEvent();
        break;

      case "message_reaction":
        onReaction();
        await handleReactionCommand(event, message);
        break;

      case "typ":
        typ();
        break;

      case "presence":
        presence();
        break;

      case "read_receipt":
        read_receipt();
        break;

      default:
        break;
    }
  };
};
