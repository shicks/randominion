const ImmutableList = require('./immutablelist');
const Rule = require('./rule');

const CLIP = 1e-20;

function scale(factor, weight) {
  factor = 1 + (factor - 1) * weight;
  if (factor < CLIP) {
    if (factor == -Infinity) return 0; // (special case in case weight == 0)
    factor = Math.pow(CLIP, 1 + CLIP - factor);
  }
  return factor;
}

/** @record @template T */
class Rate {
  /** @return {function(T): number} */
  get func() {}
  /** @return {number} */
  get weight() {}
}

/** @template T */
class Dealer {
  /** @param {!Iterable<T>} cards
      @param {!Iterable<!Rule<T>>} rules */
  constructor(cards, rules) {
    /** @private @const {!Array<T>} */
    this.cards_ = new ImmutableList(cards);
    /** @private @const {!Array<!Rule<T>>} */
    this.rules_ = new ImmutableList(rules);
  }

  /**
   * @return {!Iterator<T>}
   */
  * deal() {
    const selection = [];
    while (true) {
      // Evaluate all the rules.
      const selectionCopy = new ImmutableList(selection);
      const rates =
          this.rules_.map(
              (rule) => [rule.apply(this.cards_, selectionCopy), rule.weight]);
      // Build up a sorted list of rates...
      const table = [];
      let sum = 0;
      for (const card of this.cards_) {
        const rate =
            rates.map(([func, weight]) => scale(func(card), weight))
                .reduce((a, b) => a * b, 1);
        if (rate > 0) {
          sum += rate;
          table.push([sum, card]);
        }
      }
      // We're done if there's nothing to pick from
      if (!table.length) return;
      // Pick a random number less than sum, find the card
      const pick = Math.random() * sum;
      let a = -1, b = table.length - 1;
      while (b - a > 1) {
        const m = Math.floor((a + b) / 2);
        pick > table[m][0] ? a = m : b = m;
      }
      yield table[b][1];
      selection.push(table[b][1]);
    }
  }
}

module.exports = Dealer;
