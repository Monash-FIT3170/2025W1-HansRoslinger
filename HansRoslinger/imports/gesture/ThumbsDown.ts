export const processThumbsDown = (): void => {

  const gestureEvent = new CustomEvent('chart:next-data', {
  });

  window.dispatchEvent(gestureEvent);
};
