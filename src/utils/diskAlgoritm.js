// Disk Scheduling Algorithms

// FCFS (First Come First Serve)
export const fcfsAlgorithm = (requests, startPosition) => {
  const path = [startPosition];
  let seekCount = 0;
  let currentPosition = startPosition;

  for (let i = 0; i < requests.length; i++) {
    const track = Number(requests[i]);
    seekCount += Math.abs(currentPosition - track);
    currentPosition = track;
    path.push(track);
  }

  return { path, seekCount };
};


// SSTF (Shortest Seek Time First)
export const sstfAlgorithm = (requests, startPosition) => {
  const remainingRequests = [...requests.map(Number)];
  const path = [startPosition]; // Start from the head position
  let seekCount = 0;
  let currentPosition = startPosition;

  while (remainingRequests.length > 0) {
    let shortestSeek = Infinity;
    let nextIndex = -1;

    for (let i = 0; i < remainingRequests.length; i++) {
      const seekDistance = Math.abs(currentPosition - remainingRequests[i]);
      if (seekDistance < shortestSeek) {
        shortestSeek = seekDistance;
        nextIndex = i;
      }
    }

    const nextTrack = remainingRequests[nextIndex];
    seekCount += Math.abs(currentPosition - nextTrack);
    currentPosition = nextTrack;
    path.push(nextTrack);
    remainingRequests.splice(nextIndex, 1);
  }

  return { path, seekCount };
};


// SCAN (Elevator Algorithm)
export const scanAlgorithm = (requests, startPosition, direction = 'up', maxTrack = 199) => {
  const tracks = [...requests.map(Number)];
  const path = [startPosition];  // Start with head position
  let seekCount = 0;
  let currentPosition = startPosition;

  tracks.sort((a, b) => a - b);

  if (direction === 'up') {
    // Move upward to larger tracks
    for (let track of tracks) {
      if (track >= currentPosition) {
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
        path.push(track);
      }
    }

    // Move to maxTrack (if not already there)
    if (currentPosition < maxTrack) {
      seekCount += Math.abs(currentPosition - maxTrack);
      currentPosition = maxTrack;
      path.push(maxTrack);
    }

    // Then move downward for remaining lower tracks
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (tracks[i] < startPosition) {
        seekCount += Math.abs(currentPosition - tracks[i]);
        currentPosition = tracks[i];
        path.push(tracks[i]);
      }
    }

  } else {
    // Move downward to smaller tracks
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (tracks[i] <= currentPosition) {
        seekCount += Math.abs(currentPosition - tracks[i]);
        currentPosition = tracks[i];
        path.push(tracks[i]);
      }
    }

    // Move to 0 (if not already there)
    if (currentPosition > 0) {
      seekCount += Math.abs(currentPosition - 0);
      currentPosition = 0;
      path.push(0);
    }

    // Then move upward for remaining higher tracks
    for (let track of tracks) {
      if (track > startPosition) {
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
        path.push(track);
      }
    }
  }

  return { path, seekCount };
};


// C-SCAN (Circular SCAN)
export const cscanAlgorithm = (requests, startPosition, maxTrack = 400) => {
  const tracks = [...requests.map(Number)];
  const path = [startPosition]; // Start from head position
  let seekCount = 0;
  let currentPosition = startPosition;

  // Sort requests in ascending order
  tracks.sort((a, b) => a - b);

  // 1. Serve all tracks >= startPosition
  for (let track of tracks) {
    if (track >= currentPosition) {
      seekCount += Math.abs(currentPosition - track);
      currentPosition = track;
      path.push(track);
    }
  }

  // 2. Always move to maxTrack (400) if not already there
  if (currentPosition < maxTrack) {
    seekCount += Math.abs(currentPosition - maxTrack);
    currentPosition = maxTrack;
    path.push(maxTrack);
  }

  // 3. Simulate circular jump from maxTrack to 0
  seekCount += maxTrack; // 400 to 0 (circular jump cost)
  currentPosition = 0;
  path.push(0); // Log the jump

  // 4. Serve remaining requests < startPosition
  for (let track of tracks) {
    if (track < startPosition) {
      seekCount += Math.abs(currentPosition - track);
      currentPosition = track;
      path.push(track);
    }
  }

  return { path, seekCount };
};


// LOOK
export const lookAlgorithm = (requests, startPosition, direction = 'up') => {
  const tracks = [...requests.map(Number)];
  const path = [startPosition]; // Start from the initial head position
  let seekCount = 0;
  let currentPosition = startPosition;

  tracks.sort((a, b) => a - b);

  if (direction === 'up') {
    // Move upward first
    for (let track of tracks) {
      if (track >= currentPosition) {
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
        path.push(track);
      }
    }

    // Then move downward for remaining lower tracks
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (tracks[i] < startPosition) {
        seekCount += Math.abs(currentPosition - tracks[i]);
        currentPosition = tracks[i];
        path.push(tracks[i]);
      }
    }

  } else {
    // Move downward first
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (tracks[i] <= currentPosition) {
        seekCount += Math.abs(currentPosition - tracks[i]);
        currentPosition = tracks[i];
        path.push(tracks[i]);
      }
    }

    // Then move upward for remaining higher tracks
    for (let track of tracks) {
      if (track > startPosition) {
        seekCount += Math.abs(currentPosition - track);
        currentPosition = track;
        path.push(track);
      }
    }
  }

  return { path, seekCount };
};


// C-LOOK
export const clookAlgorithm = (requests, startPosition) => {
  const tracks = [...requests.map(Number)];
  const path = [startPosition]; // Start from the initial head position
  let seekCount = 0;
  let currentPosition = startPosition;

  tracks.sort((a, b) => a - b);

  // 1. Serve all tracks >= startPosition
  for (let track of tracks) {
    if (track >= currentPosition) {
      seekCount += Math.abs(currentPosition - track);
      currentPosition = track;
      path.push(track);
    }
  }

  // 2. If there are lower tracks, jump to the smallest one
  const lowerTracks = tracks.filter(track => track < startPosition);
  if (lowerTracks.length > 0) {
    const lowestTrack = lowerTracks[0]; // Because tracks is sorted
    seekCount += Math.abs(currentPosition - lowestTrack);
    currentPosition = lowestTrack;
    path.push(lowestTrack);

    // 3. Serve remaining lower tracks in ascending order
    for (let i = 1; i < lowerTracks.length; i++) {
      const track = lowerTracks[i];
      seekCount += Math.abs(currentPosition - track);
      currentPosition = track;
      path.push(track);
    }
  }

  return { path, seekCount };
};
