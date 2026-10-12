@echo off
echo Installing fpdf2...
pip install fpdf2

echo.
echo Generating test M^&A documents...
python "%~dp0generate_test_docs.py"

echo.
echo Done! Check the test-documents folder.
pause
