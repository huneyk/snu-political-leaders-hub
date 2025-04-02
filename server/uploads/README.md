# 업로드 디렉토리 (Uploads Directory)

이 디렉토리는 서울대학교 정치리더십과정 웹사이트에 업로드된 파일들을 저장하는 곳입니다.

## 저장되는 파일 종류
- 입학지원서 (Word 파일, .docx)
- 입학지원서 (한글 파일, .hwp) 
- 과정안내서 (PDF 파일, .pdf)

## 주의사항
- 이 디렉토리는 서버 재시작 시에도 파일이 유지되어야 합니다.
- 업로드된 파일들은 MongoDB footers 컬렉션에 URL로 저장됩니다.
- 이 README.md 파일은 git에서 디렉토리를 추적하기 위한 용도로 존재합니다.

---

This directory stores uploaded files for the SNU Political Leadership Program website.

## File types stored here
- Application forms (Word files, .docx)
- Application forms (HWP files, .hwp)
- Program guides (PDF files, .pdf)

## Notes
- Files in this directory should persist across server restarts.
- Uploaded file URLs are stored in the MongoDB footers collection.
- This README.md exists to track the directory in git. 