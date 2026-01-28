import React, { useRef, useState, useEffect, useContext } from "react";
import styled, {
  css,
  ThemeProvider as StyledThemeProvider,
} from "styled-components";
import { ThemeContext } from "@/context/ThemeContext";

// --- Styled Components ---

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  overflow: hidden;
  transition: background-color 0.5s ease;
`;

const ScrollContent = styled.div`
  flex-grow: 1;
  height: 100%;
  overflow-y: scroll;
  /* Reduced padding to match the thinner zipper */
  padding-right: 20px;

  /* Hide Native Scrollbar */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// The fixed track on the right
const ZipperBar = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  /* KEEP: Thin width */
  width: 10px;
  height: 100%;
  z-index: 50;
  background-color: transparent;
  /* Removed border-left to make it look even more seamless/flush */
  /* border-left: 1px solid ${(props) => props.theme.scrollbar.border}40; */
  transition: background-color 0.5s ease, border-color 0.5s ease;

  backdrop-filter: blur(2px);
`;

// Shared styles for the zipper teeth pattern
const teethPattern = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 100% 8px;
  background-repeat: repeat-y;
  background-position: 0 0, 0 0, 0 0, 0 4px;
`;

const ZipperTeethClosed = styled.div`
  ${teethPattern}
  opacity: 0.5;

  background-image: 
    /* Left Teeth - FLUSH LEFT (0%) */ radial-gradient(
      circle at 0% 4px,
      ${(props) => props.theme.scrollbar.teeth} 0%,
      transparent 70%
    ),
    /* Right Teeth - FLUSH RIGHT (100%) - Removes the gap */
      radial-gradient(
        circle at 100% 8px,
        ${(props) => props.theme.scrollbar.teeth} 0%,
        transparent 70%
      );

  filter: contrast(90%);
`;

const ZipperOpenLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0px; /* Dynamic */
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
`;

const ZipperTeethOpen = styled.div`
  ${teethPattern}
  height: 100vh;
  opacity: 0.6;

  background-image: 
    /* Left Teeth - FLUSH LEFT */ radial-gradient(
      circle at 0% 4px,
      ${(props) => props.theme.scrollbar.teeth} 0%,
      transparent 70%
    ),
    /* Right Teeth - FLUSH RIGHT */
      radial-gradient(
        circle at 100% 8px,
        ${(props) => props.theme.scrollbar.teeth} 0%,
        transparent 70%
      );

  /* The mask creates the open gap */
  -webkit-mask-image: linear-gradient(
    to right,
    black 0%,
    transparent 10%,
    transparent 90%,
    black 100%
  );
  mask-image: linear-gradient(
    to right,
    black 0%,
    transparent 10%,
    transparent 90%,
    black 100%
  );
`;

const GapShadow = styled.div`
  position: absolute;
  left: 5%;
  right: 5%;
  height: 100vh;
  background: transparent;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
  transition: background-color 0.5s ease;
`;

const HandleContainer = styled.div`
  position: absolute;
  /* CHANGE: Center alignment logic to handle bigger size on thin track */
  right: -4px; /* Shift slightly right to cover the edge */

  /* CHANGE: Made dimensions bigger than the track (24px > 16px) */
  width: 24px;
  height: 38px;

  cursor: grab;
  z-index: 100;
  margin-top: -10px;
  transition: transform 0.1s;
  opacity: 0.95;

  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }

  .pull-tab {
    transform-origin: 12px 28px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:active .pull-tab {
    transform: rotate(180deg) translateY(-2px);
  }
`;

// --- Component Logic ---

const ZipperScrollbar = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const containerRef = useRef(null);
  const handleRef = useRef(null);
  const openLayerRef = useRef(null);
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragInfo = useRef({ startY: 0, startTop: 0 });

  const updateZipperVisuals = (positionPx) => {
    if (handleRef.current) {
      handleRef.current.style.top = `${positionPx}px`;
    }
    if (openLayerRef.current && handleRef.current) {
      // Adjusted offset for larger handle
      const offset = handleRef.current.clientHeight / 2;
      openLayerRef.current.style.height = `${positionPx + offset}px`;
    }
  };

  const handleScroll = () => {
    if (isDragging || !containerRef.current || !barRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const maxScroll = scrollHeight - clientHeight;
    // Updated fallback height for calculation (38px is new handle height)
    const maxTop =
      barRef.current.clientHeight - (handleRef.current?.clientHeight || 38);

    let percent = 0;
    if (maxScroll > 0) percent = scrollTop / maxScroll;

    const newTop = percent * maxTop;
    updateZipperVisuals(newTop);
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    dragInfo.current = {
      startY: e.clientY,
      startTop: handleRef.current ? handleRef.current.offsetTop : 0,
    };
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging || !containerRef.current || !barRef.current) return;
      e.preventDefault();

      const deltaY = e.clientY - dragInfo.current.startY;
      let newTop = dragInfo.current.startTop + deltaY;

      const maxTop =
        barRef.current.clientHeight - (handleRef.current?.clientHeight || 38);
      newTop = Math.max(0, Math.min(maxTop, newTop));

      updateZipperVisuals(newTop);

      const percent = newTop / maxTop;
      const scrollHeight =
        containerRef.current.scrollHeight - containerRef.current.clientHeight;
      containerRef.current.scrollTop = percent * scrollHeight;
    };

    const onMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = "";
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  return (
    <StyledThemeProvider theme={theme}>
      <Wrapper>
        <ScrollContent ref={containerRef} onScroll={handleScroll}>
          {children}
        </ScrollContent>

        <ZipperBar ref={barRef}>
          <ZipperTeethClosed />
          <ZipperOpenLayer ref={openLayerRef}>
            <GapShadow />
            <ZipperTeethOpen />
          </ZipperOpenLayer>

          <HandleContainer ref={handleRef} onMouseDown={onMouseDown}>
            <svg viewBox="0 0 50 80" width="100%" height="100%">
              <defs>
                <linearGradient id="handleGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop
                    offset="0%"
                    stopColor={theme.scrollbar.handleGradientStart}
                    stopOpacity="0.9"
                  />
                  <stop
                    offset="50%"
                    stopColor={theme.scrollbar.handleGradientEnd}
                    stopOpacity="0.9"
                  />
                  <stop
                    offset="100%"
                    stopColor={theme.scrollbar.handleGradientStart}
                    stopOpacity="0.9"
                  />
                </linearGradient>
              </defs>

              {/* Slider Body - Made slightly wider visually in SVG */}
              <path
                d="M5,10 L45,10 L40,40 L10,40 Z"
                fill="url(#handleGrad)"
                stroke={theme.scrollbar.handleStroke}
                strokeWidth="2"
                strokeOpacity="0.8"
              />

              {/* Pull Tab Group */}
              <g className="pull-tab">
                <rect
                  x="15"
                  y="35"
                  width="20"
                  height="8"
                  rx="2"
                  fill={theme.scrollbar.handleStroke}
                  fillOpacity="0.8"
                />
                <path
                  d="M15,42 L35,42 L30,75 C29,78 21,78 20,75 L15,42 Z"
                  fill="url(#handleGrad)"
                  stroke={theme.scrollbar.handleStroke}
                  strokeWidth="1"
                  strokeOpacity="0.8"
                />
                <path
                  d="M22,48 L28,48 L27,65 L23,65 Z"
                  fill={theme.scrollbar.handleStroke}
                />
              </g>
            </svg>
          </HandleContainer>
        </ZipperBar>
      </Wrapper>
    </StyledThemeProvider>
  );
};

export default ZipperScrollbar;
