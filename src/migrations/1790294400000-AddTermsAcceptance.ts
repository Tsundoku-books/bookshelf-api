import { MigrationInterface, QueryRunner } from 'typeorm';

/** Both columns stay NULL for accounts created before the terms existed: they never accepted them. */
export class AddTermsAcceptance1790294400000 implements MigrationInterface {
  name = 'AddTermsAcceptance1790294400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "terms_version" character varying(20)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "terms_accepted_at",
      DROP COLUMN IF EXISTS "terms_version"
    `);
  }
}
