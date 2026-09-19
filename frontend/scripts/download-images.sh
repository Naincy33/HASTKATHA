#!/bin/bash
set -e
mkdir -p public/images
curl -L 'https://commons.wikimedia.org/wiki/Special:FilePath/Bamboo_craft_work.jpg?width=1400' -o public/images/bamboo.jpg
curl -L 'https://commons.wikimedia.org/wiki/Special:FilePath/Bamboo_products_made_by_tribals.jpg?width=1000' -o public/images/bamboo-products.jpg
curl -L 'https://commons.wikimedia.org/wiki/Special:FilePath/Madhubani_art.jpg?width=1000' -o public/images/madhubani.jpg
curl -L 'https://commons.wikimedia.org/wiki/Special:FilePath/Dokra_from_tribes_of_Bastar_DSCN1172_01.jpg?width=1000' -o public/images/dhokra.jpg
echo 'Downloaded HASTKATHA visual assets.'
