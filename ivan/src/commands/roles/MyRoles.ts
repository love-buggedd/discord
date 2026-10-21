import { Command, type Context, type ExtendedClient } from "../../structures/index";
import { paginator } from "../../functions/Paginator";
import { llmChat } from "../../functions/LLMService";
import UniqueRoleCache from "../../database/schemas/UniqueRoleCache";

export default class MyRoles extends Command {
  constructor(client: ExtendedClient) {
    super(client, {
      name: "myroles",
      description: {
        content: "View your unique roles in this server.",
        examples: ["myroles"],
        usage: "myroles",
      },
      category: "roles",
      aliases: ["uniqueroles"],
      cooldown: 5,
      slashCommand: true,
      options: [],
      permissions: {
        dev: false,
        client: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        user: [],
      },
    });
  }

  public async run(client: ExtendedClient, ctx: Context): Promise<any> {
    await ctx.guild.members.fetch();

    const member = ctx.guild.members.cache.get(ctx.author!.id);
    if (!member) return ctx.errorReply("Could not find your member data.");

    const uniqueRoles = [...member.roles.cache.values()].filter(
      (role) => role.id !== ctx.guild.id && role.members.size === 1
    );

    await UniqueRoleCache.findOneAndUpdate(
      { userId: ctx.author!.id, guildId: ctx.guild.id },
      { roleIds: uniqueRoles.map((r) => r.id), updatedAt: new Date() },
      { upsert: true }
    );

    if (uniqueRoles.length === 0) {
      return ctx.sendMessage({
        embeds: [client.embed().desc(`${client.emoji.warn} You have no unique roles.`)],
      });
    }

    const pages = [];
    for (let i = 0; i < uniqueRoles.length; i += 5) {
      const chunk = uniqueRoles.slice(i, i + 5);
      const embed = client
        .embed()
        .author({
          name: `${ctx.author!.username}'s Unique Roles`,
          iconURL: ctx.author!.displayAvatarURL(),
        })
        .desc(chunk.map((r, idx) => `${client.emoji.main} ${i + idx + 1}. ${r} \`${r.name}\``).join("\n"))
        .footer({ text: `${uniqueRoles.length} unique role(s) total` });
      pages.push(embed);
    }

    const llmPromise = llmChat(
      `You just showed ${ctx.author!.username} their ${uniqueRoles.length} unique role(s): ${uniqueRoles.map((r) => r.name).join(", ")}. React briefly in character.`
    );

    await paginator(ctx, pages);

    const { reply } = await llmPromise;
    await ctx.sendFollowUp(reply);
  }
}
