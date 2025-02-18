import { Devvit } from "@devvit/public-api";
import { TileType, TileStatus } from "../utils/types.js";

type TileProps = {
  key: string;
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
      key={props.key}
      gap="medium"
      cornerRadius="small"
      borderColor={props.selected ? "rgba(255, 255, 255, 1)" : "#131f23"}
      alignment="middle center"
      border="thick"
      backgroundColor={_generateBackgroundColor(
        props.type,
        props.depth,
        props.status
      )}
      padding="small"
      onPress={props.onPress}
      width="35px"
      height="35px"
    >
      {props.hasTreasure && props.status === TileStatus.Explored ? (
        <icon name="coins" color="yellow" size="xsmall" />
      ) : (
        <icon name="coins" color="transparent" size="xsmall" />
      )}
    </hstack>
  );
};
