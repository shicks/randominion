const CARD_LIST = require('./card_list');
const Cards = require('./cards');
const DefaultMap = require('./defaultmap');

function lpad(str, size) {
  if (str.length < size) {
    str = str + ' '.repeat(size - str.length);
  }
  return str;
}



class Shuffle {
  constructor(cards) {
    this.cards_ = cards;
    const n = cards.names.length;
    this.amplitudes_ = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      this.amplitudes_[i] = Math.random();
    }
  }

  /** @return {!Array<!CardJson>} */
  shuffle() {
    // Find the highest amplitudes... what about events?
    const names = this.cards_.names;
    const map = this.cards_.cards;
    const n = names.length;
    const cards = new Array(n);
    for (let i = 0; i < n; i++) {
      map.get(names[i]).text = [];
      cards[i] = [this.amplitudes_[i], map.get(names[i])];
    }
    cards.sort((a, b) => a[0] - b[0]);

    //console.dir(cards);

    const result = [];
    let bane = false;
    while (cards.length) {
      const card = cards.shift()[1];
      result.push(card);
      if (card.tags.indexOf('Bane') >= 0) bane = true;
      if (result.length >= 10) break;
    }
    if (bane) {
      while (cards.length) {
        const card = cards.shift()[1];
        if (!/^\$[1234]$/.test(card.cost)) continue;
        result.push(withName(card, card.name + ' (bane)'));
      }
    }

    return result;
  }
}


function withName(card, name) {
  const copy = JSON.parse(JSON.stringify(card));
  copy.name = name;
  return copy;
}


// Write constraints as metroplis weight functions
//   TwoExpansions:    cost = # of cards not in two biggest expansions
//   ThreeExpansions:  cost = # not in three biggest
//   BalancedCost:     cost = # in mode(sum(cost))
//   etc...

// Problem with this is that there's an exponential effect for
// underrepresented expansions - the half-expansions almost never
// show up, and when they do there's only a couple cards from them.

// Also options about # events and landmarks, etc, as part of shuffle...
// (default to 2 total) -- 

// Then do random shuffle, then 10k steps of equilibrating, anneal T -> 0 ???

// Idea: rather than a discrete shuffle, make it continuous...?
//  -- basically it's a superposition of all cards w/ different amplitudes
//  -- then we can _project_ it to a concrete shuffle using simple rules
//     (which takes young witch into account, for instance by taking the
//     highest-amplitude correct-cost card after the first 10).
//     -- also take the highest two events, for instance... - never set to zero?
//  -- could we do a difference map on this?


/** @interface */
class Constraint {
  /**
   * @param {!Array<!CardJson>}
   * @return {number}
   */
  cost(selection) {}
}


class ExpansionLimit {
  constructor(count = 2, exemption = 0) {
    this.count_ = count;
    this.exemption_ = exemption;
  }
  cost(selection) {
    const map = new DefaultMap(() => 0);
    for (const card of selection) {
      map.set(card.expansion, map.get(card.expansion) + 1);
    }
    const counts = [...map.values()].sort();
    if (counts <= this.count_) return 0;
    counts.splice(counts.length - this.count_, this.count_);
    return Math.max(0, counts.reduce((a, b) => a + b, 0) - this.exemption_);
  }
}


class SumConstraints {
  constructor(constraints) {
    this.constraints_ = constraints;
  }
  cost(selection) {
    return this.constraints_
        .map(c => c.cost(selection))
        .reduce((a, b) => a + b);
  }
}


function anneal(steps, constraint) {
  let cards = new Cards(CARD_LIST);
  let shuffle = cards.shuffle();
  let initialTemp = 20;
  let cost = constraint.cost(shuffle);
  for (let temp = initialTemp; temp > -initialTemp; temp -= (1.2 * initialTemp / steps)) {
    const newShuffle = cards.step(shuffle);
    const newCost = constraint.cost(newShuffle);
    const delta = Math.min(cost - newCost, 0);
    const temperature = Math.max(temp, 0);
    if (newCost <= cost ||
        Math.random() < Math.exp((cost - newCost) / Math.max(0, temp))) {
      cost = newCost;
      shuffle = newShuffle;
    }
  }
  return shuffle;
}


const result = anneal(1000, new ExpansionLimit(2));

// for (const card of result) {
// //for (const card of new Shuffle(new Cards(CARD_LIST)).shuffle()) {
//   console.log(`${lpad(card.name, 20)} ${lpad(`(${card.cost})`, 10)} ${
//                  card.expansion}
//   ${card.text.join('\n  ')}
// `);
// }

console.log(result.map(c => c.expansion).sort().join(', '));


// what do the projections look like?
//   -- specifically, card affinity?!?
//   -- Duchess (~Duchy) is .3, and Duke (~Duchy) is .6
//      -> put both to same?  but don't want *all* always...


// what about a custom "inclusion rate" as a function of current deck?
//   - how to combine...?
//     -- multiply?  that way anybody can "ban" certain cards.

// ExpansionLimit(min, max) would operate thusly:
//  - if < min expansions present, set rates of picked expansions to zero
//  - if max expansions present, set rates of all non-picked expansions to zero
//  - optional: if only exemption remaining, set rates back to 1.
//  - optional: allow a factor to balance smaller expansions (0 to 1).
//    - if we allow order to matter, then this could be a post-process?!?
//    - or build a reordering step into setup so that rules can dictate their
//      own order constraints - or make all rules always there, but disabled?
//    - split out rules vs settings (which configure rules)?
//    - or just make order matter and allow arbitrary reordering
//    - can also do a contrext-free version of this (separate from this rule).

// BanCards(...) would just set rates straight to zero

// CardAffinity(factor > 1) would multiply rates of cards with the same affinty
// or the affinitied card itself (by more? factor2?)
//  - could bundle mechanics in as well...

// BalanceCosts(factor < 1) would decrease rates of cards whose costs
// (sum over all types?  $1=1P=1D) are already present

// BalanceFeatures would increase rates of missing features
// UnbalanceFeatures could do the opposite...? suppress missing?

// If1ThenAtLeast(feature, minimum) would do
//  - if some but fewer than minimum feature present, all non-feature are zero
//  - if fewer than minimum remaining, feature-bearing cards are zero
//  --- note: preloading will skew the probabilities higher...

// MaximumComplexity?  BanFeature?  InterestingCards?  TargetSpeed?
// MaximumMechanics(count, mechanic...)?  - how to configure?

// Provide a variety of preset configurations?
//   IfThen(Vice, DrawUp | Defence, 80%)
//   IfThen(OnTrash, 3*Trash, 50%)


class Rule {
  setup(ctx) {}
  adjust(ctx, hand, rates) {}
  again(ctx, hand) {} // may mutate hand under rare situations
}

// Built-in rules:
//  - MinimumKingdomCards(10?)  - allow >10 for veto
//    - also handle Young Witch, rename the Bane, etc

// I think that might be it?

// Customizable affinity table?  Use cards.txt as default but allow
// arbitrary customization to it?  features, cards, etc...

// SelfFeatureAffinity(-1, Upgrade, ...)  // some features only needed once?
// FeatureAffinity(OnTrash, Trash, 2.0)
// FeatureAffinity(OnTrash, Trash+, 0.5)  // Note: Trash+ implies Trash
// FeatureAffinity(OnTrash, TrashSelf, 0.5)
// FeatureAffinity(Types, Combo, 3.0)
// FeatureAffinity(Money, NoMoney)  // optional


// Can also have a "keep dealing" method to encode Young Witch and
// events/landmarks as just other rules?


// BalanceExpansions(0 < factor ≤ 1)
//   - normalize rates of cards from expansions to a linear combination
//     between 1 (factor = 1) and size(expansion) (factor = 0)

// Similar effect for balancing features or effects?!? maybe not...
