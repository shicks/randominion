const CARD_LIST = require('./card_list');
const Card = require('./card');
const DefaultMap = require('./defaultmap');
const Dealer = require('./dealer');
const {LimitExpansions, SelectionSize} = require('./rules');

function lpad(str, size) {
  if (str.length < size) {
    str = str + ' '.repeat(size - str.length);
  }
  return str;
}

// TODO - 3 expansions, 2 mechanics...?
//        how to make expansions a little more even?
const dealer =
    new Dealer(
        CARD_LIST.map(card => new Card(card)), [
          new SelectionSize(10),
          new LimitExpansions(2, 3, 0.5, 1),
        ]);

function* take(count, iter) {
  let item = iter.next();
  while (count-- >= 0 && !item.done) {
    yield item.value;
    item = iter.next();
  }
}

const result = [...dealer.deal()];
    


for (const card of result) {
// //for (const card of new Shuffle(new Cards(CARD_LIST)).shuffle()) {
  console.log(`${lpad(card.name, 20)} ${lpad(`(${card.cost})`, 10)} ${
                 card.expansion}
  ${card.text.join('\n  ')}
  `);
}

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



// Give all rules a scale factor from 0 to 1
//   -- at zero, no changes make any difference
//   -- at one, changes make full difference
//   e.g. w/ s=0.67, changing a rate of 0.7 to 0.1 will end up at 0.3
//     (or better multiplicative scaling?  how to do zero?)

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
