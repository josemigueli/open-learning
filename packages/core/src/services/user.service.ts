import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

type NewUser = typeof users.$inferInsert;
type UserConfig = Partial<Pick<NewUser, "preferredLevel">>;

export class UserService {
  static async getUser(telegramId: string) {
    const result = await db.select().from(users).where(eq(users.telegramId, telegramId)).get();
    return result;
  }

  static async createUser(telegramId: string, name: string) {
    const id = crypto.randomUUID();
    const newUser = {
      id,
      telegramId,
      name,
    };

    const result = await db.insert(users).values(newUser).returning().get();
    return result;
  }

  static async getOrCreateUser(telegramId: string, name: string) {
    const existing = await this.getUser(telegramId);
    if (existing) return existing;
    return this.createUser(telegramId, name);
  }

  static async updateConfig(telegramId: string, config: UserConfig) {
    const result = await db
      .update(users)
      .set(config)
      .where(eq(users.telegramId, telegramId))
      .returning()
      .get();

    return result;
  }
}
