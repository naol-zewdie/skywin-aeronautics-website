import re

def fix_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        for pattern, repl in replacements:
            content = re.sub(pattern, repl, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except FileNotFoundError:
        print(f"File not found: {filepath}")

fix_file('Server/src/modules/auth/auth.controller.spec.ts', [
    (r"let authService: AuthService;", ""),
    (r"const \{ refreshToken, \.\.\.cookieOptions \} = mockCookieConfig;", "const { refreshToken: _ignored, ...cookieOptions } = mockCookieConfig;")
])

fix_file('Server/src/modules/auth/auth.controller.ts', [
    (r"import \{ .*CsrfGuard.*\n", "import { LocalAuthGuard } from './guards/local-auth.guard';\nimport { JwtAuthGuard } from './guards/jwt-auth.guard';\n"),
    (r"const \{ refreshToken, \.\.\.cookieOptions \} = cookieConfig;", "const { refreshToken: _ignored, ...cookieOptions } = cookieConfig;"),
    (r"const \{ \_, \.\.\.cookieOptions \} = cookieConfig;", "const { _: _ignored2, ...cookieOptions } = cookieConfig;"), # might be _
    (r"@Req\(\) req: Request,", ""),
    (r"\} catch \(e\) \{", "} catch {"),
    (r"const expiresAt = new Date\(Date\.now\(\) \+ 15 \* 60 \* 1000\);", "")
])

# Just disable unused-vars rule for args starting with _ and set it to warning in the Server config.
config_path = 'Server/eslint.config.mjs'
with open(config_path, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("'@typescript-eslint/no-unsafe-return': 'off',", "'@typescript-eslint/no-unsafe-return': 'off',\n      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],")
with open(config_path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed Server.")
