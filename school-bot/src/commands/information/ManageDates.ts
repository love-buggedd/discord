import { ApplicationCommandOptionType } from "discord.js";
import AnnouncementState from "../../database/schemas/AnnouncementState";
import {
    Command,
    type Context,
    type ExtendedClient,
} from "../../structures/index";
import { paginator } from "../../functions/Paginator";

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
                        },
                        {
                            name: "inverse",
                            description: "Inverts the action, removing the blacklisted item",
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
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
                            required: false,
                        },
                        {
                            name: "role",
                            description: "Which role do you want to mention in the announcement",
                            type: ApplicationCommandOptionType.Role,
                            required: false,
                        },
                        {
                            name: "inverse",
                            description: "Inverts the action, removing the custom announcement",
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        },
                    ],
                },
                {
                    name: "list",
                    description: "Lists out all the blacklist and whitelist items",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [],
                },
            ],
        });
    }

    public async run(_client: ExtendedClient, ctx: Context): Promise<any> {
        const subCommand = ctx.options.getSubCommand();

        switch (subCommand) {
            case "blacklist": {
                const timeString = ctx.options.get("time")?.value as string;
                const date = parseDiscordTimestamp(timeString);
                if (!date) return ctx.errorReply("Please provide a valid Discord time reference like `<t:1234567890:F>`.");
                const dateKey = date.toDateString();

                const inverse = ctx.options.get("inverse", false)?.value as boolean | undefined;

                if (inverse) {
                    const state = await AnnouncementState.findOne({ key: "global" });
                    if (!state?.blacklistAnnounceDates?.get(dateKey))
                        return ctx.errorReply(`**${dateKey}** is not in the blacklist.`);

                    await AnnouncementState.findOneAndUpdate(
                        { key: "global" },
                        { $unset: { [`blacklistAnnounceDates.${dateKey}`]: "" } }
                    );
                    return ctx.sendMessage({ content: `Removed **${dateKey}** from the blacklist.`, ephemeral: true });
                }

                await AnnouncementState.findOneAndUpdate(
                    { key: "global" },
                    { $set: { [`blacklistAnnounceDates.${dateKey}`]: ctx.author?.id } },
                    { upsert: true }
                );
                return ctx.sendMessage({ content: `Blacklisted announcements for **${dateKey}**.`, ephemeral: true });
            }
            case "whitelist": {
                const timeString = ctx.options.get("time")?.value as string;
                const date = parseDiscordTimestamp(timeString);
                if (!date) return ctx.errorReply("Please provide a valid Discord time reference like `<t:1234567890:F>`.");
                const dateKey = date.toDateString();

                const inverse = ctx.options.get("inverse", false)?.value as boolean | undefined;
                const message = ctx.options.get("message", false)?.value as string | undefined;
                const role = ctx.options.getRole("role", false);

                if (inverse) {
                    const state = await AnnouncementState.findOne({ key: "global" });
                    if (!state?.whitelistAnnouncements?.get(dateKey))
                        return ctx.errorReply(`There is no custom announcement for **${dateKey}**.`);

                    await AnnouncementState.findOneAndUpdate(
                        { key: "global" },
                        { $unset: { [`whitelistAnnouncements.${dateKey}`]: "" } }
                    );
                    return ctx.sendMessage({ content: `Removed custom announcement for **${dateKey}**.`, ephemeral: true });
                }

                if (!message) return ctx.errorReply("A message is required when adding a custom announcement.");

                await AnnouncementState.findOneAndUpdate(
                    { key: "global" },
                    { $set: { [`whitelistAnnouncements.${dateKey}`]: { message, role: role?.id ?? null } } },
                    { upsert: true }
                );
                return ctx.sendMessage({ content: `Added custom announcement for **${dateKey}**.`, ephemeral: true });
            }
            case "list": {
                const state = await AnnouncementState.findOne({ key: "global" });

                const blacklisted = [...(state?.blacklistAnnounceDates?.entries() ?? [])];
                const whitelisted = [...(state?.whitelistAnnouncements?.entries() ?? [])];

                const entries: string[] = [
                    ...blacklisted.map(([date, managerId]) =>
                        `🚫 **${date}** | blacklisted by <@${managerId}>`
                    ),
                    ...whitelisted.map(([date, entry]) => {
                        const roleStr = entry.role ? `<@&${entry.role}>` : "@everyone";
                        return `📢 **${date}** | ${roleStr}: ${entry.message}`;
                    }),
                ];

                if (entries.length === 0)
                    return ctx.sendMessage({ content: "No blacklisted dates or custom announcements.", ephemeral: true });

                const totalPages = Math.ceil(entries.length / 5);
                const pages = [];
                for (let i = 0; i < entries.length; i += 5) {
                    pages.push(
                        ctx.client.embed()
                            .author({ name: "Announcement Schedule", iconURL: ctx.client.user?.displayAvatarURL() })
                            .desc(entries.slice(i, i + 5).join("\n"))
                            .footer({ text: `Page ${Math.floor(i / 5) + 1} of ${totalPages} • Requested by ${ctx.author?.username}` })
                    );
                }

                return paginator(ctx, pages);
            }
        }
    }
}