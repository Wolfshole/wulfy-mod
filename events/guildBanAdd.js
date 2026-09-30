const { Events, AuditLogEvent } = require("discord.js");
const db = require("../database/db");
const logAction = require("../modules/moderation/logAction");

module.exports = {
  name: Events.GuildBanAdd,
  async execute(ban) {
    try {
      // Prüfen, wer den Ban ausgeführt hat
      const auditLogs = await ban.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberBanAdd,
        limit: 1,
      });

      const entry = auditLogs.entries.first();
      const moderator = entry?.executor ?? null;
      const reason = entry?.reason ?? ban.reason ?? "Kein Grund";

      await logAction(
        db,
        ban.guild.id,
        "BAN",
        ban.user.id,
        moderator?.id ?? "system",
        reason,
      );
    } catch (err) {
      console.error("❌ Ban-Log:", err.message);
    }
  },
};
