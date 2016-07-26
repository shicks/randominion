CARDS=src/dominion/cards.txt

CARD_LIST=src/dominion/card_list.js

# TODO(sdh): do a glob+subst on **/*.less
STYLE_MODULE=src/app-main/app-main-style.html

BUILD_CARD_LIST=src/build/build_card_list.js
BUILD_STYLE_MODULE=src/build/build_style_module.js

BUILD_CARD_LIST_DEPS=$(BUILD_CARD_LIST) src/build/common.js
BUILD_STYLE_MODULE_DEPS=$(BUILD_STYLE_MODULE) src/build/common.js

# NOTE: may need to export NODE_PATH=/usr/local/lib/node_modules

.PHONY: all

all: $(CARD_LIST) $(STYLE_MODULE)

$(CARD_LIST): $(BUILD_CARD_LIST_DEPS) $(CARDS)
	$(BUILD_CARD_LIST) -o $@ \
	    --output-wrapper 'module.exports = %s;' \
	    -- $(CARDS)

# TODO(sdh): use a pattern rule here.
$(STYLE_MODULE): src/app-main/app-main.less $(BUILD_STYLE_MODULE_DEPS)
	$(BUILD_STYLE_MODULE) -o $@ --embed-source-map -- $<
