export const RuleHelper = () => (
  <div className="paper p-3 text-sm text-ink">
    <h3 className="ink-heading font-semibold mb-2 text-sm uppercase tracking-wider">Rules</h3>
    <ul className="space-y-1.5 list-disc list-inside marker:text-ink/40">
      <li>One person per row and one per column.</li>
      <li>Every clue must be true.</li>
      <li>People can only stand on empty floor or occupiable objects (bed, chair, car).</li>
      <li><span className="font-semibold">Beside</span> = left, right, above, or below — never diagonal — and both must be in the same area.</li>
      <li>The murderer is the only suspect alone with the victim in the same area.</li>
    </ul>
  </div>
);