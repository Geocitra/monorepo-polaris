import os
import sys
from rembg import remove, new_session
from PIL import Image

brain_dir = r'C:\Users\Geocitra1\.gemini\antigravity-ide\brain\a09db1ca-208c-4f4f-95c9-10ee286d044d'
input_path = os.path.join(brain_dir, 'download_profile.jpg')
output_png = os.path.join(brain_dir, 'transparent_ahmad_fauzi.png')
output_webp = os.path.join(brain_dir, 'transparent_ahmad_fauzi.webp')

print(f"Reading input image: {input_path}")
img = Image.open(input_path)

# Use human segmentation or u2net
session = new_session('u2net')
print("Running AI background removal...")
result = remove(img, session=session)

# Save transparent PNG
result.save(output_png, format='PNG')
print(f"Saved transparent PNG: {output_png} (size: {os.path.getsize(output_png)})")

# Save transparent WebP
result.save(output_webp, format='WEBP', quality=95)
print(f"Saved transparent WebP: {output_webp} (size: {os.path.getsize(output_webp)})")

# Composite onto dark modern background (#0B0F19) to verify perfection
dark_bg = Image.new('RGBA', (600, 600), (11, 15, 25, 255))
# Center cutout on dark_bg
offset = ((600 - result.width) // 2, (600 - result.height) // 2)
dark_bg.paste(result, offset, mask=result.split()[3])
dark_preview = os.path.join(brain_dir, 'dark_modern_preview.jpg')
dark_bg.convert('RGB').save(dark_preview, format='JPEG', quality=92)
print(f"Saved dark modern preview: {dark_preview}")
