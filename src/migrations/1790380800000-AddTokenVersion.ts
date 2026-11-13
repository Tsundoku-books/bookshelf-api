import { MigrationInterface, QueryRunner } from 'typeorm';

/** Bumped when the password changes; tokens carrying an older number stop working. */
export class AddTokenVersion1790380800000 implements MigrationInterface {
  name = 'AddTokenVersion1790380800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" integer NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "token_version"`);
  }
}
