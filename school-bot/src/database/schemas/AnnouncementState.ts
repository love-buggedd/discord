import { Schema, SchemaTypes, model } from "mongoose";

export default model(
    "AnnouncementState",
    new Schema({
        key: {
            type: SchemaTypes.String,
            required: true,
            unique: true,
        },
        lastSentDate: {
            type: SchemaTypes.String,
            default: "",
        },
        blacklistAnnounceDates: {
            type: SchemaTypes.Map,
            of: SchemaTypes.String,
            default: {},
        },
        whitelistAnnouncements: {
            type: SchemaTypes.Map,
            of: new Schema({
                message: { type: SchemaTypes.String },
                role: { type: SchemaTypes.String }, // role ID
            }),
            default: {},
        },
    })
);