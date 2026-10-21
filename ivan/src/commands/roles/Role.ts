import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { Command, type Context, type ExtendedClient } from "../../structures/index";
import { llmChat } from "../../functions/LLMService";
import UniqueRoleCache from "../../database/schemas/UniqueRoleCache";

function parseRoleId(arg: string): string {
  const match = arg.match(/^<@&(\d+)>$/);
  return match ? match[1] : arg;
}

function parseHex(color: string): number | null {
  const hex = color.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return parseInt(hex, 16);
}

export default class Role extends Command {
  constructor(client: ExtendedClient) {
    super(client, {
      name: "role",
      description: {
        content: "Manage your unique roles.",
        examples: [
          "role name <role> <new name>",
          "role color <role> <#hex>",
        ],
        usage: "role <name|color> <role> <value>",
      },
      category: "roles",
      aliases: [],
      cooldown: 5,
      args: true,
      slashCommand: true,
      options: [
        {
          name: "name",
          description: "Rename your unique role.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "role",
              description: "The unique role to rename.",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "new_name",
              description: "The new name for the role.",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "color",
          description: "Change your unique role color.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "role",
              description: "The unique role to recolor.",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "hex",
              description: "New hex color (e.g. #ff0000).",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
      ],
      permissions: {
        dev: false,
        client: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks", "ManageRoles"],
        user: [],
      },
    });
  }

  public async run(_client: ExtendedClient, ctx: Context, args: string[]): Promise<any> {
    if (ctx.isInteraction) await ctx.sendDeferMessage("");

    const member = ctx.guild.members.cache.get(ctx.author!.id) as GuildMember;
    if (!member) return ctx.isInteraction ? ctx.errorEditReply("Could not find your member data.") : ctx.errorReply("Could not find your member data.");

    const err = (msg: string) => ctx.isInteraction ? ctx.errorEditReply(msg) : ctx.errorReply(msg);

    const cache = await UniqueRoleCache.findOne({ userId: ctx.author!.id, guildId: ctx.guild.id });
    if (!cache) return err("Your unique roles aren't cached yet. Run `/myroles` first.");

    const subcommand = ctx.isInteraction
      ? ctx.options.getSubCommand()
      : args[0];

    switch (subcommand) {
      case "name": {
        const roleId = ctx.isInteraction
          ? (ctx.interaction?.options.get("role", true)?.value as string)
          : parseRoleId(args[1]);
        const newName = ctx.isInteraction
          ? (ctx.interaction?.options.get("new_name", true)?.value as string)
          : args.slice(2).join(" ");

        if (!roleId || !newName) return err("Usage: `role name <role> <new name>`");

        const role = ctx.guild.roles.cache.get(roleId);
        if (!role) return err("Role not found.");
        if (!cache.roleIds.includes(role.id)) return err("That is not one of your unique roles. Run `/myroles` to refresh.");

        const oldName = role.name;
        await role.setName(newName);

        const { reply } = await llmChat(
          `You just renamed ${ctx.author!.username}'s unique role from "${oldName}" to "${newName}". React briefly in character.`
        );
        return ctx.isInteraction ? ctx.editMessage(reply) : ctx.sendMessage(reply);
      }

      case "color": {
        const roleId = ctx.isInteraction
          ? (ctx.interaction?.options.get("role", true)?.value as string)
          : parseRoleId(args[1]);
        const hexInput = ctx.isInteraction
          ? (ctx.interaction?.options.get("hex", true)?.value as string)
          : args[2];

        if (!roleId || !hexInput) return err("Usage: `role color <role> <#hex>`");

        const role = ctx.guild.roles.cache.get(roleId);
        if (!role) return err("Role not found.");
        if (!cache.roleIds.includes(role.id)) return err("That is not one of your unique roles. Run `/myroles` to refresh.");

        const color = parseHex(hexInput);
        if (color === null) return err("Invalid hex color. Use format `#ff0000`.");

        await role.setColor(color);

        const { reply } = await llmChat(
          `You just changed ${ctx.author!.username}'s unique role "${role.name}" color to ${hexInput}. React briefly in character.`
        );
        return ctx.isInteraction ? ctx.editMessage(reply) : ctx.sendMessage(reply);
      }

      default:
        return err("Usage: `role <name|color> <role> <value>`");
    }
  }
}
