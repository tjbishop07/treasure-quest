export const startupMessage: string =
  "Select a blue water tile to start exploring! Try to find all the hidden treasure before you air runs out!";

export const diveErrorMessage: string =
  "Could not conduct dive. Please try again.";

export const tileSelectionErrorMessage: string =
  "You can't explore land! Please select a blue water tile.";

export const tileExploredMessage = (hasTreasure: number): string =>
  `You've already explored this tile. Found ${hasTreasure} gold coins.`;
