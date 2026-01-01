import sys
try:
    from pypdf import PdfReader
except ImportError:
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        print("No PDF library found (pypdf or PyPDF2).")
        sys.exit(1)

reader = PdfReader("/Users/jclou/jclouhome/创新创业相关/黑客松/IntuitionX/gemini/spec/飞书文档草稿.pdf")
for page in reader.pages:
    print(page.extract_text())
