const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./workspaceChat'); // make sure this file path is correct

app.post('/api/chat', async (req, res) => {
  const { workspace, message } = req.body;
  const sentBy = "user";

  // get agent response from existing system
  const agentResponse = await getAgentResponse(workspace, message); // update this based on actual function

  // Save to SQLite
  db.run(
    `INSERT INTO workspaceChat (ID, sent_by, workspace, prompt, response, sent_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [sentBy, workspace, message, agentResponse],
    function (err) {
      if (err) {
        console.error('❌ Error saving to SQLite:', err.message);
      } else {
        console.log(`✅ Chat log saved with ID ${this.lastID}`);
      }
    }
  );

  res.json({ response: agentResponse });
});
