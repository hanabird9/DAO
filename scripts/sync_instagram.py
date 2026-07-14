import os
import json
import requests
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

    session_id = os.environ.get("INSTAGRAM_SESSION_ID")
    if not session_id:
        print("Error: INSTAGRAM_SESSION_ID environment variable is missing.")
        return

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.instagram.com/"
    }
    
    cookies = {
        "sessionid": session_id
    }

    url = f"https://www.instagram.com/{INSTAGRAM_PROFILE}/?__a=1&__d=dis"
    print(f"Fetching Instagram profile JSON from {url}...")
    
    try:
        response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
        if not (200 <= response.status_code < 300):
            print(f"Failed to fetch profile: HTTP {response.status_code}")
            print(response.text[:500])
            return
        
        try:
            data = response.json()
        except ValueError as json_err:
            print(f"Response is not valid JSON! Error: {json_err}")
            print("Printing first 1000 characters of response.text:")
            print(response.text[:1000])
            return
    except Exception as e:
        print(f"Error fetching/parsing: {e}")
        return

    # Instagram formats user data differently depending on the query type
    user = None
    if 'graphql' in data:
        user = data['graphql']['user']
    elif 'data' in data and 'user' in data['data']:
        user = data['data']['user']
    else:
        user = data.get('user')
        
    if not user:
        print("Could not find user data in response. Keys in response:", list(data.keys()))
        return

    timeline = user.get('edge_owner_to_timeline_media', {})
    edges = timeline.get('edges', [])
    print(f"Found {len(edges)} posts.")

    posts_data = []
    active_shortcodes = []

    count = 0
    for edge in edges:
        if count >= MAX_POSTS:
            break
        
        node = edge.get('node', {})
        if node.get('is_video'):
            continue

        shortcode = node.get('shortcode')
        if not shortcode:
            continue

        image_url = node.get('display_url')
        if not image_url:
            continue

        caption = ""
        caption_edges = node.get('edge_media_to_caption', {}).get('edges', [])
        if caption_edges:
            caption = caption_edges[0].get('node', {}).get('text', "")

        likes = node.get('edge_liked_by', {}).get('count', 0)
        
        # taken_at_timestamp is Unix epoch
        timestamp = node.get('taken_at_timestamp', 0)
        date_str = datetime.utcfromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")

        image_filename = f"{shortcode}.jpg"
        image_path = os.path.join(IMAGE_DIR, image_filename)

        # Download image if it doesn't exist
        if not os.path.exists(image_path):
            try:
                img_resp = requests.get(image_url, headers=headers, stream=True, timeout=15)
                if img_resp.status_code == 200:
                    with open(image_path, 'wb') as f:
                        for chunk in img_resp.iter_content(1024):
                            f.write(chunk)
                    print(f"Downloaded image: {image_filename}")
                else:
                    print(f"Failed to download image: HTTP {img_resp.status_code}")
                    continue
            except Exception as e:
                print(f"Error downloading image for {shortcode}: {e}")
                continue
        else:
            print(f"Image already exists: {image_filename}")

        active_shortcodes.append(shortcode)
        
        posts_data.append({
            "shortcode": shortcode,
            "url": f"https://www.instagram.com/p/{shortcode}/",
            "image_local": f"assets/instagram/{image_filename}",
            "caption": caption,
            "date": date_str,
            "likes": likes
        })
        count += 1

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(posts_data, f, ensure_ascii=False, indent=2)
    print(f"Successfully wrote {len(posts_data)} posts to {OUTPUT_JSON}")

    clean_old_images(active_shortcodes)

if __name__ == "__main__":
    main()
