import type { ExtendedClient } from "../structures/index";
import type { BotPlugin } from "./index";
import config from "../config";
import AnnouncementState from "../database/schemas/AnnouncementState";

let lastSentDate = "";
type AnnouncementCase = "c1" | "h1";

async function loadState() {
    try {
        const state = await AnnouncementState.findOneAndUpdate(
            { key: "global" },
            {},
            { upsert: true, new: true }
        );
        lastSentDate = state.lastSentDate ?? "";
    } catch (err) {
        // interval will never be set up if this throws — log loudly
        console.error("[AnnouncementPlugin] Failed to load state from DB:", err);
        throw err;
    }
}

async function sendAnnouncement(client: ExtendedClient, message: string) {
    try {
        const channel = await client.channels.fetch(config.channels.announcements);
        if (channel?.isSendable()) {
            client.logger.debug("[AnnouncementFunc] Sending announcement");
            await channel.send({
                content: message,
                allowedMentions: { parse: ["everyone", "roles"] }
            });
            const sentDate = new Date().toDateString();
            try {
                await AnnouncementState.findOneAndUpdate(
                    { key: "global" },
                    { lastSentDate: sentDate }
                );
            } catch (dbErr) {
                client.logger.error(`[AnnouncementFunc] Failed to persist lastSentDate: ${dbErr}`, client);
            }
            lastSentDate = sentDate;
        } else {
            client.logger.error(`Invalid channel ${config.channels.announcements}`, client);
        }
    } catch (err) { client.logger.error(err, client) }
}

const cases: Record<AnnouncementCase, (client: ExtendedClient) => Promise<void>> = {
    "c1": async (client) => {
        await sendAnnouncement(client, `<@&${config.roles.coding_club}> We have a Coding Club meeting today. Feel free to join us!`);
    },
    "h1": async (client) => {
        await sendAnnouncement(client, `@everyone Comp Sci Honor Society meeting today. Come join us!`);
    },
};

function getWednesdaysInMonth(year: number, month: number): Date[] {
    const wednesdays: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getDay() !== 3) date.setDate(date.getDate() + 1);
    while (date.getMonth() === month) {
        wednesdays.push(new Date(date));
        date.setDate(date.getDate() + 7);
    }
    return wednesdays;
}

function checkBuiltInCase(date: Date, blacklist: Map<string, string> | undefined): AnnouncementCase | undefined {
    if (date.getDay() !== 3) return undefined;

    const wednesdays = getWednesdaysInMonth(date.getFullYear(), date.getMonth());
    const h1Candidate = wednesdays.find(w => !blacklist?.get(w.toDateString()));

    if (h1Candidate?.toDateString() === date.toDateString()) return "h1";
    return "c1";
}

const announcePlugin: BotPlugin = {
    name: "Announcements",
    version: "1.0.0",
    author: "love-buggedd",
    initialize: (client: ExtendedClient) => {
        client.on("ready", async () => {
            await loadState();

            setInterval(async () => {
                const now = new Date();
                client.logger.debug(`[AnnouncementTick] ${now.toString()}`);

                if (now.getHours() !== 9 || lastSentDate === now.toDateString()) return;

                try {
                    const dateKey = now.toDateString();
                    const state = await AnnouncementState.findOne({ key: "global" });

                    if (!state) {
                        client.logger.error("[AnnouncementTick] Failed to fetch state from DB", client);
                        return;
                    }

                    if (state.blacklistAnnounceDates?.get(dateKey)) {
                        client.logger.debug(`[AnnouncementTick] ${dateKey} is blacklisted, skipping`);
                        return;
                    }

                    const custom = state.whitelistAnnouncements?.get(dateKey);
                    if (custom) {
                        const roleStr = custom.role ? `<@&${custom.role}> ` : "@everyone ";
                        await sendAnnouncement(client, `${roleStr}${custom.message}`);
                        return;
                    }

                    const announcementCase = checkBuiltInCase(now, state.blacklistAnnounceDates);
                    if (announcementCase) await cases[announcementCase](client);
                } catch (err) {
                    client.logger.error(`[AnnouncementTick] Unhandled error: ${err}`, client);
                }
            }, 60_000);
        });
    },
};

export default announcePlugin;