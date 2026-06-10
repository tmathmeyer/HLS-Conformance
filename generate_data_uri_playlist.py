import base64
import os

def main():
    # 480p Media Playlist
    playlist_480p = """#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:1
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-MAP:URI="/content/mp4_h264_480p_1s/init.mp4"
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_000.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_001.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_002.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_003.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_004.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_005.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_006.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_007.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_008.mp4
#EXTINF:1.000000,
/content/mp4_h264_480p_1s/seg_009.mp4
#EXT-X-ENDLIST
"""

    # 720p Media Playlist
    playlist_720p = """#EXTM3U
#EXT-X-VERSION:7
#EXT-X-TARGETDURATION:1
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-MAP:URI="/content/mp4_h264_720p_1s/init.mp4"
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_000.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_001.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_002.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_003.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_004.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_005.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_006.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_007.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_008.mp4
#EXTINF:1.000000,
/content/mp4_h264_720p_1s/seg_009.mp4
#EXT-X-ENDLIST
"""

    encoded_480p = base64.b64encode(playlist_480p.encode('utf-8')).decode('utf-8')
    encoded_720p = base64.b64encode(playlist_720p.encode('utf-8')).decode('utf-8')

    data_uri_480p = f"data:application/x-mpegURL;base64,{encoded_480p}"
    data_uri_720p = f"data:application/x-mpegURL;base64,{encoded_720p}"

    multivariant_playlist = f"""#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=640x480,CODECS="avc1.64001f"
{data_uri_480p}
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720,CODECS="avc1.64001f"
{data_uri_720p}
"""

    output_dir = 'manifests/multivariant_data_uri'
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, 'playlist.m3u8')
    with open(output_path, 'w') as f:
        f.write(multivariant_playlist)
    
    print(f"Created {output_path}")

if __name__ == '__main__':
    main()
