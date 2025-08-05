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

export type Signer = typeof signers.$inferSelect
export type NewSigner = typeof signers.$inferInsert
export type Counter = typeof counters.$inferSelect
export type Event = typeof events.$inferSelect