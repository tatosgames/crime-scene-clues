import { describe, expect, it } from "vitest";
import { prepperLevel } from "./level";
import { evaluateClue, resolveMurderer, SUPPORTED_CLUE_TYPES, validateBoard } from "./logic";
import type { ClueDefinition } from "./types";

const solutionPlacements = () => ({ ...prepperLevel.solution.placements });

const expectFeedbackContaining = (feedback: string[], text: string) => {
  expect(feedback.some((message) => message.includes(text))).toBe(true);
};

describe("Preppers Prototype logic", () => {
  it("accepts the declared solution", () => {
    const result = validateBoard(prepperLevel, solutionPlacements());

    expect(result).toEqual({ ok: true, feedback: [], solved: true, murdererId: "edna" });
  });

  it("resolves Edna as the murderer", () => {
    expect(resolveMurderer(prepperLevel, solutionPlacements())).toEqual({
      status: "resolved",
      murdererId: "edna",
    });
  });

  it("rejects duplicate rows", () => {
    const placements = solutionPlacements();
    placements.edna = "7,8";

    const result = validateBoard(prepperLevel, placements);

    expect(result.ok).toBe(false);
    expectFeedbackContaining(result.feedback, "Row 8 contains more than one person.");
  });

  it("rejects duplicate columns", () => {
    const placements = solutionPlacements();
    placements.edna = "8,7";

    const result = validateBoard(prepperLevel, placements);

    expect(result.ok).toBe(false);
    expectFeedbackContaining(result.feedback, "Column 8 contains more than one person.");
  });

  it("rejects non-occupiable object placements", () => {
    const placements = solutionPlacements();
    placements.howie = "0,3";

    const result = validateBoard(prepperLevel, placements);

    expect(result.ok).toBe(false);
    expectFeedbackContaining(result.feedback, "Howie is on a cell that cannot be occupied.");
  });

  it("rejects missing characters", () => {
    const placements = solutionPlacements();
    delete placements.friedrich;

    const result = validateBoard(prepperLevel, placements);

    expect(result.ok).toBe(false);
    expect(result.solved).toBe(false);
    expectFeedbackContaining(result.feedback, "Friedrich");
  });

  it("rejects placements that fail clues", () => {
    const placements = solutionPlacements();
    [placements.greg, placements.edna] = [placements.edna, placements.greg];

    const result = validateBoard(prepperLevel, placements);

    expect(result.ok).toBe(false);
    expectFeedbackContaining(result.feedback, "clues are not satisfied");
  });

  it("rejects a victim area with zero suspects", () => {
    const placements = solutionPlacements();
    [placements.blake, placements.edna] = [placements.edna, placements.blake];

    const result = validateBoard(prepperLevel, placements);

    expect(resolveMurderer(prepperLevel, placements)).toMatchObject({ status: "none" });
    expect(result.ok).toBe(false);
    expectFeedbackContaining(result.feedback, "the murderer cannot be determined yet");
  });

  it("rejects a victim area with multiple suspects", () => {
    const placements = solutionPlacements();
    placements.howie = "6,6";

    const result = validateBoard(prepperLevel, placements);

    expect(resolveMurderer(prepperLevel, placements)).toMatchObject({
      status: "multiple",
      suspectIds: expect.arrayContaining(["edna", "howie"]),
    });
    expect(result.ok).toBe(false);
    expectFeedbackContaining(result.feedback, "murderer is ambiguous");
  });

  it("covers every clue type currently used by the level", () => {
    const usedClueTypes = new Set(prepperLevel.clues.map((clue) => clue.type));

    for (const clueType of usedClueTypes) {
      expect(SUPPORTED_CLUE_TYPES).toContain(clueType);
    }
  });

  it("reports unsupported clue types instead of letting them pass", () => {
    const unsupportedClue: ClueDefinition = {
      id: "clue-unsupported",
      characterId: "angelo",
      type: "direction_from_object",
      text: "Angelo was north of a mystery prop.",
      params: {},
    };

    expect(() => evaluateClue(unsupportedClue, { level: prepperLevel, placements: solutionPlacements() })).toThrow(
      "Unsupported clue type: direction_from_object"
    );

    const result = validateBoard(
      { ...prepperLevel, clues: [...prepperLevel.clues, unsupportedClue] },
      solutionPlacements()
    );

    expect(result.ok).toBe(false);
    expectFeedbackContaining(result.feedback, "Unsupported clue type: direction_from_object");
  });
});
