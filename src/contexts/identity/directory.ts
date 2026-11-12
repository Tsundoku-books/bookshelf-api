import { In } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Company } from './models/Company';
import { User } from './models/User';

/** Read-only lookups other contexts use to show who is behind an id. */
export class IdentityDirectory {
  static async userNames(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const users = await AppDataSource.getRepository(User).find({ where: { id: In(ids) }, select: { id: true, name: true } });
    return new Map(users.map(user => [user.id, user.name]));
  }

  /** What the auth middleware needs on every request; null when the account no longer exists. */
  static async accountState(id: string): Promise<Pick<User, 'id' | 'roles' | 'status'> | null> {
    return AppDataSource.getRepository(User).findOne({ where: { id }, select: { id: true, roles: true, status: true } });
  }

  static async companyNames(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const companies = await AppDataSource.getRepository(Company).find({ where: { id: In(ids) } });
    return new Map(companies.map(company => [company.id, company.tradeName || company.legalName]));
  }
}
