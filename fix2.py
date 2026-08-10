import re

def fix_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# careers/[id]/page.tsx
fix_file('admin/app/(dashboard)/careers/[id]/page.tsx', [
    (r"\}, \[params\.id, router, toast\]\);", "}, [params.id, router, toast, isAdmin, user?.id]);")
])

# careers/page.tsx
fix_file('admin/app/(dashboard)/careers/page.tsx', [
    (r"\} catch \(error\) \{", "} catch {"),
    (r"\[isAdmin, user\?\.id, toast\]\)", "[isAdmin, toast]")
])

# dashboard/page.tsx
fix_file('admin/app/(dashboard)/dashboard/page.tsx', [
    (r"const \{ user \} = useAuth\(\);", "const { user: _user } = useAuth();"),
    (r"Welcome back, it's", "Welcome back, it&apos;s"),
    (r"const \{ user: _user \} = useAuth\(\);", "const { hasRole } = useAuth(); // removed user") # Better to just not destructure it if unused. Wait, the regex might be tricky. Let's just do:
])
# Let's override dashboard/page.tsx
with open('admin/app/(dashboard)/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("const { user, hasRole } = useAuth();", "const { hasRole } = useAuth();")
c = c.replace("const { user: _user, hasRole } = useAuth();", "const { hasRole } = useAuth();")
c = c.replace("Welcome back, it's", "Welcome back, it&apos;s")
with open('admin/app/(dashboard)/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

# posts/[id]/page.tsx
fix_file('admin/app/(dashboard)/posts/[id]/page.tsx', [
    (r"const \{ imageUrl: _ignored, \.\.\.data \} = form;", "const { imageUrl, ...data } = form;\n      void imageUrl;")
])

# posts/new/page.tsx
fix_file('admin/app/(dashboard)/posts/new/page.tsx', [
    (r"const \{ imageUrl: _ignored, image, status, \.\.\.data \} = form;", "const { imageUrl, image, status, ...data } = form;\n      void imageUrl;")
])

# products/[id]/page.tsx
fix_file('admin/app/(dashboard)/products/[id]/page.tsx', [
    (r"const \{ imageUrl: _ignored, \.\.\.data \} = form;", "const { imageUrl, ...data } = form;\n      void imageUrl;"),
    (r"\} catch \(error: any\) \{", "} catch (error) {\n      const err = error as { response?: { data?: { message?: string } }, message?: string };"),
    (r"error\.response\?", "err.response?"),
    (r"error\.message", "err.message"),
    (r"<img src=", "{/* eslint-disable-next-line @next/next/no-img-element */}\n                  <img src=")
])

# products/new/page.tsx
fix_file('admin/app/(dashboard)/products/new/page.tsx', [
    (r"const \{ imageUrl: _ignored, image, status, \.\.\.data \} = form;", "const { imageUrl, image, status, ...data } = form;\n      void imageUrl;"),
    (r"<img src=", "{/* eslint-disable-next-line @next/next/no-img-element */}\n                  <img src=")
])

# services/[id]/page.tsx
fix_file('admin/app/(dashboard)/services/[id]/page.tsx', [
    (r"const \{ imageUrl: _ignored, \.\.\.data \} = form;", "const { imageUrl, ...data } = form;\n      void imageUrl;")
])

# services/new/page.tsx
fix_file('admin/app/(dashboard)/services/new/page.tsx', [
    (r"const \{ imageUrl: _ignored, image, status, \.\.\.data \} = form;", "const { imageUrl, image, status, ...data } = form;\n      void imageUrl;")
])

print("Fixed second batch.")
