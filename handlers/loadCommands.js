const fs = require("fs");
const path = require("path");

function loadCommands(client, dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadCommands(client, fullPath);
    } else if (entry.name.endsWith(".js")) {
      const command = require(fullPath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Command geladen: ${command.data.name}`);
      }
    }
  }
}

module.exports = loadCommands;
