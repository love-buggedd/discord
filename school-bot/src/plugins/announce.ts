import type { ExtendedClient } from "../structures/index";
import type { BotPlugin } from "./index";
import config from "../config";

type AnnouncementCase = "c1" | "h1";
async function sendAnnouncement(client: ExtendedClient, message: string) {
    try {
        const channel = await client.channels.fetch(config.channels.announcements);
        if (channel?.isSendable()) {
            client.logger.debug("AnnouncementFunc: Sending announcement");
            await channel.send({
                content: message,
                allowedMentions: { parse: ["everyone", "roles"] }
            })
            lastSentDate = new Date().toDateString();
        } else {
            client.logger.error(`Invalid channel ${config.channels.announcements}`, client);
        }
    } catch (err) { client.logger.error(err, client) }
}

const cases: Record<AnnouncementCase, (client: ExtendedClient) => void> = {
    "c1": async (client) => {
        await sendAnnouncement(client, `<@&${config.roles.coding_club}> We have a Coding Club meeting today. Feel free to join us!`);
    },
    "h1": async (client) => {
        await sendAnnouncement(client, `@everyone Comp Sci Honor Society meeting today. Come join us!`);
    },
};

let lastSentDate = "";

function checkValidity(date: Date): AnnouncementCase | undefined {
    const weekday = date.getDay();
    const monthDay = date.getDate();

    const wednesday = weekday === 3;
    const monthDayIsValid = monthDay <= 7 && monthDay >= 1;

    if (date.getHours() === 9 && lastSentDate !== date.toDateString()) {
        if (wednesday) {
            if (monthDayIsValid) {
                return "h1";
            }
            return "c1";
        }
    }

    return undefined;
};

const announcePlugin: BotPlugin = {
    name: "Announcements",
    version: "1.0.0",
    author: "love-buggedd",
    initialize: (client: ExtendedClient) => {
        client.on("ready", () => {
            setInterval(() => {
                const now = new Date();
                client.logger.debug(`AnnouncementTick: ${now.toString()}`);
                
                const announcementCase = checkValidity(now);
                if (announcementCase) {
                    cases[announcementCase](client);
                }
            }, 60_000);
        });
    },
};

export default announcePlugin;