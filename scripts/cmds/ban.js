const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "ban",
		version: "2.0",
		author: "S1FU",
		countDown: 5,
		role: 1,
		shortDescription: { en: "𝖻𝖺𝗇 𝗎𝗌𝖾𝗋𝗌 𝖿𝗋𝗈𝗆 𝗍𝗁𝖾 𝖼𝗁𝖺𝗍" },
		category: "𝖻𝗈𝗑 𝖼𝗁𝖺𝗍",
		guide: {
			en: "『 {pn} [@𝗍𝖺𝗀|𝗎𝗂𝖽|𝗋𝖾𝗉𝗅𝗒] 』\n『 {pn} 𝗎𝗇𝖻𝖺𝗇 [@𝗍𝖺𝗀|𝗎𝗂𝖽] 』\n『 {pn} 𝗅𝗂𝗌𝗍 』"
		}
	},

	onStart: async function ({ message, event, args, threadsData, usersData, api }) {
		const { threadID, messageID, senderID, mentions, messageReply } = event;
		const { members, adminIDs } = await threadsData.get(threadID);
		const dataBanned = await threadsData.get(threadID, 'data.banned_ban', []);

		// --- 𝖴𝗇𝖻𝖺𝗇 𝖫𝗈𝗀𝗂𝖼 ---
		if (args[0] === 'unban') {
			let target;
			if (Object.keys(mentions).length) target = Object.keys(mentions)[0];
			else if (messageReply) target = messageReply.senderID;
			else if (!isNaN(args[1])) target = args[1];
			else if (args[1]?.startsWith('https')) target = await findUid(args[1]);

			if (!target) return message.reply("ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝗍𝖺𝗋𝗀𝖾𝗍 𝗍𝗈 𝗎𝗇𝖻𝖺𝗇 Ი𐑼");

			const index = dataBanned.findIndex(item => item.id == target);
			if (index === -1) return message.reply("ᯓ★ 𝗍𝗁𝗂𝗌 𝗎𝗌𝖾𝗋 𝗂𝗌 𝗇𝗈𝗍 𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 Ი𐑼");

			dataBanned.splice(index, 1);
			await threadsData.set(threadID, dataBanned, 'data.banned_ban');
			const name = await usersData.getName(target) || "𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄 𝖴𝗌𝖾𝗋";

			return message.reply(`╭── Ი𐑼 𖹭 𝗎𝗇𝖻𝖺𝗇𝗇𝖾𝖽 𖹭 Ი𐑼 ──╮\n\n  ᯓ★ 𝗎𝗌𝖾𝗋: ${name}\n  ⋆ 𝗌𝗍𝖺𝗍𝗎𝗌: 𝖺𝖼𝖼𝖾𝗌𝗌 𝗋𝖾𝗌𝗍𝗈𝗋𝖾𝖽\n\n╰── ᯓ★˙𐃷˙݁ ˖Ი𐑼⋆𖹭.ᐟ ──╯`);
		}

		// --- 𝖫𝗂𝗌𝗍 𝖫𝗈𝗀𝗂𝖼 ---
		if (args[0] === 'list') {
			if (!dataBanned.length) return message.reply("ᯓ★ 𝗇𝗈 𝖻𝖺𝗇𝗇𝖾𝖽 𝗆𝖾𝗆𝖻𝖾𝗋𝗌 𝖿𝗈𝗎𝗇𝖽 Ი𐑼");
			let msg = `╭── Ი𐑼 𖹭 𝖻𝖺𝗇 𝗅𝗂𝗌𝗍 𖹭 Ი𐑼 ──╮\n\n`;
			for (let i = 0; i < dataBanned.length; i++) {
				const name = await usersData.getName(dataBanned[i].id) || "𝖴𝗇𝗄𝗇𝗈𝗐𝗇";
				msg += `  ${i + 1}. ${name}\n  𝗎𝗂𝖽: ${dataBanned[i].id}\n\n`;
			}
			msg += `╰── ᯓ★˙𐃷˙݁ ˖Ი𐑼⋆𖹭.ᐟ ──╯`;
			return message.reply(msg);
		}

		// --- 𝖡𝖺𝗇 𝖫𝗈𝗀𝗂𝖼 ---
		let target, reason;
		if (messageReply) {
			target = messageReply.senderID;
			reason = args.join(' ');
		} else if (Object.keys(mentions).length) {
			target = Object.keys(mentions)[0];
			reason = args.join(' ').replace(mentions[target], '').trim();
		} else if (!isNaN(args[0])) {
			target = args[0];
			reason = args.slice(1).join(' ');
		}

		if (!target) return message.reply("ᯓ★ 𝗍𝖺𝗀 𝗈𝗋 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝗌𝗈𝗆𝖾𝗈𝗇𝖾 𝗍𝗈 𝖻𝖺𝗇 Ი𐑼");
		if (target == senderID) return message.reply("ᯓ★ 𝗒𝗈𝗎 𝖼𝖺𝗇𝗇𝗈𝗍 𝖻𝖺𝗇 𝗒𝗈𝗎𝗋𝗌𝖾𝗅𝗒 Ი𐑼");
		if (adminIDs.includes(target)) return message.reply("ᯓ★ 𝖼𝖺𝗇𝗇𝗈𝗍 𝖻𝖺𝗇 𝖺𝖽𝗆𝗂𝗇𝗂𝗌𝗍𝗋𝖺𝗍𝗈𝗋𝗌 Ი𐑼");
		if (dataBanned.some(i => i.id == target)) return message.reply("ᯓ★ 𝗎𝗌𝖾𝗋 𝗂𝗌 𝖺𝗅𝗋𝖾𝖺𝖽𝗒 𝖻𝖺𝗇𝗇𝖾𝖽 Ი𐑼");

		const name = await usersData.getName(target) || "𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄 𝖴𝗌𝖾𝗋";
		const time = moment().tz("Asia/Dhaka").format('HH:mm:ss DD/MM/YYYY');
		
		dataBanned.push({ id: target, time, reason: reason || "𝗇𝗈 𝗋𝖾𝖺𝗌𝗈𝗇" });
		await threadsData.set(threadID, dataBanned, 'data.banned_ban');

		const successBody = `╭── Ი𐑼 𖹭 𝗎𝗌𝖾𝗋 𝖻𝖺𝗇𝗇𝖾𝖽 𖹭 Ი𐑼 ──╮\n\n  ᯓ★ 𝗇𝖺𝗆𝖾: ${name}\n  ⋆ 𝗋𝖾𝖺𝗌𝗈𝗇: ${reason || "𝗇𝗈 𝗋𝖾𝖺𝗌𝗈𝗇"}\n  ⋆ 𝗍𝗂𝗆𝖾: ${time}\n\n╰── ᯓ★˙𐃷˙݁ ˖Ი𐑼⋆𖹭.ᐟ ──╯`;
		
		message.reply(successBody, () => {
			if (adminIDs.includes(api.getCurrentUserID())) {
				api.removeUserFromGroup(target, threadID);
			} else {
				message.send("ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝗆𝖺𝗄𝖾 𝗆𝖾 𝖺𝖽𝗆𝗂𝗇 𝗍𝗈 𝗄𝗂𝖼𝗄 𝗍𝗁𝖾𝗆 Ი𐑼");
			}
		});
	},

	onEvent: async function ({ event, api, threadsData, message }) {
		if (event.logMessageType === "log:subscribe") {
			const dataBanned = await threadsData.get(event.threadID, 'data.banned_ban', []);
			const added = event.logMessageData.addedParticipants;

			for (const user of added) {
				const banned = dataBanned.find(i => i.id == user.userFbId);
				if (banned) {
					api.removeUserFromGroup(user.userFbId, event.threadID, (err) => {
						if (!err) message.send(`╭── Ი𐑼 𖹭 𝖺𝗎𝗍𝗈 𝗄𝗂𝖼𝗄 𖹭 Ი𐑼 ──╮\n\n  ᯓ★ ${user.fullName} 𝗂𝗌 𝖻𝖺𝗇𝗇𝖾𝖽\n  ⋆ 𝗎𝗂𝖽: ${user.userFbId}\n  ⋆ 𝗋𝖾𝖺𝗌𝗈𝗇: ${banned.reason}\n\n╰── ᯓ★˙𐃷˙݁ ˖Ი𐑼⋆𖹭.ᐟ ──╯`);
					});
				}
			}
		}
	}
};