const fs = require("fs-extra");

module.exports = {
  config: {
    name: "noprefix",
    aliases: ["np", "prefixless", "nopref"],
    version: "4.2 • mobile",
    author: "乛 Xꫀᥒos ゎ",
    countDown: 4,
    role: 2,
    description: "Toggle no-prefix • mobile optimized UI",
    category: "system",
    usage: "{pn} [on|off|status|toggle]",
    cooldowns: 3
  },

  onStart: async function ({ message, args }) {
    const { config } = global.GoatBot;
    const prefix = global.GoatBot.config.prefix || "!";

    const mini   = "┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈";
    const line   = "╼───────╾";
    const glowOn = "✦₊ ᰔ";
    const glowOff= "ᶻ𝅙 .ᐟ";

    const ON  = "⦿ ON";
    const OFF = "◌ OFF";

    const statEmoji = (s) => s ? "🟢" : "🔴";
    const power     = (s) => s ? "⚡" : "⚠️";

    const current = !!config.noPrefix;
    const curStat = current ? ON : OFF;
    const curGlow = current ? glowOn : glowOff;
    const curEmo  = statEmoji(current);

    if (!args[0] || args[0].toLowerCase() === "status") {
      return message.reply(
        `✦  𝐍𝐎-𝐏𝐑𝐄𝐅𝐈𝐗  ✦\n` +
        `${mini}\n` +
        `${curEmo}  Mode   : ${curStat} ${curGlow}\n` +
        `${power(current)}  Cmds w/o ${prefix}  ${current ? "Allowed" : "Blocked"}\n` +
        `Prefix (if needed) → ${prefix}\n` +
        `${mini}\n` +
        `Use:\n` +
        `  • on     • off\n` +
        `  • toggle  • status\n` +
        `${mini}\n` +
        `乛 • ${new Date().toLocaleTimeString().slice(0,5)}`
      );
    }

    let target = current;
    const arg = args[0].toLowerCase();

    if (["on","enable","1","active"].includes(arg))      target = true;
    else if (["off","disable","0","inactive"].includes(arg)) target = false;
    else if (["toggle","switch","flip"].includes(arg))   target = !current;
    else {
      return message.reply(
        `✦ Invalid! ✦\n` +
        `${mini}\n` +
        `Use: on | off | toggle | status`
      );
    }

    if (target === current) {
      return message.reply(
        `${curEmo} Already ${curStat}\n` +
        `No change needed.`
      );
    }

    try {
      config.noPrefix = target;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      const newStat = target ? ON : OFF;
      const newGlow = target ? glowOn : glowOff;
      const newEmo  = statEmoji(target);

      return message.reply(
        `✦ CONFIG UPDATED ✦\n` +
        `${mini}\n` +
        `${newEmo}  No-Prefix → ${newStat} ${newGlow}\n` +
        `${target ? "Now free prefix!" : "Prefix required again"}\n` +
        `${mini}\n` +
        `      Success ✓   `
      );

    } catch (err) {
      return message.reply(
        `✦ ERROR ✦\n` +
        `${mini}\n` +
        `Config save failed\n` +
        err.message.slice(0,60) + (err.message.length > 60 ? "..." : "")
      );
    }
  }
};