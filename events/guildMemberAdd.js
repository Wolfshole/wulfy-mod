const { Events } = require("discord.js");
const db = require("../database/db");
const onJoin = require("../modules/welcome/onJoin");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // 1. Welcome-Modul ausführen
    await onJoin(member, db);

    // 2. Log speichern
    await db.execute(
      "INSERT INTO logs (guild_id, action, target_id, details) VALUES (?, ?, ?, ?)",
      [
        member.guild.id,
        "MEMBER_JOIN",
        member.id,
        `${member.user.tag} ist beigetreten.`,
      ],
    );
  },
};
