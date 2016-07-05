const Multiset = require('./multiset');
const Rule = require('./rule');


/**
 * Ensures that there are the given number of expansions present.
 * @extends {Rule<!Card>}
 */
class LimitExpansions extends Rule {

  constructor(minimum = 2, maximum = 2, balance = 0, weight = 1) {
    super(weight);
    this.minimum_ = minimum;
    this.maximum_ = maximum;
    // TODO(sdh): separate balance for min and max?
    this.balance_ = balance;
    // TODO - exempt expansions?  without knowing how many we're dealing,
    // it's hard to say "allow ≤k cards outside this limit", unless they
    // come first - but this will also be a problem for "if 1 potion then
    // at least 3 potions" types of rules.  Unless we have a "validate"
    // method that can veto certain cards from a set?  That could get
    // difficult, though...  - we could have the veto return a tag that
    // will be passed to future calls to Rule.apply so that it knows
    // what happened???
  }

  apply(cards, selection) {
    const allExpansions = new Multiset(cards.map(card => card.expansion));
    const balance =
        (expansion) =>
            1 / (1 + this.balance_ * (allExpansions.count(expansion) - 1));
    const expansions = new Set(selection.map(card => card.expansion));
    if (expansions.size < this.minimum_) {
      return ({expansion}) =>
          expansions.has(expansion) ? 0 : balance(expansion);
    } else if (expansions.size >= this.maximum_) {
      return ({expansion}) =>
          expansions.has(expansion) ? balance(expansion) : 0;
    }
    return ({exp}) => balance(exp);
  }
}
exports.LimitExpansions = LimitExpansions;


class SelectionSize extends Rule {
  constructor(size = 10, weight = 1) {
    super(weight);
    this.size_ = size;
  }

  apply(cards, selection) {
    return selection.size() >= this.size_ ? () => -Infinity : () => 1;
  }
}
exports.SelectionSize = SelectionSize;


// LimitExpansions.FACTORY = LimitExpansions.factory(
//     'LimitExpansions',
//     'Limits the number of expansions used.')
//     .number('Minimum Count', 'Minimum number of expansions.')
//     .number('Maximum Count', 'Maximum number of expansions.')
//     .number('Exempt Count', 'Number of cards allowed from other expansions.')
//     .number('Weight', 'Weight of this rule.');

// LimitExpansions.FACTORY = new Rule.Factory(
//     LimitExpansions,
//     'LimitExpansions',
//     'Limits the number of expansions used.'
//     [
      
