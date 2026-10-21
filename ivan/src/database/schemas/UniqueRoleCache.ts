import { Schema, SchemaTypes, model } from "mongoose";

export default model(
  "UniqueRoleCache",
  new Schema({
    userId: { type: SchemaTypes.String, required: true },
    guildId: { type: SchemaTypes.String, required: true },
    roleIds: { type: [SchemaTypes.String], default: [] },
    updatedAt: { type: SchemaTypes.Date, default: Date.now },
  })
);
