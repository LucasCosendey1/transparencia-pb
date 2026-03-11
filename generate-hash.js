const bcrypt = require('bcryptjs');

const password = '13738990429';
const hash = bcrypt.hashSync(password, 10);

console.log('Senha:', password);
console.log('Hash:', hash);
console.log('');
console.log('SQL:');
console.log(`DELETE FROM usuarios WHERE username = '13738990429';`);
console.log(`INSERT INTO usuarios (username, password_hash) VALUES ('13738990429', '${hash}');`);