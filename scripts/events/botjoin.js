module.exports = {
  config: {
    name: "botJoin",
    version: "2.1.0",
    author: "Xenos ♡",
    category: "events"
  },

  onStart: async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const botID = api.getCurrentUserID();
    const addedParticipants = event.logMessageData?.addedParticipants || [];

    const botWasAdded = addedParticipants.some(u => 
      String(u.userFbId || u.userId || u.id) === botID
    );

    if (!botWasAdded) return;

    const threadID = event.threadID;

    try {
      // Config data safely fetching
      const config = global.GoatBot?.config || {};
      const prefix = config.prefix || "!";
      const ownerName = config.adminName || "Lord Xenos";
      const ownerID = config.adminBot?.[0] || "";
      const botName = config.name || "Xenos Bot";

      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName || "Sweet Paradise";
      const memberCount = threadInfo.participantIDs?.length || "??";

      const botWelcomeMsg = 
`╭─── 𝜗𝜚 ─── ୨୧ ─── 𝜗𝜚 ───╮
  ✨ ʜᴇʟʟᴏ, sᴡᴇᴇᴛɪᴇs! ✨
╰─── 𝜗𝜚 ─── ୨୧ ─── 𝜗𝜚 ───╯

🎀 ɪ'ᴍ ʏᴏᴜʀ ɴᴇᴡ ᴀssɪsᴛᴀɴᴛ ʙᴏᴛ!
ᴛʜᴀɴᴋ ʏᴏᴜ ғᴏʀ ᴀᴅᴅɪɴɢ ᴍᴇ ʜᴇʀᴇ ♡

🌸 ɢʀᴏᴜᴘ: ${groupName}
👥 ᴍᴇᴍʙᴇʀs: ${memberCount} ᴘʀᴇᴄɪᴏᴜs sᴏᴜʟs

━━━━━━━ ꒰ 💌 ꒱ ━━━━━━━

  📌 ɪɴғᴏʀᴍᴀᴛɪᴏɴ:
  • ᴍʏ ᴘʀᴇғɪx ➩ [ ${prefix} ]
  • sᴇᴇ ᴍᴇɴᴜ ➩ ${prefix}help

  📜 ɢᴜɪᴅᴇʟɪɴᴇs:
  • ᴅᴏɴ'ᴛ sᴘᴀᴍ ᴛʜᴇ ʙᴏᴛ
  • ʙᴇ ʀᴇsᴘᴇᴄᴛғᴜʟ ᴛᴏ ᴀʟʟ
  • ᴇɴᴊᴏʏ ᴛʜᴇ sᴍᴀʀᴛ ᴠɪʙᴇs!

━━━━━━━ ꒰ 👑 ꒱ ━━━━━━━

💝 ᴍʏ ᴏᴡɴᴇʀ: ${ownerName}
🔗 ᴄᴏɴᴛᴀᴄᴛ: fb.com/${ownerID}

ʟᴇᴛ's ᴍᴀᴋᴇ ᴛʜɪꜱ ɢʀᴏᴜᴘ ᴀᴍᴀᴢɪɴɢ ~ 🪽
✨──────────────────✨`;

      // 1. Set bot nickname from config (No prefix)
      try {
        await api.changeNickname(`${botName}`, threadID, botID);
      } catch (nickErr) {
        console.log("Nickname error:", nickErr.message);
      }

      // 2. Send welcome message
      const sentMsg = await api.sendMessage({
        body: botWelcomeMsg,
        mentions: [{ tag: ownerName, id: ownerID }]
      }, threadID);

      // 3. Cute reaction
      if (sentMsg?.messageID) {
        api.setMessageReaction("😇", sentMsg.messageID, () => {}, true);
      }

    } catch (err) {
      console.error("Bot Join Error:", err);
    }
  }
};