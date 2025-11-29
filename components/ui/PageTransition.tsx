
import React from 'react';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  Layout
} from 'react-native-reanimated';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide';
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  type = 'fade' 
}) => {
  const entering = type === 'slide' ? SlideInRight.springify() : FadeIn.duration(300);
  const exiting = type === 'slide' ? SlideOutLeft.springify() : FadeOut.duration(200);

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      layout={Layout.springify()}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
};

