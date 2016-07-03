const DefaultMap = require('./defaultmap');


/**
 * @typedef {{name: string,
 *            cost: string,
 *            expansion: string,
 *            tags: !Array<string>,
 *            text: string}}
 */
let CardJson;


/** Contains relevant options. */
class Options {
  constructor() {
    this.expansions = undefined;
  }
}


/** Full list of cards, with behavior. */
class Cards {
  /** @param {!Array<!CardJson>} data */
  constructor(data) {
    /** @const {!Map<string, !CardJson>} */
    this.cards = new Map();
    /** @const {!DefaultMap<string, !Set<string>>} */
    this.expansions = new DefaultMap(() => new Set());
    /** @const {!DefaultMap<string, !Set<string>>} */
    this.tags = new DefaultMap(() => new Set());
    /** @const {!Array<string>} */
    this.names = [];

    for (const card of data) {
      this.add(card);
    }
  }

  /** @param {!CardJson} card */
  add(card) {
    const {name, cost, expansion, tags, text} = card;
    this.cards.set(name, card);
    this.expansions.get(expansion).add(name);
    tags.forEach(tag => this.tags.get(tag).add(name));
    this.names.push(name);
  }

  /**
   * @return {!Array<!CardJson>}
   */
  shuffle() {
    // For now, just uses a very basic strategy: totally random.
    const /** Map<string, !CardJson> */ used = new Map();
    const allCards = [...this.names];
    for (let i = 0; i < 10; i++) {
      if (allCards.length < 0) {
        throw new Error('Out of cards to choose from.');
      }
      const index = Math.floor(allCards.length * Math.random());
      const name = allCards[index];
      used.set(name, this.cards.get(name));
      if (name == 'Young Witch') i--; 
      allCards.splice(index, 1);
    }
    return [...used.values()];
  }

  /**
   * @param {!Array<!CardJson>}
   * @return {!Array<!CardJson>}
   */
  step(selection) {
    selection = [...selection];
    // Consider randomly adding/removing events and let constFunc handle that?
    const i = Math.floor(Math.random() * selection.length);
    if (selection[i].name == 'Young Witch') {
      selection.splice(i, 1); // just remove young witch, don't replace
      return selection;
    }
    const j = Math.floor(Math.random() * this.names.length);
    const proposal = this.names[j];
    if (selection.some(c => c.name == proposal)) return selection; // already in
    if (proposal == 'Young Witch') {
      // note: bane must cost <4... constraint to enfoce?!?
      selection.unshift(this.cards.get(proposal));
    } else {
      selection[i] = this.cards.get(proposal);
    }
    return selection;
  }
}

module.exports = Cards;
