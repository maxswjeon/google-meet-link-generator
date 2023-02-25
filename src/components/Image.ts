import { chakra } from "@chakra-ui/react";

import { default as NextImage } from "next/image";

export const Image = chakra(NextImage, {
  shouldForwardProp: (prop) => ["width", "height", "src", "alt"].includes(prop),
});
