$venv = Join-Path $PSScriptRoot "venv\Scripts\Activate.ps1"
. $venv
python manage.py runserver
