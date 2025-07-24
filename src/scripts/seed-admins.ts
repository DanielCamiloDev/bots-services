import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { AppDataSource } from '../data-source';
import 'dotenv/config'

const passwordAdmin = process.env.passwordAdmin || 'AdminPass123!';
const passwordSuperAdmin = process.env.passwordSuperAdmin || 'SuperAdminPass456!';

if (!passwordAdmin || !passwordSuperAdmin) {
  throw new Error('Faltan las variables de entorno passwordAdmin o passwordSuperAdmin');
}

async function ensureUser(dataSource: DataSource, username: string, password: string, roles: UserRole[]) {
  const userRepo = dataSource.getRepository(User);
  const exists = await userRepo.findOne({ where: { username } });
  if (!exists) {
    const hash = await bcrypt.hash(password, 10);
    await userRepo.save({
      username,
      passwordHash: hash,
      roles,
    });
    console.log(`Usuario "${username}" creado con roles [${roles.join(',')}]`);
  } else {
    console.log(`Usuario "${username}" ya existe, saltando.`);
  }
}

async function run() {
  // Inicializa el DataSource (igual que en tu AppModule)
  const dataSource = await AppDataSource.initialize();

  await ensureUser(dataSource, 'admin', passwordAdmin, [UserRole.ADMIN]);
  await ensureUser(dataSource, 'superadmin', passwordSuperAdmin, [UserRole.ADMIN, UserRole.SADMIN, UserRole.VIEWER]);

  await dataSource.destroy();
}

run().catch(err => {
  console.error('Error en seed-admins:', err);
  process.exit(1);
});