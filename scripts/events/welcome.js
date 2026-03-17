const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "welcome",
    version: "3.1",
    author: "SiFu",
    category: "events"
  },

  onStart: async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const newUsers = logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    if (newUsers.some(u => u.userFbId === botID)) return;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;
      const groupName = threadInfo.threadName || "This Group";

      for (const user of newUsers) {
        const userId = user.userFbId;
        const fullName = user.fullName.toUpperCase();
        const addedBy = logMessageData.author || "Someone";

        // Random Background
        const bgList = [
          "https://i.imgur.com/umopPUQ.jpeg",
          "https://i.imgur.com/HDEZgFR.jpeg",
          "https://i.imgur.com/KN717Yb.jpeg",
          "https://i.imgur.com/nLKr9FI.jpeg"   // তোমার দেওয়া উদাহরণের BG
        ];
        const randomBG = bgList[Math.floor(Math.random() * bgList.length)];

        const avatarURL = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        // === XENOS V2 Improved Welcome Card API ===
        const apiUrl = `https://maybexenos.vercel.app/v2/welcomecard?` +
          `background=${encodeURIComponent(randomBG)}` +
          `&avatar=${encodeURIComponent(avatarURL)}` +
          `&text1=${encodeURIComponent(fullName)}` +
          `&text2=${encodeURIComponent("WELCOME BABY 💖")}` +
          `&text3=${encodeURIComponent(`YOU ARE THE ${memberCount}TH MEMBER`)}` +
          `&groupname=${encodeURIComponent(groupName)}` +
          `&addedby=${encodeURIComponent("Added by: " + addedBy)}`;

        const tmpDir = path.join(__dirname, "cache");
        await fs.ensureDir(tmpDir);
        const imagePath = path.join(tmpDir, `welcome_v2_${userId}.png`);

        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imagePath, response.data);

        await api.sendMessage({
          body: `👋 Welcome @${fullName}!\n` +
                `🎉 You are the ${memberCount}th member of ${groupName}`,
          mentions: [{ tag: fullName, id: userId }],
          attachment: fs.createReadStream(imagePath)
        }, threadID, () => {
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });
      }
    } catch (err) {
      console.error("❌ Welcome Error:", err);
    }
  }
};
