#!/bin/sh
# Copia os arquivos publicados do site para public/ (usado pelo build da Vercel)
set -e
mkdir -p public
cp index.html sobre-nos.html gatifique-se.html cat-sitting-ou-hotel-para-gatos.html 404.html \
   robots.txt sitemap.xml llms.txt \
   logo-avatar.png logo-avatar.webp favicon.png apple-touch-icon.png og-image.png public/
cp -r css js images public/

# Versiona CSS e JS pelo conteúdo (?v=hash) para o cache de 1 dia nunca servir arquivo antigo
for asset in css/style.css js/main.js js/ebook.js; do
  v=$(md5sum "$asset" | cut -c1-8)
  pattern=$(printf '%s' "$asset" | sed 's/\./\\./g')
  sed -i -E "s#(href|src)=\"(/?)${pattern}(\?v=[^\"]*)?\"#\1=\"\2${asset}?v=${v}\"#g" public/*.html
done
