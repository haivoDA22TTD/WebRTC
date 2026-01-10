#!/usr/bin/env python3
"""Generate a simple placeholder avatar image"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_avatar(output_path="assets/avatar.png", size=640):
    """Create a simple robot avatar"""
    img = Image.new('RGB', (size, size), color='#2D3748')
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Face circle
    face_radius = size // 3
    draw.ellipse(
        [center - face_radius, center - face_radius - 50,
         center + face_radius, center + face_radius - 50],
        fill='#4A5568', outline='#63B3ED', width=4
    )
    
    # Eyes
    eye_y = center - 80
    eye_radius = 25
    # Left eye
    draw.ellipse(
        [center - 70 - eye_radius, eye_y - eye_radius,
         center - 70 + eye_radius, eye_y + eye_radius],
        fill='#63B3ED'
    )
    # Right eye
    draw.ellipse(
        [center + 70 - eye_radius, eye_y - eye_radius,
         center + 70 + eye_radius, eye_y + eye_radius],
        fill='#63B3ED'
    )
    
    # Mouth (smile)
    draw.arc(
        [center - 60, center - 30, center + 60, center + 50],
        start=0, end=180, fill='#63B3ED', width=4
    )
    
    # Antenna
    draw.line(
        [center, center - face_radius - 50, center, center - face_radius - 100],
        fill='#63B3ED', width=4
    )
    draw.ellipse(
        [center - 15, center - face_radius - 115,
         center + 15, center - face_radius - 85],
        fill='#63B3ED'
    )
    
    # Text
    try:
        font = ImageFont.truetype("arial.ttf", 32)
    except:
        font = ImageFont.load_default()
    
    text = "AI Bot"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    draw.text(
        (center - text_width // 2, size - 80),
        text, fill='#E2E8F0', font=font
    )
    
    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"✅ Avatar created: {output_path}")

if __name__ == "__main__":
    create_avatar()
