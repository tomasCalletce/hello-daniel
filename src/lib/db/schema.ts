import { pgTable, serial, text, boolean, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const signers = pgTable('signers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  city: text('city').notNull(),
  role: text('role').notNull(),
  wantsInvite: boolean('wants_invite').default(false).notNull(),
  verified: boolean('verified').default(false).notNull(),
  refCode: text('ref_code').notNull().unique(),
  refBy: text('ref_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('email_idx').on(table.email),
  refCodeIdx: uniqueIndex('ref_code_idx').on(table.refCode),
}))

export const counters = pgTable('counters', {
  id: serial('id').primaryKey(),
  total: integer('total').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  payload: text('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  refCode: text('ref_code').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  refCodeIdx: uniqueIndex('referrals_ref_code_idx').on(table.refCode),
}))

export type Signer = typeof signers.$inferSelect
export type NewSigner = typeof signers.$inferInsert
export type Counter = typeof counters.$inferSelect
export type Event = typeof events.$inferSelect
export type Referral = typeof referrals.$inferSelect
export type NewReferral = typeof referrals.$inferInsert