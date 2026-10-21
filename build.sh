#!/bin/sh
# Copia os arquivos publicados do site para public/ (usado pelo build da Vercel)
set -e
mkdir -p public
cp index.html sobre-nos.html gatifique-se.html cat-sitter-ou-hotel-para-gatos.html 404.html \
   robots.txt sitemap.xml llms.txt \
   logo-avatar.png logo-avatar.webp favicon.png apple-touch-icon.png og-image.png public/
cp -r css js images public/
