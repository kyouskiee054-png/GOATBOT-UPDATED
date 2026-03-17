const fs = require("fs-extra");
const path = require("path");
const axios = require("axios"); 
const moment = require("moment-timezone");

module.exports.config = {
  name: "autotime",
  aliases: ["attm"],
  version: "5.0",
  role: 0,
  author: "乛 Xꫀᥒos ゎ",
  description: "⏰ Hourly header + Motivational message + Random video",
  category: "AutoTime",
  countDown: 5,
};

module.exports.onLoad = async function ({ api }) {
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const statusFile = path.join(cacheDir, "autotimer_status.json");
  let autoEnabled = true;

  const loadStatus = () => {
    if (fs.existsSync(statusFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(statusFile));
        autoEnabled = data.enabled !== false;
      } catch {}
    }
  };
  loadStatus();

  const timerData = {
    "12:00 AM": { text: "Midnight! A new day begins. Rest well, star! 🌌✨", video: "https://i.imgur.com/xueYN43.mp4" },
    "01:00 AM": { text: "Quiet night vibes. Dream big under the moonlight! 🌙💤", video: "https://i.imgur.com/9oEVcGs.mp4" },
    "02:00 AM": { text: "The stars are shining just for you. Sleep tight! ⭐🧸", video: "https://i.imgur.com/2b8XhoC.mp4" },
    "03:00 AM": { text: "Deep sleep is the best medicine. Catch some Zs! 😴🌌", video: "https://i.imgur.com/9oEVcGs.mp4" },
    "04:00 AM": { text: "Early birds aren't up yet, but the magic is! 🕯️✨", video: "https://i.imgur.com/xueYN43.mp4" },
    "05:00 AM": { text: "The world is waking up. Good morning, sunshine! 🌅☀️", video: "https://i.imgur.com/2b8XhoC.mp4" },
    "06:00 AM": { text: "Rise and shine! Today is full of possibilities. ☕🌸", video: "https://i.imgur.com/9oEVcGs.mp4" },
    "07:00 AM": { text: "Breakfast time! Fuel your body and soul. 🥞🍓", video: "https://i.imgur.com/xueYN43.mp4" },
    "08:00 AM": { text: "Go out and conquer the world with kindness! 🌍💪", video: "https://i.imgur.com/2b8XhoC.mp4" },
    "09:00 AM": { text: "Focus and flow. You're doing amazing! 📈✨", video: "https://i.imgur.com/9oEVcGs.mp4" },
    "10:00 AM": { text: "Mid-morning boost! Take a deep breath. 🌿🦋", video: "https://i.imgur.com/xueYN43.mp4" },
    "11:00 AM": { text: "Almost lunch! Keep that momentum going. 🚀🔥", video: "https://i.imgur.com/2b8XhoC.mp4" },
    "12:00 PM": { text: "High noon! Enjoy your delicious meal. 🍱😋", video: "https://i.imgur.com/9oEVcGs.mp4" },
    "01:00 PM": { text: "Afternoon glow. Stay hydrated and happy! 💧☀️", video: "https://i.imgur.com/xueYN43.mp4" },
    "02:00 PM": { text: "Keep pushing! You're closer than you think. 🎯✨", video: "https://i.imgur.com/2b8XhoC.mp4" },
    "03:00 PM": { text: "Tea time? A little break does wonders. 🍵🍰", video: "https://i.imgur.com/9oEVcGs.mp4" },
    "04:00 PM": { text: "Golden hour is near. Pure magic in the air! 🌇✨", video: "https://i.imgur.com/xueYN43.mp4" },
    "05:00 PM": { text: "Work day winding down. Reflect on your wins! 🏅😊", video: "https://i.imgur.com/2b8XhoC.mp4" },
    "06:00 PM": { text: "Evening peace. Spend time with loved ones. 🏡💞", video: "https://i.imgur.com/9oEVcGs.mp4" },
    "07:00 PM": { text: "Dinner is served! Relax and enjoy the night. 🍝🍷", video: "https://i.imgur.com/xueYN43.mp4" },
    "08:00 PM": { text: "Cozy vibes only. Unplug and decompress. 📚🕯️", video: "https://i.imgur.com/2b8XhoC.mp4" },
    "09:00 PM": { text: "Self-care hour. You deserve the best! 🛁✨", video: "https://i.imgur.com/9oEVcGs.mp4" },
    "10:00 PM": { text: "Getting ready for bed. Sweet dreams await! 🛌⭐", video: "https://i.imgur.com/xueYN43.mp4" },
    "11:00 PM": { text: "Day is done. Rest your beautiful mind. 💤🌌", video: "https://i.imgur.com/2b8XhoC.mp4" }
  };

  let lastSentHour = -1;

  const checkAndSend = async () => {
    loadStatus();
    if (!autoEnabled) return;

    const now = moment().tz("Asia/Dhaka");
    const currentHour = now.format("HH");
    
    if (now.minutes() !== 0 || currentHour === lastSentHour) return; 
    lastSentHour = currentHour;

    const key = now.format("hh:00 A");
    const data = timerData[key];
    if (!data) return;

    const { text, video } = data;
    const timeFormatted = now.format("hh:mm A");
    const todayDate = now.format("dddd, MMMM Do");
    const hour = now.hour();
    
    let period = hour >= 5 && hour < 12 ? "𝐌𝐨𝐫𝐧𝐢𝐧𝐠" :
                 hour >= 12 && hour < 17 ? "𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧" :
                 hour >= 17 && hour < 20 ? "𝐄𝐯𝐞𝐧𝐢𝐧𝐠" : "𝐍𝐢𝐠𝐡ᴛ";

    const header = period === "𝐌𝐨𝐫𝐧𝐢𝐧𝐠" ? "🌅" : period === "𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧" ? "☀️" : period === "𝐄𝐯𝐞𝐧𝐢𝐧𝐠" ? "🌆" : "🌌";

    const finalText = 
      `╔═════ { ${header} } ═════╗\n` +
      `   ✨ 𝐆𝐎𝐎𝐃 ${period.toUpperCase()} ✨\n` +
      `╚═══════════════════╝\n\n` +
      `┏━━━〔 ⏰ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 〕━━━┓\n` +
      `  ┣ 🕒 𝐓𝐢𝐦𝐞: ${timeFormatted}\n` +
      `  ┣ 📅 𝐃𝐚𝐭𝐞: ${todayDate}\n` +
      `  ┣ 🧸 𝐒𝐭𝐚𝐭𝐮𝐬: Active & Cute\n` +
      `┗━━━━━━━━━━━━━━━━━━┛\n\n` +
      `╭┈─────── ೄྀ࿐ ˊˎ-\n` +
      `╰┈➤ ❝ ${text} ❞\n\n` +
      `  🌸 𝐒𝐭𝐚𝐲 𝐇𝐚𝐩𝐩𝐲 & 𝐁𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 🌸\n` +
      `  ✨ 𝐘𝐨𝐮 𝐀𝐫𝐞 𝐀𝐦𝐚𝐳𝐢𝐧𝐠! ✨\n` +
      `───────────────────\n` +
      `  🤖 𝐀𝐮𝐭𝐡𝐨𝐫: 乛 Lord Xꫀᥒos ゎ`;

    const videoFile = path.join(cacheDir, `auto_${Date.now()}.mp4`);

    try {
      const response = await axios({
        url: video,
        method: 'GET',
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(videoFile);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const allThreads = await api.getThreadList(100, null, ["INBOX"]);
      const groups = allThreads.filter(t => t.isGroup);

      for (const group of groups) {
        await api.sendMessage({
          body: finalText,
          attachment: fs.createReadStream(videoFile)
        }, group.threadID).catch(e => console.log(`Group ${group.threadID} send error:`, e));
      }

    } catch (err) {
      console.error("❌ AutoTimer Error:", err.message);
    } finally {
      if (fs.existsSync(videoFile)) {
        fs.unlink(videoFile, (err) => { if(err) console.log(err); }); 
      }
    }
  };

  setInterval(checkAndSend, 30 * 1000);
};

module.exports.onStart = async function ({ message, args, prefix }) {
  const cacheDir = path.join(__dirname, "cache");
  const statusFile = path.join(cacheDir, "autotimer_status.json");

  if (args[0] === "on" || args[0] === "off") {
    const enabled = args[0] === "on";
    fs.writeFileSync(statusFile, JSON.stringify({ enabled }, null, 2));
    return message.reply(`🎀 AutoTimer has been successfully ${enabled ? "Enabled ✅" : "Disabled ❌"}! 🧸`);
  }

  return message.reply(`🌸 Usage:\n➤ ${prefix}autotimer on\n➤ ${prefix}autotimer off`);
};
