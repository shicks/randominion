CARDS=src/dominion/cards.txt

# NOTE: may need to export NODE_PATH=/usr/local/lib/node_modules

src/dominion/card_list.js: src/dominion/build_card_list.js $(CARDS)
	src/dominion/build_card_list.js -o $@ \
	    --output_wrapper 'module.exports = %s;' \
	    -- $(CARDS)
