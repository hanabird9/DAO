import os
import json
import requests
import instaloader
from datetime import datetime

# Profile to sync
INSTAGRAM_PROFILE = "daorae_jb"
MAX_POSTS = 8
OUTPUT_JSON = "data/instagram_posts.json"
IMAGE_DIR = "assets/instagram"

def clean_old_images(active_shortcodes):
    """Delete any images in the directory that are no longer in the active list."""
    if not os.path.exists(IMAGE_DIR):
        return
    for filename in os.listdir(IMAGE_DIR):
        if filename.endswith(".jpg"):
            shortcode = filename[:-4]
            if shortcode not in active_shortcodes:
                try:
                    os.remove(os.path.join(IMAGE_DIR, filename))
                    print(f"Removed old instagram image: {filename}")
                except Exception as e:
                    print(f"Failed to remove {filename}: {e}")

def main():
    # Make sure output directories exist
    os.makedirs(IMAGE_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)

    # Initialize Instaloader
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_comments=False,
        download_geotags=False,
        save_metadata=False,
        compress_json=False
    )

    # Try to log in if credentials are provided in environment
    username = os.environ.get("INSTAGRAM_USERNAME")
    password = os.environ.get("INSTAGRAM_PASSWORD")

    logged_in = False
    if username:
        try:
            print(f"Attempting to load session for {username}...")
            L.load_session_from_file(username)
            print("Session loaded successfully!")
            logged_in = True
        except Exception as e:
            print(f"Failed to load session from file: {e}")

        if not logged_in and password:
            try:
                print(f"Attempting password login as {username}...")
                L.login(username, password)
                L.save_session_to_file()
                print("Password login successful!")
                logged_in = True
            except Exception as e:
                print(f"Password login failed: {e}. Attempting to fetch publicly.")
    else:
        print("No credentials found. Fetching publicly.")

    print(f"Loading profile: {INSTAGRAM_PROFILE}...")
    try:
        profile = instaloader.Profile.from_username(L.context, INSTAGRAM_PROFILE)
    except Exception as e:
        print(f"Failed to load profile {INSTAGRAM_PROFILE}: {e}")
        return

    posts_data = []
    active_shortcodes = []

    print("Fetching posts...")
    count = 0
    for post in profile.get_posts():
        if count >= MAX_POSTS:
            break
        
        # Only process image posts or carousel posts (we'll fetch the first slide)
        if post.is_video:
            continue

        print(f"Processing post {post.shortcode} ({post.date_utc})...")
        image_filename = f"{post.shortcode}.jpg"
        image_path = os.path.join(IMAGE_DIR, image_filename)

        # Download the image if it doesn't exist locally
        if not os.path.exists(image_path):
            try:
                # Use requests to download directly
                response = requests.get(post.url, stream=True, timeout=15)
                if response.status_code == 200:
                    with open(image_path, 'wb') as f:
                        for chunk in response.iter_content(1024):
                            f.write(chunk)
                    print(f"Downloaded image: {image_filename}")
                else:
                    print(f"Failed to download image from {post.url}: HTTP {response.status_code}")
                    continue
            except Exception as e:
                print(f"Error downloading image for {post.shortcode}: {e}")
                continue
        else:
            print(f"Image already exists: {image_filename}")

        active_shortcodes.append(post.shortcode)
        
        # Build JSON item
        posts_data.append({
            "shortcode": post.shortcode,
            "url": f"https://www.instagram.com/p/{post.shortcode}/",
            "image_local": f"assets/instagram/{image_filename}",
            "caption": post.caption or "",
            "date": post.date_utc.strftime("%Y-%m-%d %H:%M:%S"),
            "likes": post.likes
        })
        count += 1

    # Write posts data to JSON
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(posts_data, f, ensure_ascii=False, indent=2)
    print(f"Successfully wrote {len(posts_data)} posts to {OUTPUT_JSON}")

    # Clean up old images
    clean_old_images(active_shortcodes)

if __name__ == "__main__":
    main()
