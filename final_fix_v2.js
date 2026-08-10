const fs = require('fs');

let dashboard = fs.readFileSync('admin/app/(dashboard)/dashboard/page.tsx', 'utf8');
dashboard = dashboard.replace("Welcome back, it's", "Welcome back, it&apos;s");
fs.writeFileSync('admin/app/(dashboard)/dashboard/page.tsx', dashboard);

let auth = fs.readFileSync('Server/src/modules/auth/auth.service.spec.ts', 'utf8');
auth = auth.replace("require('crypto').randomBytes", "require('crypto').randomBytes // eslint-disable-line @typescript-eslint/no-require-imports");
fs.writeFileSync('Server/src/modules/auth/auth.service.spec.ts', auth);

let interceptor = fs.readFileSync('Server/src/common/interceptors/logging.interceptor.ts', 'utf8');
if (!interceptor.includes('eslint-disable-next-line no-control-regex')) {
    interceptor = interceptor.replace('const cleanBody = JSON.stringify(body).replace(', '// eslint-disable-next-line no-control-regex\n      const cleanBody = JSON.stringify(body).replace(');
    fs.writeFileSync('Server/src/common/interceptors/logging.interceptor.ts', interceptor);
}

let servicesPage = fs.readFileSync('admin/app/(dashboard)/services/new/page.tsx', 'utf8');
servicesPage = servicesPage.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any\n\s*const serviceData = \{ \.\.\.data \} as any;/, 'const serviceData = { ...data } as any;');
fs.writeFileSync('admin/app/(dashboard)/services/new/page.tsx', servicesPage);

console.log("All fixed!");
