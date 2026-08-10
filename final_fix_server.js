const fs = require('fs');

let auth = fs.readFileSync('Server/src/modules/auth/auth.service.spec.ts', 'utf8');
auth = auth.replace("require('crypto').randomBytes", "require('crypto').randomBytes // eslint-disable-line @typescript-eslint/no-require-imports");
fs.writeFileSync('Server/src/modules/auth/auth.service.spec.ts', auth);

let interceptor = fs.readFileSync('Server/src/common/interceptors/logging.interceptor.ts', 'utf8');
if (!interceptor.includes('eslint-disable-next-line no-control-regex')) {
    interceptor = interceptor.replace('const cleanBody = JSON.stringify(body).replace(', '// eslint-disable-next-line no-control-regex\n      const cleanBody = JSON.stringify(body).replace(');
    fs.writeFileSync('Server/src/common/interceptors/logging.interceptor.ts', interceptor);
}
console.log("Fixed");
