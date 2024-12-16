import { Devvit } from "@devvit/public-api";
import { SystemMessage, SystemMessageType } from "../utils/types.js";

type ModalProps = {
  systemMessage: SystemMessage;
  onPress: () => void | Promise<void>;
};

export const Modal = (props: ModalProps) => {
  return (
    <zstack
      width="100%"
      height="100%"
      alignment="center middle"
      backgroundColor="rgba(0, 0, 0, 0.75)"
    >
      <vstack alignment="center middle" width="80%" maxWidth="300px">
        {props.systemMessage.image ? (
          <>
            <image
              url={props.systemMessage.image}
              imageWidth={250}
              imageHeight={250}
              description="game background"
            />
            <spacer size="medium" />
          </>
        ) : null}
        {props.systemMessage.title ? (
          <>
            <text
              wrap
              alignment="center"
              weight="bold"
              size="xlarge"
              style="heading"
              color="white"
            >
              {props.systemMessage.title}
            </text>
            <spacer size="medium" />
          </>
        ) : null}
        <text
          wrap
          alignment="center"
          size="xlarge"
          color={
            props.systemMessage.type === SystemMessageType.Error
              ? "yellow"
              : "white"
          }
        >
          {props.systemMessage.message}
        </text>
        {props.systemMessage.dismissable && (
          <>
            <spacer size="large" />
            <button appearance="primary" onPress={props.onPress}>
              {props.systemMessage.buttonLabel ?? "Close"}
            </button>
          </>
        )}
      </vstack>
    </zstack>
  );
};
