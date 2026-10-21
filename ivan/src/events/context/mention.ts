import { ChannelType, type Message } from "discord.js";
import { Event, type ExtendedClient } from "../../structures/index";
import { limited } from "../../functions/Ratelimiter";
import { llmChat, type ChatContext } from "../../functions/LLMService";

const MAX_THINKING_LENGTH = 200;

export default class Mention extends Event {
  constructor(client: ExtendedClient, file: string) {
    super(client, file, {
      name: "mention",
    });
  }

  public async run(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!this.client.user) return;
    if (message.channel.type !== ChannelType.GuildText) return;
    if (limited(message.author.id)) return;

    const isMention = message.mentions.users.has(this.client.user!.id);
    const userMessage = message.content.replaceAll(this.client.user!.toString(), "").trim();

    let context: ChatContext[] = [];
    if (!isMention) {
      const history = await message.channel.messages.fetch({ limit: 10, before: message.id });
      context = [...history.values()]
        .reverse()
        .filter((m) => !m.author.bot && m.content.trim().length > 0)
        .map((m) => ({ username: m.author.username, content: m.content }));
    }

    try {
      const { reply, thinking } = await llmChat(userMessage, context);
      const truncatedThinking = thinking && thinking.length > MAX_THINKING_LENGTH
        ? thinking.slice(0, MAX_THINKING_LENGTH) + "..."
        : thinking;
      const content = truncatedThinking ? `-# ${truncatedThinking}\n${reply}` : reply;
      await message.reply(content);
    } catch (err: any) {
      this.client.logger.error(`LLM fetch failed: ${err?.cause ?? err}`, this.client);
    }
  }
}
