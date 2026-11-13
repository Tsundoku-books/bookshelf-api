import { MigrationInterface, QueryRunner } from 'typeorm';

/** Ids of the playground bugs each user switched on for their own account. */
export class AddEnabledBugs1790467200000 implements MigrationInterface {
  name = 'AddEnabledBugs1790467200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enabled_bugs" text[] NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "enabled_bugs"`);
  }
}
