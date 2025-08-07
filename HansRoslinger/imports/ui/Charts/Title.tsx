import React from "react";
import { Dataset } from "../../api/database/dataset/dataset";
import {
  TITLE_FONT_SIZE,
  TITLE_FONT_FAMILY,
  TITLE_COLOR,
  TITLE_TEXT_SHADOW,
} from "./constants";

interface TitleProps {
  dataset: Dataset;
}

export const Title: React.FC<TitleProps> = ({ dataset }) => (
  <div
    style={{
      textAlign: "center",
      fontSize: TITLE_FONT_SIZE,
      fontFamily: TITLE_FONT_FAMILY,
      color: TITLE_COLOR,
      fontWeight: "bold",
      margin: "16px 0",
      textShadow: TITLE_TEXT_SHADOW,
    }}
  >
    {dataset.title}
  </div>
);
