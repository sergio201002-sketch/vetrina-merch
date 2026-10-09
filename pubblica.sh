#!/bin/bash
# pubblica il sito: nuova versione (i browser riscaricano solo i file cambiati), commit e push
cd "$(dirname "$0")"
date +%s > versione.txt
git add -A
git commit -qm "$1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -c http.postBuffer=524288000 push -q 2>&1 | tail -2
