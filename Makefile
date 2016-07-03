CARDS=cards.txt

# NOTE: may need to export NODE_PATH=/usr/local/lib/node_modules

card_list.js: build_card_list.js $(CARDS)
	./build_card_list.js -o $@ \
	    --output_wrapper 'module.exports = %s;' \
	    -- $(CARDS)
