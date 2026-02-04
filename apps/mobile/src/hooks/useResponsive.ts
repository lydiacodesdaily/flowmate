import { useWindowDimensions, ViewStyle } from 'react-native';

const TABLET_BREAKPOINT = 768;
const CONTENT_MAX_WIDTH = 600;
const SHEET_MAX_WIDTH = 540;

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const contentPadding = Math.max((width - CONTENT_MAX_WIDTH) / 2, 0);
  const sheetPadding = Math.max((width - SHEET_MAX_WIDTH) / 2, 0);

  const contentStyle: ViewStyle = isTablet
    ? { paddingHorizontal: contentPadding }
    : {};

  const sheetStyle: ViewStyle = isTablet
    ? { paddingHorizontal: sheetPadding }
    : {};

  return { isTablet, contentStyle, sheetStyle };
}
