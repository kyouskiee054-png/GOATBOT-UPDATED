const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "alive",
    version: "3.5",
    author: "S1FU",
    countDown: 5,
    role: 0,
    shortDescription: { en: "𝖻𝗈𝗍 𝖺𝗅𝗂𝗏𝖾 𝖼𝗁𝖾𝖼𝗄 𝗐𝗂𝗍𝗁 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝗏𝗂𝖽𝖾𝗈" },
    category: "𝖺𝗅𝗂𝗏𝖾",
    guide: { en: "『 {pn} 』" }
  },

  onStart: async function ({ message, event }) {
    const videoUrl = "https://i.imgur.com/IudwgaP.mp4";
    const cacheDir = path.join(__dirname, "cache");
    
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const videoPath = path.join(cacheDir, `alive_${Date.now()}.mp4`);

    try {
      const res = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const writer = fs.createWriteStream(videoPath);
      res.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: `Ი𐑼 𖹭 𝗌𝗒𝗌𝗍𝖾𝗆 𝖺𝗅𝗂𝗏𝖾 𖹭 Ი𐑼\n\n  ᯓ★ 𝗌𝗍𝖺𝗍𝗎𝗌: 𝖺𝖼𝗍𝗂𝗏𝖾 .ᐟ\n  ᯓ★ 𝗆𝖺𝖽𝖾 𝖻𝗒: you Ი𐑼\n  ᯓ★ 𝗋𝖾𝖺𝖽𝗒 𝗍𝗈 𝗌𝖾𝗋𝗏𝖾 𝗒𝗈𝗎 ⋆\n\n╰── ᯓ★˙𐃷˙݁ ˖Ი𐑼⋆𖹭.ᐟ ──╯`,
          attachment: fs.createReadStream(videoPath)
        });
        
        setTimeout(() => { 
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); 
        }, 20000);
      });

      writer.on("error", (e) => {
        console.error("𝖿𝗂𝗅𝖾 𝗐𝗋𝗂𝗍𝖾 𝖾𝗋𝗋𝗈𝗋:", e);
        message.reply("ᯓ★ 𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗌𝖺𝗏𝖾 𝗏𝗂𝖽𝖾𝗈 Ი𐑼");
      });

    } catch (err) {
      console.error("𝖽𝗈𝗐𝗇𝗅𝗈𝖺𝖽 𝖾𝗋𝗋𝗈𝗋:", err);
      message.reply("ᯓ★ 𝖼𝗈𝗇𝗇𝖾𝖼𝗍𝗂𝗈𝗇 𝖾𝗋𝗋𝗈𝗋 𝗐𝗂𝗍𝗁 𝗂𝗆𝗀𝗎𝗋 𝗅𝗂𝗇𝗄 .ᐟ");
    }
  }
};