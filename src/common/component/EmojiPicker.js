// import React from 'react'
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import styled from "styled-components";
const StyledWrapper = styled.div`
  filter: drop-shadow(0px 25px 50px rgba(31, 41, 55, 0.25));
  border-radius: 12px;
  .emoji-mart {
    border: none;
    border-radius: 12px;
  }
`;
export default function EmojiPicker({ onSelect, ...rest }) {
  return (
    <StyledWrapper>
      <Picker
        // set="twitter"
        showPreview={false}
        showSkinTones={false}
        onSelect={onSelect}
        {...rest}
      />
    </StyledWrapper>
  );
}
