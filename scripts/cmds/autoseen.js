const fs = require('fs-extra');
const path = require('path');
const pathFile = path.join(__dirname, 'cache', 'autoseen.txt');

module.exports = {
    config: {
        name: "autoseen",
        version: "2.0.0",
        author: "S1FU",
        countDown: 5,
        role: 2,
        shortDescription: {
            en: "𝗍𝗈𝗀𝗀𝗅𝖾 𝖺𝗎𝗍𝗈-𝗋𝖾𝖺𝖽 𝗆𝗈𝖽𝖾"
        },
        longDescription: {
            en: "𝖺𝗎𝗍𝗈𝗆𝖺𝗍𝗂𝖼𝖺𝗅𝗅𝗒 𝗆𝖺𝗋𝗄𝗌 𝖺𝗅𝗅 𝗂𝗇𝖼𝗈𝗆𝗂𝗇𝗀 𝗆𝖾𝗌𝗌𝖺𝗀𝖾𝗌 𝖺𝗌 𝗌𝖾𝖾𝗇"
        },
        category: "𝖺𝖽𝗆𝗂𝗇",
        guide: {
            en: "『 {pn} 𝗈𝗇/𝗈𝖿𝖿 』"
        }
    },

    onChat: async ({ api, event }) => {
        if (!fs.existsSync(pathFile)) fs.writeFileSync(pathFile, 'false');
        const isEnable = fs.readFileSync(pathFile, 'utf-8');
        
        if (isEnable === 'true') {
            api.markAsReadAll(() => {});
        }
    },

    onStart: async ({ api, event, args }) => {
        try {
            if (!fs.existsSync(path.dirname(pathFile))) {
                fs.mkdirSync(path.dirname(pathFile), { recursive: true });
            }

            if (args[0] === 'on') {
                fs.writeFileSync(pathFile, 'true');
                return api.sendMessage("╭─ Ი𐑼 𖹭 𝖺𝗎𝗍𝗈𝗌𝖾𝖾𝗇 𖹭 Ი𐑼 ─╮\n\n  ᯓ★ 𝗌𝗍𝖺𝗍𝗎𝗌: 𝖺𝖼𝗍𝗂𝗏𝖺𝗍𝖾𝖽\n  ⋆ 𝗆𝖾𝗌𝗌𝖺𝗀𝖾𝗌 𝗐𝗂𝗅𝗅 𝖻𝖾 𝗌𝖾𝖾𝗇 𝖺𝗎𝗍𝗈\n\n╰── ᯓ★˙𐃷˙݁ ˖Ი𐑼⋆𖹭.ᐟ ──╯", event.threadID, event.messageID);
            } 
            
            else if (args[0] === 'off') {
                fs.writeFileSync(pathFile, 'false');
                return api.sendMessage("╭─ Ი𐑼 𖹭 𝖺𝗎𝗍𝗈𝗌𝖾𝖾𝗇 𖹭 Ი𐑼 ─╮\n\n  ᯓ★ 𝗌𝗍𝖺𝗍𝗎𝗌: 𝖽𝖾𝖺𝖼𝗍𝗂𝗏𝖺𝗍𝖾𝖽\n  ⋆ 𝖺𝗎𝗍𝗈-𝗋𝖾𝖺𝖽 𝗁𝖺𝗌 𝖻𝖾𝖾𝗇 𝗁𝖺𝗅𝗍𝖾𝖽\n\n╰── ᯓ★˙𐃷˙݁ ˖Ი𐑼⋆𖹭.ᐟ ──╯", event.threadID, event.messageID);
            } 
            
            else {
                return api.sendMessage("╭── Ი𐑼 𖹭 𝗌𝗒𝗌𝗍𝖾𝗆 𖹭 Ი𐑼 ──╮\n\n  ᯓ★ 𝗂𝗇𝗏𝖺𝗅𝗂𝖽 𝗉𝖺𝗋𝖺𝗆𝖾𝗍𝖾𝗋 .ᐟ\n  ⋆ 𝗎𝗌𝖾: {pn} 𝗈𝗇 𝗈𝗋 𝗈𝖿𝖿\n\n╰── ᯓ★˙𐃷˙݁ ˖Ი𐑼⋆𖹭.ᐟ ──╯", event.threadID, event.messageID);
            }
        } catch (e) {
            console.log(e);
            api.sendMessage("ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝖿𝖺𝗂𝗅𝗎𝗋𝖾 Ი𐑼", event.threadID);
        }
    }
};