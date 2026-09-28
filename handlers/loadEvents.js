const fs = require("fs");
const path = require("path");

function loadEvents(client, dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));
  for (const file of files) {
    const event = require(path.join(dir, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`✅ Event geladen: ${event.name}`);
  }
}

module.exports = loadEvents;
