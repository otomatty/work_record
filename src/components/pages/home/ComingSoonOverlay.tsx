import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 1.5rem;
  font-style: italic;
`;

const ComingSoonOverlay: React.FC = () => {
  return <Overlay>Coming Soon ...</Overlay>;
};

export default ComingSoonOverlay;
