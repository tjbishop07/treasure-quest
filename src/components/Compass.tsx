import { Devvit } from "@devvit/public-api";

export const Compass = () => {
  return (
    <hstack cornerRadius="full" padding="small" backgroundColor="#131f23">
      <image
        url="compass.png"
        imageWidth="70px"
        imageHeight="70px"
        width="70px"
        height="70px"
        description="compass"
      />
    </hstack>
  );
};
