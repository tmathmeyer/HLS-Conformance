import numpy as np

import numpy as np
from moviepy.editor import VideoClip, AudioFileClip, VideoFileClip, CompositeAudioClip
from moviepy.audio.AudioClip import AudioArrayClip


def generate_media(final_path, duration=10, fps=25):
    """
    Generates and combines the video and audio for the test asset.
    """
    width, height = 640, 360
    box_size = 50
    orbit_width = width - 100 - box_size
    orbit_height = height - 100 - box_size
    sample_rate = 44100

    # --- Video Generation ---
    def make_frame(t):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        angle = 2 * np.pi * t / duration
        x = int((width - box_size) / 2 + (orbit_width / 2) * np.cos(angle))
        y = int((height - box_size) / 2 + (orbit_height / 2) * np.sin(angle))
        frame[y:y+box_size, x:x+box_size] = [255, 0, 0] # Red
        return frame

    video = VideoClip(make_frame, duration=duration)

    # --- Audio Generation ---
    def make_beep(freq, beep_duration):
        t = np.linspace(0, beep_duration, int(beep_duration * sample_rate), False)
        sine_wave = np.sin(freq * 2 * np.pi * t)
        # MoviePy expects a 2-channel array for stereo
        return AudioArrayClip(np.array([sine_wave, sine_wave]).T, fps=sample_rate)

    beep1 = make_beep(440, 0.2).set_start(0)
    beep2 = make_beep(550, 0.2).set_start(2.5)
    beep3 = make_beep(660, 0.2).set_start(5)
    beep4 = make_beep(880, 0.2).set_start(7.5)

    audio = CompositeAudioClip([beep1, beep2, beep3, beep4]).set_duration(duration)
    
    # --- Composition ---
    final_clip = video.set_audio(audio)
    
    # CRITICAL: Set keyframe interval ('g') to 2 seconds (50 frames at 25fps)
    final_clip.write_videofile(
        final_path, 
        fps=fps, 
        codec='libx264', 
        audio_codec='aac', 
        ffmpeg_params=['-g', str(fps*2)]
    )

if __name__ == '__main__':
    generate_media('content/orbit.mp4')