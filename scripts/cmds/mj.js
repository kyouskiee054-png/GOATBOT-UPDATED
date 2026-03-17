const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const API_ENDPOINT = "https://sifu-mj-api.onrender.com/api/generate";

async function downloadImage(url, cacheDir, index) {
    const tempFilePath = path.join(cacheDir, `mj_${Date.now()}_${index}.jpg`);
    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'arraybuffer',
        timeout: 180000 // 3 min timeout 
    });
    await fs.writeFile(tempFilePath, response.data);
    return tempFilePath;
}

async function createGrid(imagePaths, outputPath) {
    const images = await Promise.all(imagePaths.map(p => loadImage(p)));
    const size = images[0].width;
    const padding = 10;
    const canvas = createCanvas((size * 2) + (padding * 3), (size * 2) + (padding * 3));
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pos = [
        { x: padding, y: padding },
        { x: size + (padding * 2), y: padding },
        { x: padding, y: size + (padding * 2) },
        { x: size + (padding * 2), y: size + (padding * 2) }
    ];

    images.forEach((img, i) => {
        ctx.drawImage(img, pos[i].x, pos[i].y, size, size);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(pos[i].x + 35, pos[i].y + 35, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i + 1, pos[i].x + 35, pos[i].y + 45);
    });

    await fs.writeFile(outputPath, canvas.toBuffer('image/png'));
    return outputPath;
}

module.exports = {
    config: {
        name: "midjourney",
        aliases: ["mj", "imagine"],
        version: "22.0",
        author: "SiFu",
        countDown: 20,
        role: 0,
        category: "ai-image"
    },

    onStart: async function ({ message, args, event, commandName }) {
        const prompt = args.join(" ");
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) await fs.mkdirp(cacheDir);

        if (!prompt) return message.reply("ᯓ★ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴘʀᴏᴍᴘᴛ!");

        // gen noti
        const processingMsg = await message.reply("ᯓ★ ɢᴇɴᴇʀᴀᴛɪɴɢ ɪᴍᴀɢᴇs... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ (ɪᴛ ᴍᴀʏ ᴛᴀᴋᴇ ᴜᴘ ᴛᴏ 𝟸 ᴍɪɴᴜᴛᴇs)");
        message.reaction("⏳", event.messageID);
        
        let tempPaths = [];

        try {
            
            const res = await axios.get(`${API_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&model=Midjourney_6_1&ratio=1:1`, {
                timeout: 300000 
            });

            const imageUrls = res.data.images;

            if (!imageUrls || imageUrls.length < 4) throw new Error("API error");

            for (let i = 0; i < 4; i++) {
                const p = await downloadImage(imageUrls[i], cacheDir, i);
                tempPaths.push(p);
            }

            const gridPath = path.join(cacheDir, `grid_${Date.now()}.png`);
            await createGrid(tempPaths, gridPath);

            // সফল হলে প্রসেসিং মেসেজ ডিলিট করে ইমেজ পাঠানো
            await message.unsend(processingMsg.messageID);

            await message.reply({
                body: ` ᴍɪᴅᴊᴏᴜʀɴᴇʏ ᴀɪ ᯓ★\n━━━━━━━━━━━━━\n✨ ᴘʀᴏᴍᴘᴛ: ${prompt}\n📷 ʀᴇᴘʟʏ 1-4 ᴛᴏ sᴇʟᴇᴄᴛ ᴏʀ 'ᴀʟʟ'`,
                attachment: fs.createReadStream(gridPath)
            }, (err, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName,
                    author: event.senderID,
                    imageUrls,
                    tempPaths,
                    gridPath
                });
            });
            message.reaction("✅", event.messageID);
        } catch (e) {
            console.error(e);
            await message.unsend(processingMsg.messageID);
            message.reply("❌ ɢᴇɴᴇʀᴀᴛɪᴏɴ ᴛɪᴍᴇᴏᴜᴛ ᴏʀ ғᴀɪʟᴇᴅ! ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.");
            message.reaction("❌", event.messageID);
        }
    },

    onReply: async function ({ message, event, Reply }) {
        if (event.senderID !== Reply.author) return;
        const input = event.body.trim().toLowerCase();
        message.reaction("⏳", event.messageID);

        try {
            if (input === 'all') {
                const streams = Reply.tempPaths.map(p => fs.createReadStream(p));
                await message.reply({ body: "ᯓ★ ʜᴇʀᴇ ᴀʀᴇ ᴀʟʟ ɪᴍᴀɢᴇs:", attachment: streams });
            } else {
                const i = parseInt(input) - 1;
                if (i >= 0 && i < 4) {
                    await message.reply({
                        body: `ᯓ★ ɪᴍᴀɢᴇ [${i + 1}] ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ`,
                        attachment: fs.createReadStream(Reply.tempPaths[i])
                    });
                }
            }
            message.reaction("✅", event.messageID);
        } catch (e) {
            message.reply("❌ ᴇʀʀᴏʀ sᴇɴᴅɪɴɢ ɪᴍᴀɢᴇ");
        } finally {
            // Cleanup on specific action can be handled here or by a separate cron
        }
    }
};