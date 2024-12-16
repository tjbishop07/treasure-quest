import { Devvit } from "@devvit/public-api";
import { TileType, TileStatus } from "../utils/types.js";

type TileProps = {
  selected: boolean;
  type: TileType;
  status: TileStatus;
  hasTreasure: boolean;
  depth: number;
  onPress: () => void | Promise<void>;
};

const _generateBackgroundColor = (
  type: TileType,
  depth: number,
  status: TileStatus
) => {
  if (status === TileStatus.Explored) {
    return "green";
  }
  if (type === TileType.Land) {
    return "#5C4033"; // brown
  }
  return `rgba(4, 122, 197, .${100 - depth})`; // Blue depending on depth
};

export const GameBoardTile = (props: TileProps) => {
  return (
    <hstack
      gap="medium"
      grow
      cornerRadius="small"
      borderColor={
        props.selected ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)"
      }
      alignment="middle center"
      border="thick"
      backgroundColor={_generateBackgroundColor(
        props.type,
        props.depth,
        props.status
      )}
      padding="small"
      onPress={props.onPress}
    >
      {props.hasTreasure && props.status === TileStatus.Explored ? (
        <icon name="coins" color="yellow" size="xsmall" />
      ) : (
        <icon name="coins" color="transparent" size="xsmall" />
      )}
    </hstack>
  );
};
