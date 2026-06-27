export const RuleHelper = () => (
  <details className="paper p-3 text-sm text-ink group">
    <summary className="ink-heading font-semibold text-sm uppercase tracking-wider cursor-pointer rounded-md outline-none cell-focus">
      Rules
      <span className="ml-2 text-[10px] font-sans normal-case tracking-normal text-ink/60 group-open:hidden">Open</span>
      <span className="ml-2 hidden text-[10px] font-sans normal-case tracking-normal text-ink/60 group-open:inline">Close</span>
    </summary>
    <ul className="mt-3 space-y-1.5 list-disc list-inside marker:text-ink/40">
      <li>One person per row and one per column.</li>
      <li>Every clue must be true.</li>
      <li>People can only stand on empty floor or occupiable objects (bed, chair, car).</li>
      <li><span className="font-semibold">Beside</span> = left, right, above, or below — never diagonal — and both must be in the same area.</li>
      <li>The murderer is the only suspect alone with the victim in the same area.</li>
    </ul>
  </details>
);
