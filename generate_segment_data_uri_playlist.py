import base64
import os

def get_data_uri(file_path, mime_type):
    with open(file_path, 'rb') as f:
        data = f.read()
    encoded = base64.b64encode(data).decode('utf-8')
    return f"data:{mime_type};base64,{encoded}"

def main():
    init_path = 'content/small_fmp4/init.mp4'
    seg0_path = 'content/small_fmp4/seg_000.mp4'
    seg1_path = 'content/small_fmp4/seg_001.mp4'

    init_uri = get_data_uri(init_path, 'video/mp4')
    seg0_uri = get_data_uri(seg0_path, 'video/mp4')
    seg1_uri = get_data_uri(seg1_path, 'video/mp4')

    playlist = f"""#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:1
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-MAP:URI="{init_uri}"
#EXTINF:1.000000,
{seg0_uri}
#EXTINF:1.000000,
{seg1_uri}
#EXT-X-ENDLIST
"""

    output_dir = 'manifests/segment_data_uri'
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'playlist.m3u8')
    with open(output_path, 'w') as f:
        f.write(playlist)
    
    print(f"Created {output_path}")

if __name__ == '__main__':
    main()
