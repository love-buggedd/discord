import { ActivityType, PresenceData, PresenceUpdateStatus } from "discord.js";
import { ConnectOptions } from "mongoose";

const token = process.env.TOKEN;
if (!token) throw new Error("TOKEN is missing from .env");

const clientSecret = process.env.SECRET;
if (!clientSecret) throw new Error("SECRET is missing from .env");

export default {
  client: {
    token,
    clientId: "1559979103027724288",
    clientSecret,
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
