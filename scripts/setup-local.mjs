import { copyFileSync, existsSync, constants } from 'node:fs';

const root = new URL('../', import.meta.url);
const target = new URL('.env', root);
const example = new URL('.env.example', root);

if (!existsSync(target) && existsSync(example)) {
  copyFileSync(example, target, constants.COPYFILE_EXCL);
  console.log('Configuração pública local criada em .env.');
}

console.log('Lunari: execute npm run dev para abrir o aplicativo.');