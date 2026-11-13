/**
 * Comptes de l'espace admin Hostella.
 *
 *   npm run admin:create -- email@exemple.com Prénom Nom    → crée un admin (le 1er est SUPER ADMIN)
 *   npm run admin:reset  -- email@exemple.com               → nouveau mot de passe provisoire
 *
 * Le mot de passe provisoire s'affiche UNE SEULE FOIS et doit être changé à la première connexion.
 */
import 'dotenv/config';

import { prisma } from '../src/config/prisma';
import { generateTemporaryPassword, hashPassword } from '../src/lib/password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function show(title: string, email: string, password: string) {
  console.log(`\n✔ ${title}`);
  console.log(`  Email                   : ${email}`);
  console.log(`  Mot de passe provisoire : ${password}`);
  console.log('\n  ⚠ Notez-le maintenant : il ne sera plus affiché. À changer à la première connexion.\n');
}

async function create(args: string[]) {
  const isSuper = args.includes('--super');
  const [rawEmail, firstName, ...rest] = args.filter((a) => a !== '--super');
  const email = rawEmail?.trim().toLowerCase();
  const lastName = rest.join(' ');
  if (!email || !firstName || !lastName) fail('Usage : npm run admin:create -- email@exemple.com Prénom Nom');
  if (!EMAIL_RE.test(email)) fail('Email invalide');
  if (await prisma.admin.findUnique({ where: { email } })) fail('Un administrateur existe déjà avec cet email');
  const role = isSuper || (await prisma.admin.count()) === 0 ? 'SUPER_ADMIN' : 'ADMIN';
  const password = generateTemporaryPassword();
  const admin = await prisma.admin.create({ data: { email, firstName, lastName, role, passwordHash: await hashPassword(password) } });
  await prisma.adminAuditLog.create({ data: { action: 'ADMIN_CREATED', targetType: 'ADMIN', targetId: admin.id, targetLabel: `${firstName} ${lastName} (${email})`, metadata: { role, source: 'CLI' } } });
  show(`${role === 'SUPER_ADMIN' ? 'Super administrateur' : 'Administrateur'} créé : ${firstName} ${lastName}`, email, password);
}

async function reset(args: string[]) {
  const email = args[0]?.trim().toLowerCase();
  if (!email) fail('Usage : npm run admin:reset -- email@exemple.com');
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) fail(`Aucun administrateur avec l'email « ${email} »`);
  const password = generateTemporaryPassword();
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(password), mustChangePassword: true, isActive: true, sessionVersion: { increment: 1 } } });
  await prisma.adminAuditLog.create({ data: { action: 'ADMIN_PASSWORD_RESET', targetType: 'ADMIN', targetId: admin.id, targetLabel: `${admin.firstName} ${admin.lastName}`, metadata: { source: 'CLI' } } });
  show(`Mot de passe réinitialisé : ${admin.firstName} ${admin.lastName}`, email, password);
}

const [command, ...args] = process.argv.slice(2);
const run = command === 'create' ? create : command === 'reset' ? reset : null;
if (!run) fail('Commande inconnue. Utilisez admin:create ou admin:reset');
run(args).catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
