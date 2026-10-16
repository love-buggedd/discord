import { ApplicationCommandOptionType } from "discord.js";
import AnnouncementState from "../../database/schemas/AnnouncementState";
import {
    Command,
    type Context,
    type ExtendedClient,
} from "../../structures/index";

function parseDiscordTimestamp(input: string): Date | null {
    const match = /<t:(\d+)(?::[a-zA-Z])?>/.exec(input);
    if (!match) return null;
    return new Date(parseInt(match[1]) * 1000);
}

export default class ManageDates extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            name: "manage-dates",
            description: {
                content: "Exclude meetings that won't happen for the bot's announcements.",
                examples: ["manageDates @time blacklist"],
                usage: "manageDates",
            },
            category: "information",
            aliases: ["config-dates"],
            cooldown: 10,
            permissions: {
                dev: false,
                client: [
                    "SendMessages",
                    "ReadMessageHistory",
                    "ViewChannel",
                    "EmbedLinks",
                ],
                user: ["Administrator"],
            },
            slashCommand: true,
            options: [
                {
                    name: "blacklist",
                    description: "Prevent the bot from announcing this date",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "time",
                            description: "A Discord time reference, e.g. <t:1234567890:F>",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        }
                    ],
                },
                {
                    name: "whitelist",
                    description: "Adds an announcement to the bot's schedule",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "time",
                            description: "A Discord time reference, e.g. <t:1234567890:F>",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: "message",
                            description: "The message that you want the announcement to have",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: "role",
                            description: "Which role do you want to mention in the announcement",
                            type: ApplicationCommandOptionType.Role,
                            required: false,
                        },
                    ],
                },
            ],
        });
    }

    public async run(_client: ExtendedClient, ctx: Context): Promise<any> {
        const subCommand = ctx.options.getSubCommand();
        const timeString = ctx.options.get("time")?.value as string;

        const date = parseDiscordTimestamp(timeString);
        if (!date) return ctx.errorReply("Please provide a valid Discord time reference like `<t:1234567890:F>`.");
        const dateKey = date.toDateString();

        switch (subCommand) {
            case "blacklist": {
                await AnnouncementState.findOneAndUpdate(
                    { key: "global" },
                    { $set: { [`blacklistAnnounceDates.${dateKey}`]: ctx.author?.id } },
                    { upsert: true }
                );
                return ctx.sendMessage({ content: `Blacklisted announcements for **${dateKey}**.`, ephemeral: true });
            }
            case "whitelist": {
                const message = ctx.options.get("message")?.value as string | undefined;
                const role = ctx.options.getRole("role", false);

                await AnnouncementState.findOneAndUpdate(
                    { key: "global" },
                    { $set: { [`whitelistAnnouncements.${dateKey}`]: { message: message ?? null, role: role?.id ?? null } } },
                    { upsert: true }
                );
                return ctx.sendMessage({ content: `Added custom announcement for **${dateKey}**.`, ephemeral: true });
            }
        }
    }
}