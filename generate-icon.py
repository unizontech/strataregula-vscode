#!/usr/bin/env python3
"""
Generate StrataRegula VS Code Extension Icon
Creates a 128x128 PNG icon with hierarchical pattern visualization
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_strataregula_icon():
    """Create the StrataRegula extension icon"""
    
    # Icon specifications
    size = 128
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Color scheme - VS Code blue theme
    primary_color = (0, 122, 204)      # VS Code blue
    secondary_color = (255, 107, 53)    # Orange accent
    bg_color = (248, 248, 248)         # Light background
    
    # Background with subtle gradient effect
    draw.rectangle([0, 0, size, size], fill=bg_color)
    
    # Draw hexagonal background shape
    center_x, center_y = size // 2, size // 2
    hex_radius = 45
    
    # Hexagon points
    hex_points = []
    import math
    for i in range(6):
        angle = (i * math.pi) / 3
        x = center_x + hex_radius * math.cos(angle)
        y = center_y + hex_radius * math.sin(angle)
        hex_points.append((x, y))
    
    # Draw hexagon with gradient-like effect
    draw.polygon(hex_points, fill=primary_color + (100,), outline=primary_color, width=2)
    
    # Inner layers representing "strata"
    for layer in range(1, 4):
        inner_radius = hex_radius - (layer * 8)
        inner_points = []
        alpha = max(50, 200 - layer * 50)  # Decreasing opacity
        
        for i in range(6):
            angle = (i * math.pi) / 3
            x = center_x + inner_radius * math.cos(angle)
            y = center_y + inner_radius * math.sin(angle)
            inner_points.append((x, y))
        
        color = primary_color + (alpha,)
        draw.polygon(inner_points, fill=color)
    
    # Central wildcard symbol
    try:
        # Try to use a nice font
        font = ImageFont.truetype("arial.ttf", 32)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    # Draw the wildcard symbol
    wildcard_text = "*"
    bbox = draw.textbbox((0, 0), wildcard_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = center_x - text_width // 2
    text_y = center_y - text_height // 2 - 2  # Slight adjustment
    
    # White background for text
    draw.ellipse([text_x - 8, text_y - 4, text_x + text_width + 8, text_y + text_height + 4], 
                 fill=(255, 255, 255, 255))
    draw.text((text_x, text_y), wildcard_text, fill=secondary_color, font=font)
    
    # Add corner dots representing pattern expansion
    dot_radius = 4
    dot_positions = [
        (20, 20), (108, 20), (20, 108), (108, 108),  # Corners
        (64, 15), (15, 64), (113, 64), (64, 113)     # Mid-edges
    ]
    
    for pos in dot_positions[:4]:  # Only corner dots
        draw.ellipse([pos[0] - dot_radius, pos[1] - dot_radius, 
                     pos[0] + dot_radius, pos[1] + dot_radius], 
                    fill=secondary_color)
    
    # Save the icon
    output_path = os.path.join("images", "icon.png")
    os.makedirs("images", exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Icon saved to: {output_path}")
    
    # Create smaller versions
    sizes = [64, 32, 16]
    for s in sizes:
        small_img = img.resize((s, s), Image.Resampling.LANCZOS)
        small_path = os.path.join("images", f"icon-{s}x{s}.png")
        small_img.save(small_path, "PNG")
        print(f"Icon {s}x{s} saved to: {small_path}")
    
    return output_path

if __name__ == "__main__":
    print("Creating StrataRegula VS Code Extension Icon...")
    icon_path = create_strataregula_icon()
    print("Icon creation completed!")
    print("\nTo use the icon:")
    print("1. Update package.json: \"icon\": \"images/icon.png\"")
    print("2. Test the extension: F5 in VS Code")
    print("3. Package extension: vsce package")