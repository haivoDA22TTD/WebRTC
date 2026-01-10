import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import time
import math
import config

class VideoGenerator:
    def __init__(self):
        self.avatar_image = None
        self.idle_frames = []
        self.current_frame_idx = 0
        self.is_speaking = False
        self.frame_width = 640
        self.frame_height = 480
        self.animation_time = 0
        
        self._load_avatar()

    def _load_avatar(self):
        """Load avatar image or video"""
        # Try to load avatar image
        if os.path.exists(config.AVATAR_IMAGE):
            img = cv2.imread(config.AVATAR_IMAGE)
            self.avatar_image = cv2.resize(img, (self.frame_width, self.frame_height))
            print(f"✅ Loaded avatar image: {config.AVATAR_IMAGE}")
        else:
            # Create anime-style avatar
            self.avatar_image = self._create_anime_avatar()
            print("ℹ️ Using anime-style avatar")

        # Try to load idle video for animation
        if os.path.exists(config.AVATAR_VIDEO):
            cap = cv2.VideoCapture(config.AVATAR_VIDEO)
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                frame = cv2.resize(frame, (self.frame_width, self.frame_height))
                self.idle_frames.append(frame)
            cap.release()
            print(f"✅ Loaded {len(self.idle_frames)} idle frames")

    def _create_anime_avatar(self) -> np.ndarray:
        """Create an anime-style avatar"""
        frame = np.zeros((self.frame_height, self.frame_width, 3), dtype=np.uint8)
        
        # Gradient background (purple/blue)
        for y in range(self.frame_height):
            ratio = y / self.frame_height
            r = int(30 + ratio * 20)
            g = int(30 + ratio * 30)
            b = int(60 + ratio * 40)
            frame[y, :] = [b, g, r]  # BGR

        center_x = self.frame_width // 2
        center_y = self.frame_height // 2 - 20

        # Hair (purple/blue gradient)
        hair_color = (180, 100, 140)  # BGR - purple
        # Back hair
        cv2.ellipse(frame, (center_x, center_y - 20), (120, 140), 0, 0, 360, hair_color, -1)
        # Side hair
        pts_left = np.array([[center_x - 100, center_y], [center_x - 120, center_y + 150], 
                            [center_x - 80, center_y + 180], [center_x - 60, center_y + 50]], np.int32)
        pts_right = np.array([[center_x + 100, center_y], [center_x + 120, center_y + 150], 
                             [center_x + 80, center_y + 180], [center_x + 60, center_y + 50]], np.int32)
        cv2.fillPoly(frame, [pts_left], hair_color)
        cv2.fillPoly(frame, [pts_right], hair_color)

        # Face
        face_color = (210, 200, 235)  # Light skin tone BGR
        cv2.ellipse(frame, (center_x, center_y + 20), (80, 100), 0, 0, 360, face_color, -1)

        # Bangs
        bangs_pts = np.array([
            [center_x - 80, center_y - 60],
            [center_x - 60, center_y + 10],
            [center_x - 30, center_y - 20],
            [center_x, center_y + 20],
            [center_x + 30, center_y - 20],
            [center_x + 60, center_y + 10],
            [center_x + 80, center_y - 60],
        ], np.int32)
        cv2.fillPoly(frame, [bangs_pts], hair_color)

        # Eyes (anime style - big)
        eye_y = center_y + 10
        # Left eye
        cv2.ellipse(frame, (center_x - 30, eye_y), (20, 25), 0, 0, 360, (255, 255, 255), -1)
        cv2.ellipse(frame, (center_x - 30, eye_y), (12, 18), 0, 0, 360, (150, 80, 80), -1)  # Iris
        cv2.circle(frame, (center_x - 30, eye_y), 8, (50, 30, 30), -1)  # Pupil
        cv2.circle(frame, (center_x - 35, eye_y - 8), 4, (255, 255, 255), -1)  # Highlight
        
        # Right eye
        cv2.ellipse(frame, (center_x + 30, eye_y), (20, 25), 0, 0, 360, (255, 255, 255), -1)
        cv2.ellipse(frame, (center_x + 30, eye_y), (12, 18), 0, 0, 360, (150, 80, 80), -1)
        cv2.circle(frame, (center_x + 30, eye_y), 8, (50, 30, 30), -1)
        cv2.circle(frame, (center_x + 25, eye_y - 8), 4, (255, 255, 255), -1)

        # Eyebrows
        cv2.line(frame, (center_x - 45, eye_y - 35), (center_x - 15, eye_y - 30), hair_color, 3)
        cv2.line(frame, (center_x + 15, eye_y - 30), (center_x + 45, eye_y - 35), hair_color, 3)

        # Nose (simple)
        cv2.line(frame, (center_x, eye_y + 20), (center_x - 5, eye_y + 35), (180, 170, 200), 2)

        # Mouth (small smile)
        cv2.ellipse(frame, (center_x, center_y + 70), (15, 8), 0, 0, 180, (150, 120, 150), 2)

        # Blush
        cv2.ellipse(frame, (center_x - 50, center_y + 45), (15, 8), 0, 0, 360, (180, 150, 200), -1)
        cv2.ellipse(frame, (center_x + 50, center_y + 45), (15, 8), 0, 0, 360, (180, 150, 200), -1)

        # Name tag
        cv2.rectangle(frame, (self.frame_width//2 - 80, self.frame_height - 60),
                     (self.frame_width//2 + 80, self.frame_height - 30), (242, 101, 88), -1)
        cv2.putText(frame, "AI Assistant", (self.frame_width//2 - 55, self.frame_height - 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        return frame

    def get_frame(self) -> np.ndarray:
        """Get current video frame with animation"""
        self.animation_time = time.time()
        
        if self.idle_frames and not self.is_speaking:
            frame = self.idle_frames[self.current_frame_idx].copy()
            self.current_frame_idx = (self.current_frame_idx + 1) % len(self.idle_frames)
        else:
            frame = self._create_animated_frame()

        return frame

    def _create_animated_frame(self) -> np.ndarray:
        """Create an animated frame"""
        frame = np.zeros((self.frame_height, self.frame_width, 3), dtype=np.uint8)
        t = self.animation_time
        
        # Animated gradient background
        for y in range(self.frame_height):
            ratio = y / self.frame_height
            wave = math.sin(t * 0.5 + y * 0.01) * 10
            r = int(30 + ratio * 20 + wave)
            g = int(30 + ratio * 30 + wave)
            b = int(60 + ratio * 40 + wave)
            frame[y, :] = [max(0, min(255, b)), max(0, min(255, g)), max(0, min(255, r))]

        center_x = self.frame_width // 2
        center_y = self.frame_height // 2 - 20
        
        # Breathing animation
        breath = math.sin(t * 2) * 3
        
        # Hair
        hair_color = (180, 100, 140)
        cv2.ellipse(frame, (center_x, int(center_y - 20 + breath)), (120, 140), 0, 0, 360, hair_color, -1)
        
        # Side hair with slight movement
        hair_wave = math.sin(t * 3) * 5
        pts_left = np.array([[center_x - 100, center_y], [center_x - 120 + hair_wave, center_y + 150], 
                            [center_x - 80, center_y + 180], [center_x - 60, center_y + 50]], np.int32)
        pts_right = np.array([[center_x + 100, center_y], [center_x + 120 - hair_wave, center_y + 150], 
                             [center_x + 80, center_y + 180], [center_x + 60, center_y + 50]], np.int32)
        cv2.fillPoly(frame, [pts_left], hair_color)
        cv2.fillPoly(frame, [pts_right], hair_color)

        # Face
        face_color = (210, 200, 235)
        cv2.ellipse(frame, (center_x, int(center_y + 20 + breath)), (80, 100), 0, 0, 360, face_color, -1)

        # Bangs
        bangs_pts = np.array([
            [center_x - 80, center_y - 60],
            [center_x - 60, center_y + 10],
            [center_x - 30, center_y - 20],
            [center_x, center_y + 20],
            [center_x + 30, center_y - 20],
            [center_x + 60, center_y + 10],
            [center_x + 80, center_y - 60],
        ], np.int32)
        cv2.fillPoly(frame, [bangs_pts], hair_color)

        # Eyes with blinking
        eye_y = int(center_y + 10 + breath)
        blink = abs(math.sin(t * 0.3)) > 0.95  # Occasional blink
        
        if blink:
            # Closed eyes
            cv2.line(frame, (center_x - 45, eye_y), (center_x - 15, eye_y), (50, 30, 30), 3)
            cv2.line(frame, (center_x + 15, eye_y), (center_x + 45, eye_y), (50, 30, 30), 3)
        else:
            # Open eyes
            cv2.ellipse(frame, (center_x - 30, eye_y), (20, 25), 0, 0, 360, (255, 255, 255), -1)
            cv2.ellipse(frame, (center_x - 30, eye_y), (12, 18), 0, 0, 360, (150, 80, 80), -1)
            cv2.circle(frame, (center_x - 30, eye_y), 8, (50, 30, 30), -1)
            cv2.circle(frame, (center_x - 35, eye_y - 8), 4, (255, 255, 255), -1)
            
            cv2.ellipse(frame, (center_x + 30, eye_y), (20, 25), 0, 0, 360, (255, 255, 255), -1)
            cv2.ellipse(frame, (center_x + 30, eye_y), (12, 18), 0, 0, 360, (150, 80, 80), -1)
            cv2.circle(frame, (center_x + 30, eye_y), 8, (50, 30, 30), -1)
            cv2.circle(frame, (center_x + 25, eye_y - 8), 4, (255, 255, 255), -1)

        # Eyebrows
        cv2.line(frame, (center_x - 45, eye_y - 35), (center_x - 15, eye_y - 30), hair_color, 3)
        cv2.line(frame, (center_x + 15, eye_y - 30), (center_x + 45, eye_y - 35), hair_color, 3)

        # Nose
        cv2.line(frame, (center_x, eye_y + 20), (center_x - 5, eye_y + 35), (180, 170, 200), 2)

        # Mouth - animated when speaking
        mouth_y = int(center_y + 70 + breath)
        if self.is_speaking:
            mouth_open = abs(math.sin(t * 15)) * 12 + 5
            cv2.ellipse(frame, (center_x, mouth_y), (15, int(mouth_open)), 0, 0, 360, (100, 80, 100), -1)
            cv2.ellipse(frame, (center_x, mouth_y - 3), (12, int(mouth_open * 0.6)), 0, 0, 360, (150, 100, 120), -1)
        else:
            cv2.ellipse(frame, (center_x, mouth_y), (15, 8), 0, 0, 180, (150, 120, 150), 2)

        # Blush
        cv2.ellipse(frame, (center_x - 50, int(center_y + 45 + breath)), (15, 8), 0, 0, 360, (180, 150, 200), -1)
        cv2.ellipse(frame, (center_x + 50, int(center_y + 45 + breath)), (15, 8), 0, 0, 360, (180, 150, 200), -1)

        # Speaking indicator
        if self.is_speaking:
            pulse = int(abs(math.sin(t * 5)) * 20) + 5
            cv2.circle(frame, (center_x, center_y), 130 + pulse, (242, 101, 88), 2)
            
            # Sound wave bars
            bar_x = self.frame_width - 80
            for i in range(5):
                height = int(abs(math.sin(t * 10 + i)) * 30) + 10
                cv2.rectangle(frame, 
                             (bar_x + i * 12, self.frame_height - 80 - height),
                             (bar_x + i * 12 + 8, self.frame_height - 80),
                             (242, 101, 88), -1)

        # Name tag
        cv2.rectangle(frame, (self.frame_width//2 - 80, self.frame_height - 60),
                     (self.frame_width//2 + 80, self.frame_height - 30), (242, 101, 88), -1)
        cv2.putText(frame, "AI Assistant", (self.frame_width//2 - 55, self.frame_height - 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        return frame

    def set_speaking(self, speaking: bool):
        """Set speaking state"""
        self.is_speaking = speaking

    def get_frame_bytes(self) -> bytes:
        """Get frame as JPEG bytes"""
        frame = self.get_frame()
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        return buffer.tobytes()
