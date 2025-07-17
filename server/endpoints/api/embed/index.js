const { EmbedConfig } = require("../../../models/embedConfig");
const { EmbedChats } = require("../../../models/embedChats");
const { validApiKey } = require("../../../utils/middleware/validApiKey");
const { reqBody } = require("../../../utils/http");
const { Workspace } = require("../../../models/workspace");

function apiEmbedEndpoints(app) {
  if (!app) return;

  app.get("/v1/embed", [validApiKey], async (request, response) => {
  
    try {
      const embeds = await EmbedConfig.whereWithWorkspace();
      const filteredEmbeds = embeds.map((embed) => ({
        id: embed.id,
        uuid: embed.uuid,
        enabled: embed.enabled,
        chat_mode: embed.chat_mode,
        createdAt: embed.createdAt,
        workspace: {
          id: embed.workspace.id,
          name: embed.workspace.name,
        },
        chat_count: embed._count.embed_chats,
      }));
      response.status(200).json({ embeds: filteredEmbeds });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get(
    "/v1/embed/:embedUuid/chats",
    [validApiKey],
    async (request, response) => {
     
      try {
        const { embedUuid } = request.params;
        const chats = await EmbedChats.where({
          embed_config: { uuid: String(embedUuid) },
        });
        response.status(200).json({ chats });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/v1/embed/:embedUuid/chats/:sessionUuid",
    [validApiKey],
    async (request, response) => {
      
      try {
        const { embedUuid, sessionUuid } = request.params;
        const chats = await EmbedChats.where({
          embed_config: { uuid: String(embedUuid) },
          session_id: String(sessionUuid),
        });
        response.status(200).json({ chats });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post("/v1/embed/new", [validApiKey], async (request, response) => {
 
    try {
      const data = reqBody(request);

      if (!data.workspace_slug)
        return response
          .status(400)
          .json({ error: "Workspace slug is required" });
      const workspace = await Workspace.get({
        slug: String(data.workspace_slug),
      });

      if (!workspace)
        return response.status(404).json({ error: "Workspace not found" });

      const { embed, message: error } = await EmbedConfig.new({
        ...data,
        workspace_id: workspace.id,
      });

      response.status(200).json({ embed, error });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.post("/v1/embed/:embedUuid", [validApiKey], async (request, response) => {
   
    try {
      const { embedUuid } = request.params;
      const data = reqBody(request);

      const embed = await EmbedConfig.get({ uuid: String(embedUuid) });
      if (!embed) {
        return response.status(404).json({ error: "Embed not found" });
      }

      const { success, error } = await EmbedConfig.update(embed.id, data);
      response.status(200).json({ success, error });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.delete(
    "/v1/embed/:embedUuid",
    [validApiKey],
    async (request, response) => {
  
      try {
        const { embedUuid } = request.params;
        const embed = await EmbedConfig.get({ uuid: String(embedUuid) });
        if (!embed)
          return response.status(404).json({ error: "Embed not found" });
        const success = await EmbedConfig.delete({ id: embed.id });
        response
          .status(200)
          .json({ success, error: success ? null : "Failed to delete embed" });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = { apiEmbedEndpoints };
