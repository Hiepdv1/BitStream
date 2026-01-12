export const formatDuration = (
  seconds: number,
  showHours: boolean = false,
): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0 || showHours) {
    return `${hrs.toString().padStart(2, '0')}:${formattedMins}:${formattedSecs}`;
  }

  return `${formattedMins}:${formattedSecs}`;
};
