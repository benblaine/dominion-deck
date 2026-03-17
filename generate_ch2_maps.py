import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import shutil
import os

OUTPUT_DIR = r"C:\Users\naama\Development\dominion-deck\app\public\images"
BACKUP_DIR = r"C:\Users\naama\Development\dominion-deck\extracted_images"

# Define all 12 maps: (slide_num, lat, lon, label, extent [W, E, S, N])
maps = [
    # Slide 15: Jerusalem - wider view of the Levant
    (15, 31.7683, 35.2137, "Jerusalem",       [25, 45, 22, 42]),
    # Slide 16: Temple Mount - tighter zoom on Jerusalem area
    (16, 31.7781, 35.2354, "Temple Mount",    [30, 40, 27, 37]),
    # Slide 17: Jerusalem - medium zoom
    (17, 31.7683, 35.2137, "Jerusalem",       [28, 42, 25, 39]),
    # Slide 18: Hebron
    (18, 31.5326, 35.0998, "Hebron",          [28, 42, 24, 38]),
    # Slide 19: Babylon - wide view showing Mesopotamia
    (19, 32.5421, 44.4210, "Babylon",         [30, 52, 22, 42]),
    # Slide 20: Edom
    (20, 30.3285, 35.4444, "Edom",            [25, 45, 22, 40]),
    # Slide 21: Land of Uz
    (21, 32.6000, 36.1000, "Land of Uz",      [26, 46, 24, 42]),
    # Slide 22: Babylon - slightly different extent
    (22, 32.5421, 44.4210, "Babylon",         [32, 50, 25, 40]),
    # Slide 23: Mount Sinai
    (23, 28.5394, 33.9753, "Mount Sinai",     [22, 44, 20, 38]),
    # Slide 24: Alexandria
    (24, 31.2001, 29.9187, "Alexandria",      [20, 42, 22, 40]),
    # Slide 25: Bethlehem
    (25, 31.7054, 35.2024, "Bethlehem",       [26, 44, 23, 40]),
    # Slide 26: Rome
    (26, 41.9028, 12.4964, "Rome",            [0, 28, 32, 50]),
]

for slide_num, lat, lon, label, extent in maps:
    print(f"Generating slide {slide_num}: {label}...")

    fig, ax = plt.subplots(figsize=(5, 4), subplot_kw={'projection': ccrs.PlateCarree()})
    ax.set_extent(extent)
    ax.add_feature(cfeature.LAND, facecolor='#2a2a2a')
    ax.add_feature(cfeature.OCEAN, facecolor='#1a1a1a')
    ax.add_feature(cfeature.BORDERS, linewidth=0.3, edgecolor='#444')
    ax.add_feature(cfeature.COASTLINE, linewidth=0.5, edgecolor='#555')
    ax.set_facecolor('#1a1a1a')

    # Concentric circle marker: hollow outer ring
    ax.plot(lon, lat, marker='o', color='#c9a84c', markersize=8,
            markeredgecolor='#c9a84c', markeredgewidth=2, markerfacecolor='none',
            transform=ccrs.PlateCarree())
    # Solid inner dot
    ax.plot(lon, lat, marker='o', color='#c9a84c', markersize=3,
            transform=ccrs.PlateCarree())
    # Label
    ax.text(lon + 1, lat, label, color='#c9a84c',
            fontsize=10, fontfamily='serif', fontstyle='normal',
            transform=ccrs.PlateCarree())

    fig.patch.set_facecolor('#1a1a1a')

    output_path = os.path.join(OUTPUT_DIR, f"slide_{slide_num}_img_1.png")
    plt.savefig(output_path, dpi=100, bbox_inches='tight', pad_inches=0.1, facecolor='#1a1a1a')
    plt.close()

    # Copy to backup directory
    backup_path = os.path.join(BACKUP_DIR, f"slide_{slide_num}_img_1.png")
    shutil.copy2(output_path, backup_path)

    print(f"  Saved: {output_path}")
    print(f"  Backup: {backup_path}")

print("\nAll 12 maps generated successfully!")
