import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "../db/index.js";
import { certificates, users, courses } from "../db/schema.js";

export class CertificateService {
  /**
   * Generates a new certificate or returns an existing one for the user-course combination
   */
  static async issueCertificate(userId: string, courseId: string) {
    // Check if it already exists
    const existing = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create a new certificate ID (using a short hex string for prettier URLs)
    const id = crypto.randomBytes(6).toString("hex");

    const [cert] = await db
      .insert(certificates)
      .values({
        id,
        userId,
        courseId,
      })
      .returning();

    return cert;
  }

  /**
   * Retrieves a certificate by its ID along with user and course info
   */
  static async getCertificateDetails(certId: string) {
    const result = await db
      .select({
        id: certificates.id,
        issuedAt: certificates.issuedAt,
        user: {
          name: users.name,
        },
        course: {
          title: courses.title,
          level: courses.level,
        },
      })
      .from(certificates)
      .innerJoin(users, eq(certificates.userId, users.id))
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .where(eq(certificates.id, certId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }
}
