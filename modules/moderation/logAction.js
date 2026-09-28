async function logAction(db, guildId, action, targetId, moderatorId, details) {
  try {
    await db.execute(
      "INSERT INTO logs (guild_id, action, target_id, moderator_id, details) VALUES (?, ?, ?, ?, ?)",
      [guildId, action, targetId, moderatorId, details],
    );
  } catch (err) {
    console.error("❌ Fehler beim Logging:", err.message);
  }
}

module.exports = logAction;
