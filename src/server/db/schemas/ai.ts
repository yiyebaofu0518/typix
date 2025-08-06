import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { generateId, metaFields } from "../util";

// AI Provider table
export const aiProviders = sqliteTable("ai_providers", {
	id: text().$defaultFn(generateId).primaryKey(),
	providerId: text().notNull().unique(), // Unique identifier for the AI provider
	userId: text().notNull(), // User ID who owns the provider
	enabled: integer({ mode: "boolean" }).default(true).notNull(), // Whether the provider is enabled
	settings: text({ mode: "json" }), // Provider-specific settings as JSON
	...metaFields,
});

// AI Models table
export const aiModels = sqliteTable(
	"ai_models",
	{
		id: text().$defaultFn(generateId).primaryKey(),
		providerId: text()
			.references(() => aiProviders.id, { onDelete: "cascade" })
			.notNull(), // Reference to the AI provider
		modelId: text().notNull(), // Unique identifier for the model within the provider
		enabled: integer({ mode: "boolean" }).default(true).notNull(), // Whether the model is enabled
		userId: text().notNull(), // User ID who owns the model
		...metaFields,
	},
	(t) => [unique().on(t.providerId, t.modelId)],
);

// Relations
export const aiProviderRelations = relations(aiProviders, ({ many }) => ({
	aiModels: many(aiModels),
}));
export const aiModelRelations = relations(aiModels, ({ one }) => ({
	aiProvider: one(aiProviders, {
		fields: [aiModels.providerId],
		references: [aiProviders.id],
	}),
}));
