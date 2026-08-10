import re
import sys
import os

def fix_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# products/[id]/page.tsx
fix_file('admin/app/(dashboard)/products/[id]/page.tsx', [
    (r"const \[selectedFile, setSelectedFile\] = useState<File \| null>\(null\);\n", ""),
    (r"\s+setSelectedFile\(file\);\n", "\n"),
    (r"\s+setSelectedFile\(null\);\n", "\n"),
    (r"const { imageUrl, \.\.\.data } = form;", "const { imageUrl: _ignored, ...data } = form;"),
    (r"}, \[params\.id, router, toast\]\);", "}, [params.id, router, toast, isAdmin, user?.id]);")
])

# products/new/page.tsx
fix_file('admin/app/(dashboard)/products/new/page.tsx', [
    (r"const \[selectedFile, setSelectedFile\] = useState<File \| null>\(null\);\n", ""),
    (r"\s+setSelectedFile\(file\);\n", "\n"),
    (r"\s+setSelectedFile\(null\);\n", "\n"),
    (r"const { imageUrl, image, status, \.\.\.data } = form;", "const { imageUrl: _ignored, image, status, ...data } = form;")
])

# careers/page.tsx
fix_file('admin/app/(dashboard)/careers/page.tsx', [
    (r"import { useEffect, useState } from 'react';", "import { useEffect, useState, useCallback } from 'react';"),
    (r"const fetchCareers = async \(\) => {", "const fetchCareers = useCallback(async () => {"),
    (r"setIsLoading\(false\);\n    }\n  };", "setIsLoading(false);\n    }\n  }, [isAdmin, user?.id, toast]);"),
    (r"useEffect\(\(\) => \{\n    fetchCareers\(\);\n  \}, \[\]\);", "useEffect(() => {\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    fetchCareers();\n  }, [fetchCareers]);"),
    (r"} catch \(error: any\) {\n      toast", "} catch {\n      toast"),
    (r"} catch \(error\) {\n      toast\(\{ title: 'Error', description: `Failed to export", "} catch {\n      toast({ title: 'Error', description: `Failed to export")
])

# dashboard/page.tsx
fix_file('admin/app/(dashboard)/dashboard/page.tsx', [
    (r"const { user } = useAuth\(\);", "const { user: _user } = useAuth();"),
    (r"Welcome back, it's", "Welcome back, it&apos;s")
])

# posts/[id]/page.tsx
fix_file('admin/app/(dashboard)/posts/[id]/page.tsx', [
    (r"const \[selectedFile, setSelectedFile\] = useState<File \| null>\(null\);\n", ""),
    (r"\s+setSelectedFile\(file\);\n", "\n"),
    (r"\s+setSelectedFile\(null\);\n", "\n"),
    (r"const { imageUrl, \.\.\.data } = form;", "const { imageUrl: _ignored, ...data } = form;"),
    (r"}, \[params\.id, router, toast\]\);", "}, [params.id, router, toast, isAdmin, user?.id]);")
])

# posts/new/page.tsx
fix_file('admin/app/(dashboard)/posts/new/page.tsx', [
    (r"const \[selectedFile, setSelectedFile\] = useState<File \| null>\(null\);\n", ""),
    (r"\s+setSelectedFile\(file\);\n", "\n"),
    (r"\s+setSelectedFile\(null\);\n", "\n"),
    (r"const { imageUrl, image, status, \.\.\.data } = form;", "const { imageUrl: _ignored, image, status, ...data } = form;")
])

# posts/page.tsx
fix_file('admin/app/(dashboard)/posts/page.tsx', [
    (r"import { Plus, Search, Download, FileText, Trash2, Edit, Eye } from 'lucide-react';", "import { Plus, Search, Download, FileText } from 'lucide-react';")
])

print("Fixed files.")
