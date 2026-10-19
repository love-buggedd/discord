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
    guildId: "1450527871272747041",
    logChannelId: "1459438604173443164",
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
    development: false,
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
    announcements: "1450527872446894132",
  },
  roles: {
    coding_club: "1560852790581137549",
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