import { Devvit } from "@devvit/public-api";
import { TileType, TileStatus } from "../utils/types.js";

interface TileProps {
  key: string;
  selected: boolean;
  type: TileType;
  status: TileStatus;
  hasTreasure: boolean;
  depth: number;
  onPress: () => void | Promise<void>;
}

const COLORS = {
  explored: "green",
  land: "#5C4033", // brown
  border: {
    selected: "rgba(255, 255, 255, 1)",
    default: "#131f23",
  },
} as const;

const getBackgroundColor = (
  type: TileType,
  depth: number,
  status: TileStatus
): string => {
  if (status === TileStatus.Explored) {
    return COLORS.explored;
  }
  if (type === TileType.Land) {
    return COLORS.land;
  }
  return `rgba(4, 122, 197, .${100 - depth})`; // Blue depending on depth
};

export const GameBoardTile = ({
  key,
  selected,
  type,
  status,
  hasTreasure,
  depth,
  onPress,
}: TileProps) => {
  const showTreasure = hasTreasure && status === TileStatus.Explored;

  return (
    <hstack
      key={key}
      gap="medium"
      cornerRadius="small"
      borderColor={selected ? COLORS.border.selected : COLORS.border.default}
      alignment="middle center"
      border="thick"
      backgroundColor={getBackgroundColor(type, depth, status)}
      padding="small"
      onPress={onPress}
      width="35px"
      height="35px"
    >
      <icon
        name="coins"
        color={showTreasure ? "yellow" : "transparent"}
        size="xsmall"
      />
    </hstack>
  );
};
