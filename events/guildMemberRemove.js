const { Events } = require("discord.js");
const db = require("../database/db");
const onLeave = require("../modules/welcome/onLeave");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    // 1. Leave-Modul ausführen
    await onLeave(member, db);

    // 2. Log speichern
    await db.execute(
      "INSERT INTO logs (guild_id, action, target_id, details) VALUES (?, ?, ?, ?)",
      [
        member.guild.id,
        "MEMBER_LEAVE",
        member.id,
        `${member.user.tag} hat den Server verlassen.`,
      ],
    );
  },
};
