import { ActivityType, PresenceData, PresenceUpdateStatus } from "discord.js";
import { ConnectOptions } from "mongoose";

export default {
  client: {
    token: "MTU1OTk3OTEwMzAyNzcyNDI4OA.GaHjxv.T0dMEvXw0rVHhVmvDauF_lT_8ElrCatsKpGlR0",
    clientId: "1559979103027724288",
    clientSecret: "1Kw21z-TJhEZw27wa8ozdz6_Of8omwqx",
    guildId: "1256379736461017189",
    logChannelId: "1441229619792576585",
    botName: "Jeremy",
    owners: ["412021966996897827"],
    presence: {
      activities: [
        {
          name: "/help",
          type: ActivityType.Playing,
        },
      ],
      status: PresenceUpdateStatus.Idle,
    } as PresenceData,
    development: true,
    description: "",
  },
  commands: {
    prefix: "",
    message_commands: false,
    application_commands: {
      chat_input: true,
    },
  },
  database: {
    uri: "",
    options: {
      retryWrites: true,
      w: "majority",
      appName: "",
      dbName: "",
    } as ConnectOptions,
    connect: false,
  },
  channels: {
    announcements: "1450527872446894132",
  },
  roles: {
    coding_club: "1560039205202301008",
  },
  color: {
    main: 0x00ff00,
    error: 0xff0000,
  },
  links: {
    invite: "https://discord.gg/xzE8z3fpu",
    support: "<@412021966996897827>",
  },
  webhooks: {
    cmdlogs: "",
    guildlogs: "",
    errorlogs: "",
  },
  emojis: {
    main: "🔹",
    success: "✅",
    error: "❌",
    warn: "⚠️",
    slash: "➡️",
    plus: "➕",
    link: "🔗",
    paginator: {
      first: "⏮️",
      previous: "◀️",
      next: "▶️",
      last: "⏭️",
    },
  },
};
