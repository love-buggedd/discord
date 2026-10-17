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
    description: "An bot made by the Comp Sci Honor Society, more specifically by <@412021966996897827>. A multi-purpose simple bot used for reminders, fun, and more. Source code can be found on [GitHub](https://github.com/love-buggedd/discord).",
  },
  commands: {
    prefix: ">",
    message_commands: true,
    application_commands: {
      chat_input: true,
    },
  },
  database: {
    uri: process.env.MONGODB_URI ?? "",
    options: {
      retryWrites: true,
      w: "majority",
      appName: "school-bot",
      dbName: "discord",
    } as ConnectOptions,
    connect: true,
  },
  channels: {
    announcements: "1549871698835152997",
  },
  roles: {
    coding_club: "1549871237394866236",
  },
  color: {
    main: 0xfbf236,
    error: 0xff0000,
  },
  links: {
    invite: "https://discord.gg/vYAWAtQNWZ",
    support: "https://discord.com/users/412021966996897827",
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