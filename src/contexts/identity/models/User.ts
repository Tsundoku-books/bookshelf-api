import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DEFAULT_ROLES, Role } from '../../../shared/roles';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    // An array, not a function: TypeORM renders it as '{reader}' for enum arrays.
    default: DEFAULT_ROLES,
  })
  roles!: Role[];

  /** A suspended account cannot sign in. Changed by admins only. */
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  // Never selected by default; queries that need it must opt in explicitly.
  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  /** Part of every token; bumped when the password changes so the other sessions end. */
  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion!: number;

  @Column({ name: 'terms_accepted_at', type: 'timestamp', nullable: true })
  termsAcceptedAt!: Date | null;

  @Column({ name: 'terms_version', type: 'varchar', length: 20, nullable: true })
  termsVersion!: string | null;

  @OneToMany('Book', 'user')
  books!: unknown[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
