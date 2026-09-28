const db = require("./db");

async function setupDatabase() {
  const tables = [
    // Users
    `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            discord_id VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(255),
            coins INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

    // Guild-Settings (generisch für alle Module)
    `CREATE TABLE IF NOT EXISTS guild_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            guild_id VARCHAR(255) NOT NULL,
            module_name VARCHAR(50) NOT NULL,
            settings_json JSON NOT NULL,
            enabled BOOLEAN DEFAULT FALSE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_guild_module (guild_id, module_name)
        )`,

    // Warns
    `CREATE TABLE IF NOT EXISTS warns (
            id INT AUTO_INCREMENT PRIMARY KEY,
            guild_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            moderator_id VARCHAR(255) NOT NULL,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

    // Logs (für alle Modul-Aktionen)
    `CREATE TABLE IF NOT EXISTS logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            guild_id VARCHAR(255) NOT NULL,
            action VARCHAR(50) NOT NULL,
            target_id VARCHAR(255),
            moderator_id VARCHAR(255),
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

    // Tickets
    `CREATE TABLE IF NOT EXISTS tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            guild_id VARCHAR(255) NOT NULL,
            channel_id VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            status VARCHAR(20) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            closed_at TIMESTAMP NULL
        )`,

    // Büro-Warteraum (Settings)
    `CREATE TABLE IF NOT EXISTS office_settings (
            guild_id VARCHAR(255) PRIMARY KEY,
            enabled BOOLEAN DEFAULT FALSE,
            waiting_channel_id VARCHAR(255),
            office_category_ids TEXT,
            response_time INT DEFAULT 5,
            show_occupants BOOLEAN DEFAULT FALSE
        )`,

    // Sprach-Support
    `CREATE TABLE IF NOT EXISTS voice_support_settings (
            guild_id VARCHAR(255) PRIMARY KEY,
            enabled BOOLEAN DEFAULT FALSE,
            waiting_room_id VARCHAR(255),
            support_category_id VARCHAR(255),
            waiting_music_url TEXT,
            notify_channel_id VARCHAR(255),
            notify_role_id VARCHAR(255)
        )`,

    // Teams
    `CREATE TABLE IF NOT EXISTS teams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            guild_id VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            role_id VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

    // Clubs
    `CREATE TABLE IF NOT EXISTS clubs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            guild_id VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            owner_id VARCHAR(255) NOT NULL,
            role_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
  ];

  for (const sql of tables) {
    try {
      await db.execute(sql);
    } catch (err) {
      console.error("❌ Fehler beim Erstellen einer Tabelle:", err.message);
    }
  }

  console.log("✅ Datenbank-Setup abgeschlossen.");
}

module.exports = setupDatabase;
