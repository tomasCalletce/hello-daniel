import { pgTable, serial, integer, timestamp, text, uniqueIndex, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const counters = pgTable("counters", {
	id: serial().primaryKey().notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	type: text().notNull(),
	payload: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const signers = pgTable("signers", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	city: text().notNull(),
	role: text().notNull(),
	wantsInvite: boolean("wants_invite").default(false).notNull(),
	verified: boolean().default(false).notNull(),
	refCode: text("ref_code").notNull(),
	refBy: text("ref_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("ref_code_idx").using("btree", table.refCode.asc().nullsLast().op("text_ops")),
	unique("signers_email_unique").on(table.email),
	unique("signers_ref_code_unique").on(table.refCode),
]);

export const referrals = pgTable("referrals", {
	id: serial().primaryKey().notNull(),
	refCode: text("ref_code").notNull(),
	name: text().notNull(),
	email: text(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("referrals_ref_code_idx").using("btree", table.refCode.asc().nullsLast().op("text_ops")),
	unique("referrals_ref_code_unique").on(table.refCode),
]);
