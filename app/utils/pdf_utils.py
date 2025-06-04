import PyPDF2
from io import BytesIO


def extract_text_from_pdf(file_content):
    """
    从 PDF 文件中提取文本内容
    :param file_content: PDF 文件的二进制内容
    :return: 提取的文本内容
    """
    try:
        pdf_file = BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"PDF 文本提取失败: {str(e)}")
        return None 