import React, { useState, useRef, useEffect } from 'react';
import { FiVolume2, FiVolumeX } from "react-icons/fi";

function VideoPlayer({ media }) {
  const videoTag = useRef();
  const [mute, setMute] = useState(true); // Start muted to allow autoplay
  const [isPlaying, setIsPlaying] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(false);

  // Play/pause toggle
  const handleClick = () => {
    const video = videoTag.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(err => console.log('Play failed:', err));
      setIsPlaying(true);
    }
  };

  // IntersectionObserver to auto play/pause when video is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoTag.current;
        if (!video) return;

        if (entry.isIntersecting) {
          // Only autoplay if muted or user has interacted
          if (video.muted || canAutoplay) {
            video.play().catch(err => console.log('Autoplay blocked:', err));
            setIsPlaying(true);
          }
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoTag.current) observer.observe(videoTag.current);

    return () => {
      if (videoTag.current) observer.unobserve(videoTag.current);
    };
  }, [canAutoplay]);

  // Enable playback after first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      setCanAutoplay(true);
      const video = videoTag.current;
      if (video && !isPlaying) {
        video.play().catch(err => console.log('Play failed:', err));
        setIsPlaying(true);
      }
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, [isPlaying]);

  return (
    <div className="h-[100%] relative cursor-pointer max-w-full rounded-2xl overflow-hidden">
      <video
        ref={videoTag}
        src={media}
        autoPlay
        loop
        muted={mute}
        className="h-[100%] cursor-pointer w-full object-cover rounded-2xl"
        onClick={handleClick}
      />
      {/* Mute/Unmute button */}
      <div
        className="absolute bottom-[10px] right-[10px] z-10"
        onClick={e => { e.stopPropagation(); setMute(prev => !prev); }}
      >
        {!mute ? (
          <FiVolume2 className="w-[20px] h-[20px] text-white font-semibold" />
        ) : (
          <FiVolumeX className="w-[20px] h-[20px] text-white font-semibold" />
        )}
      </div>

      {/* Optional overlay if autoplay blocked */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex justify-center items-center bg-black/40 text-white text-3xl font-bold"
          onClick={handleClick}
        >
          ▶
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
